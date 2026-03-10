import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { parseExcelFile } from '@/lib/excel-parser'
import { aggregateData } from '@/lib/data-processor'
import { sampleData } from '@/lib/sample-data'
import { parseTags } from '@/lib/utils'

const DataContext = createContext(null)

const STORAGE_KEY = 'sprint-analysis-data'
const CACHE_VERSION = 4 // Bump when parser/data-processor changes to invalidate stale cache

const EMPTY_FILTERS = {
  tags: [],
  valueArea: [],
  states: [],
  types: [],
  parentId: null,
  itemId: null,
}

export function DataProvider({ children }) {
  const [rawData, setRawData] = useState(null)
  const [processedData, setProcessedData] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Global filters — temporal
  const [sprintRange, setSprintRange] = useState([null, null]) // [min, max]
  const [selectedQuarter, setSelectedQuarter] = useState('all')

  // Global filters — dimensional
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  // Global filter — text search
  const [searchText, setSearchText] = useState('')

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Invalidate stale cache from older parser versions
        if (parsed.version !== CACHE_VERSION) {
          console.warn('Cache version mismatch, clearing stale data')
          localStorage.removeItem(STORAGE_KEY)
          return
        }
        const { raw, name } = parsed
        setRawData(raw)
        setFileName(name)
        setProcessedData(aggregateData(raw))
      }
    } catch (e) {
      console.warn('Failed to restore data from localStorage:', e)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save to localStorage when rawData changes
  useEffect(() => {
    if (rawData && fileName) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ raw: rawData, name: fileName, version: CACHE_VERSION }))
      } catch (e) {
        console.warn('Failed to save to localStorage:', e)
      }
    }
  }, [rawData, fileName])

  // Available sprints and quarters for filter UI
  const availableSprints = useMemo(() => {
    if (!processedData) return []
    return processedData.sprintTimeline.map(s => ({
      sprint: s.sprint,
      label: s.fullLabel,
      quarter: s.quarter,
      year: s.year,
    }))
  }, [processedData])

  const availableQuarters = useMemo(() => {
    if (!processedData) return []
    const qSet = new Map()
    processedData.sprintTimeline.forEach(s => {
      const key = `${s.year}-${s.quarter}`
      if (!qSet.has(key)) qSet.set(key, { key, year: s.year, quarter: s.quarter, label: `${s.quarter} ${s.year}` })
    })
    return Array.from(qSet.values()).sort((a, b) => a.key.localeCompare(b.key))
  }, [processedData])

  // Available values for dimensional filters (extracted from ALL data, not filtered)
  const availableFilters = useMemo(() => {
    const items = processedData?.items || []
    return {
      tags: [...new Set(items.flatMap(i => parseTags(i.tags)))].sort(),
      valueAreas: [...new Set(items.map(i => i.valueArea).filter(Boolean))].sort(),
      states: [...new Set(items.map(i => i.state).filter(Boolean))].sort(),
      types: [...new Set(items.map(i => i.type).filter(Boolean))].sort(),
      parentIds: [...new Set(items.map(i => i.parent).filter(Boolean))].sort((a, b) => a - b),
    }
  }, [processedData])

  // Check if any dimensional filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.tags.length > 0 ||
      filters.valueArea.length > 0 ||
      filters.states.length > 0 ||
      filters.types.length > 0 ||
      filters.parentId != null ||
      filters.itemId != null ||
      searchText.trim().length > 0
    )
  }, [filters, searchText])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.tags.length > 0) count++
    if (filters.valueArea.length > 0) count++
    if (filters.states.length > 0) count++
    if (filters.types.length > 0) count++
    if (filters.parentId != null) count++
    if (filters.itemId != null) count++
    if (searchText.trim().length > 0) count++
    return count
  }, [filters, searchText])

  // Filtered data: re-aggregate based on ALL filters (temporal + dimensional).
  // Tree-aware: when an item matches, its full ancestor chain (for context)
  // and all descendants (for completeness) are included.
  const filteredData = useMemo(() => {
    if (!processedData) return null

    const noTemporalFilter = selectedQuarter === 'all' && !sprintRange[0] && !sprintRange[1]
    const noDimensionalFilter = !hasActiveFilters

    // If no filter active, return original
    if (noTemporalFilter && noDimensionalFilter) {
      return processedData
    }

    const allItems = processedData.items

    // --- Pass 1: temporal filter (flat, as before) ---
    let temporalFiltered = allItems
    if (!noTemporalFilter) {
      temporalFiltered = allItems.filter(item => {
        if (!item.sprintInfo) {
          // Keep Epics/Features (no sprint) — they'll be pruned in pass 3 if no children survive
          return item.type === 'Epic' || item.type === 'Feature'
        }
        if (selectedQuarter !== 'all') {
          const qKey = `${item.sprintInfo.year}-${item.sprintInfo.quarter}`
          if (qKey !== selectedQuarter) return false
        }
        if (sprintRange[0] != null && item.sprintInfo.sprint < sprintRange[0]) return false
        if (sprintRange[1] != null && item.sprintInfo.sprint > sprintRange[1]) return false
        return true
      })
    }

    // If no dimensional filter, just return temporal result
    if (noDimensionalFilter) {
      return aggregateData(temporalFiltered)
    }

    // --- Pass 2: dimensional + text filter — find direct matches ---
    const temporalIds = new Set(temporalFiltered.map(i => i.id))
    const directMatches = new Set()
    const needle = searchText.trim().toLowerCase()

    temporalFiltered.forEach(item => {
      // State filter: apply only at leaf level (not Epic/Feature) so tree structure is preserved
      if (filters.states.length > 0 && item.type !== 'Epic' && item.type !== 'Feature' && !filters.states.includes(item.state)) return
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return
      if (filters.valueArea.length > 0 && !filters.valueArea.includes(item.valueArea)) return
      if (filters.tags.length > 0) {
        const itemTags = parseTags(item.tags)
        if (!filters.tags.some(t => itemTags.includes(t))) return
      }
      if (filters.parentId != null && item.parent !== filters.parentId) return
      if (filters.itemId != null && item.id !== filters.itemId) return
      // Text search: match against title, id, tags, classification, type
      if (needle) {
        const haystack = [
          item.title,
          item.id != null ? String(item.id) : '',
          item.tags,
          item.classification,
          item.type,
          item.valueArea,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(needle)) return
      }
      directMatches.add(item.id)
    })

    // --- Pass 3: tree expansion — include ancestors + descendants ---
    // Build parent→children and child→parent maps (only within temporal set)
    const childrenOf = new Map()
    const parentOf = new Map()
    temporalFiltered.forEach(item => {
      if (item.parent && temporalIds.has(item.parent)) {
        parentOf.set(item.id, item.parent)
        if (!childrenOf.has(item.parent)) childrenOf.set(item.parent, [])
        childrenOf.get(item.parent).push(item.id)
      }
    })

    const included = new Set(directMatches)

    // Walk up: include all ancestors of each match
    directMatches.forEach(id => {
      let current = id
      while (parentOf.has(current)) {
        const pid = parentOf.get(current)
        if (included.has(pid)) break
        included.add(pid)
        current = pid
      }
    })

    // Walk down: include all descendants of each match
    function addDescendants(id) {
      const children = childrenOf.get(id)
      if (!children) return
      for (const cid of children) {
        if (!included.has(cid)) {
          included.add(cid)
          addDescendants(cid)
        }
      }
    }
    directMatches.forEach(id => addDescendants(id))

    const filteredItems = temporalFiltered.filter(item => included.has(item.id))
    return aggregateData(filteredItems)
  }, [processedData, selectedQuarter, sprintRange, filters, searchText, hasActiveFilters])

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setSearchText('')
  }, [])

  const resetAllFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setSearchText('')
    setSelectedQuarter('all')
    setSprintRange([null, null])
  }, [])

  const applyPreset = useCallback((preset) => {
    setFilters({
      tags: preset.tags || [],
      valueArea: preset.valueArea || [],
      states: preset.states || [],
      types: preset.types || [],
      parentId: preset.parentId ?? null,
      itemId: preset.itemId ?? null,
    })
  }, [])

  const loadFromExcel = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    try {
      const items = await parseExcelFile(file)
      setRawData(items)
      setFileName(file.name)
      const processed = aggregateData(items)
      setProcessedData(processed)
      setSelectedQuarter('all')
      setSprintRange([null, null])
      setFilters(EMPTY_FILTERS)
      setSearchText('')
      return processed
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSampleData = useCallback(() => {
    setLoading(true)
    setError(null)
    try {
      setRawData(sampleData)
      setFileName('Sample Data (demo)')
      const processed = aggregateData(sampleData)
      setProcessedData(processed)
      setSelectedQuarter('all')
      setSprintRange([null, null])
      setFilters(EMPTY_FILTERS)
      setSearchText('')
      return processed
    } finally {
      setLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setRawData(null)
    setProcessedData(null)
    setFileName(null)
    setError(null)
    setSelectedQuarter('all')
    setSprintRange([null, null])
    setFilters(EMPTY_FILTERS)
    setSearchText('')
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return (
    <DataContext.Provider value={{
      rawData,
      processedData: filteredData,
      allData: processedData, // unfiltered for filter UI
      fileName,
      loading,
      error,
      loadFromExcel,
      loadSampleData,
      clearData,
      hasData: !!processedData,
      // Temporal filters
      sprintRange,
      setSprintRange,
      selectedQuarter,
      setSelectedQuarter,
      availableSprints,
      availableQuarters,
      // Dimensional filters
      filters,
      setFilter,
      resetFilters,
      resetAllFilters,
      availableFilters,
      hasActiveFilters,
      activeFilterCount,
      applyPreset,
      // Text search
      searchText,
      setSearchText,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
