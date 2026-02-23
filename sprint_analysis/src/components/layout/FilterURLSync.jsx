import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useData } from '@/context/DataContext'

/**
 * Syncs DataContext filters ↔ URL search params for deep-linking.
 * Schema: ?q=2025-Q1&from=133&to=142&states=Closed,Active&types=Bug&tags=strategic&valueArea=Payments&parentId=1000
 */
export default function FilterURLSync() {
  const {
    hasData, filters, setFilter, selectedQuarter, setSelectedQuarter,
    sprintRange, setSprintRange, applyPreset,
  } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const skipNextSync = useRef(false)
  const initialized = useRef(false)

  // On mount: read URL → apply to context
  useEffect(() => {
    if (!hasData || initialized.current) return
    initialized.current = true

    const q = searchParams.get('q')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const states = searchParams.get('states')
    const types = searchParams.get('types')
    const tags = searchParams.get('tags')
    const valueArea = searchParams.get('valueArea')
    const parentId = searchParams.get('parentId')
    const itemId = searchParams.get('itemId')

    const hasUrlFilters = q || from || to || states || types || tags || valueArea || parentId || itemId
    if (!hasUrlFilters) return

    skipNextSync.current = true

    if (q && q !== 'all') setSelectedQuarter(q)
    if (from || to) {
      setSprintRange([from ? parseInt(from) : null, to ? parseInt(to) : null])
    }

    const preset = {
      states: states ? states.split(',') : [],
      types: types ? types.split(',') : [],
      tags: tags ? tags.split(',') : [],
      valueArea: valueArea ? valueArea.split(',') : [],
      parentId: parentId ? parseInt(parentId) : null,
      itemId: itemId ? parseInt(itemId) : null,
    }
    applyPreset(preset)
  }, [hasData]) // eslint-disable-line react-hooks/exhaustive-deps

  // On filter change: write context → URL
  useEffect(() => {
    if (!hasData) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }

    const params = new URLSearchParams()

    if (selectedQuarter !== 'all') params.set('q', selectedQuarter)
    if (sprintRange[0] != null) params.set('from', String(sprintRange[0]))
    if (sprintRange[1] != null) params.set('to', String(sprintRange[1]))
    if (filters.states.length > 0) params.set('states', filters.states.join(','))
    if (filters.types.length > 0) params.set('types', filters.types.join(','))
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','))
    if (filters.valueArea.length > 0) params.set('valueArea', filters.valueArea.join(','))
    if (filters.parentId != null) params.set('parentId', String(filters.parentId))
    if (filters.itemId != null) params.set('itemId', String(filters.itemId))

    setSearchParams(params, { replace: true })
  }, [hasData, filters, selectedQuarter, sprintRange, setSearchParams])

  return null
}
