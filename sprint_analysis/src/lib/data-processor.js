import { EFFORT_FIELDS, PROFESSIONAL_FAMILIES } from './utils'
import { sprintDateRange, toISO, parseDate } from './date-utils'

/**
 * Extract sprint info from iteration path like "Main\2025-Q1\136"
 */
export function extractSprintInfo(iterationPath) {
  if (!iterationPath) return null
  // Match patterns like Main\2025-Q1\136
  const match = iterationPath.match(/Main\\(\d{4})-(Q\d)\\(\d+)/)
  if (!match) return null
  return {
    year: parseInt(match[1]),
    quarter: match[2],
    sprint: parseInt(match[3]),
    label: `S${match[3]}`,
    fullLabel: `${match[2]} S${match[3]}`,
  }
}

/**
 * Classify a Feature by its Tags field
 */
function classifyByTags(tags) {
  if (!tags || typeof tags !== 'string' || tags.trim() === '') return 'Unclassified'

  // Check each tag individually (separated by ;)
  // Normalize: lowercase + strip spaces/underscores/hyphens for fuzzy matching
  const tagList = tags.split(';').map(t => t.trim().toLowerCase())
  for (const tag of tagList) {
    const normalized = tag.replace(/[\s_-]/g, '')
    if (tag === 'strategic') return 'Strategic'
    if (tag === 'ktlo') return 'KTLO'
    if (normalized === 'smallchange' || tag === 'small') return 'Small Change'
  }
  return 'Other'
}

/**
 * Build hierarchy: Epic → Feature → Children
 * and classify items based on Feature-level tags
 */
export function buildHierarchy(items) {
  const byId = new Map()
  items.forEach(item => byId.set(item.id, { ...item, children: [] }))

  const epics = []
  const features = []
  const orphans = []

  // First pass: identify types
  byId.forEach(item => {
    if (item.type === 'Epic') epics.push(item)
    else if (item.type === 'Feature') features.push(item)
  })

  // Link children to parents
  byId.forEach(item => {
    if (item.parent && byId.has(item.parent)) {
      byId.get(item.parent).children.push(item)
    } else if (item.type !== 'Epic' && !item.parent) {
      orphans.push(item)
    }
  })

  return { epics, features, byId, orphans }
}

/**
 * Classify all items.
 * Resolution chain: Epic (wins) → Feature (fallback) → Children inherit.
 * If an Epic has a classification tag, it overrides all Features below it.
 */
export function classifyItems(items) {
  const byId = new Map()
  items.forEach(item => byId.set(item.id, { ...item }))

  // 1. Classify Epics by their own tags
  byId.forEach(item => {
    if (item.type === 'Epic') {
      item.classification = classifyByTags(item.tags)
    }
  })

  // 2. Classify Features: Epic wins, otherwise use own tags
  byId.forEach(item => {
    if (item.type === 'Feature') {
      const parentEpic = item.parent && byId.has(item.parent) ? byId.get(item.parent) : null
      if (parentEpic && parentEpic.type === 'Epic' &&
          parentEpic.classification && parentEpic.classification !== 'Unclassified' && parentEpic.classification !== 'Other') {
        item.classification = parentEpic.classification
      } else {
        item.classification = classifyByTags(item.tags)
      }
    }
  })

  // 3. Propagate classification from Feature to children
  byId.forEach(item => {
    if (item.type !== 'Feature' && item.type !== 'Epic') {
      if (item.parent && byId.has(item.parent)) {
        const parent = byId.get(item.parent)
        if (parent.type === 'Feature') {
          item.classification = parent.classification
        } else if (parent.parent && byId.has(parent.parent)) {
          const grandparent = byId.get(parent.parent)
          if (grandparent.type === 'Feature') {
            item.classification = grandparent.classification
          }
        }
      }
      if (!item.classification) {
        item.classification = classifyByTags(item.tags)
      }
    }
  })

  // 4. Epics without own classification: inherit from child Features (by effort weight, fallback to count)
  byId.forEach(item => {
    if (item.type === 'Epic' && (item.classification === 'Unclassified' || item.classification === 'Other')) {
      const childFeatures = []
      byId.forEach(child => {
        if (child.type === 'Feature' && child.parent === item.id && child.classification) {
          childFeatures.push(child)
        }
      })
      if (childFeatures.length > 0) {
        const countByClass = {}
        const effortByClass = {}
        childFeatures.forEach(f => {
          const cls = f.classification
          countByClass[cls] = (countByClass[cls] || 0) + 1
          const effort = (f.effortAnalysis || 0) + (f.effortAutomation || 0) +
            (f.effortBE || 0) + (f.effortDesign || 0) + (f.effortFE || 0) +
            (f.effortQA || 0) + (f.effortNative || 0) + (f.effortPlatformEng || 0) + (f.effort || 0)
          effortByClass[cls] = (effortByClass[cls] || 0) + effort
        })
        const hasEffort = Object.values(effortByClass).some(e => e > 0)
        const candidates = Object.entries(hasEffort ? effortByClass : countByClass)
          .filter(([cls]) => cls !== 'Unclassified')
          .sort((a, b) => b[1] - a[1])
        if (candidates.length > 0) {
          item.classification = candidates[0][0]
        }
      }
    }
  })

  return Array.from(byId.values())
}

/**
 * Calculate total effort for an item.
 * Uses per-family breakdown if available, otherwise falls back to the single Effort field.
 */
export function calculateEffort(item) {
  const familyTotal =
    (item.effortAnalysis || 0) +
    (item.effortAutomation || 0) +
    (item.effortBE || 0) +
    (item.effortDesign || 0) +
    (item.effortFE || 0) +
    (item.effortQA || 0) +
    (item.effortNative || 0) +
    (item.effortPlatformEng || 0)
  return familyTotal > 0 ? familyTotal : (item.effort || 0)
}

/**
 * Get effort by professional family
 */
export function getEffortByFamily(item) {
  return {
    BE: item.effortBE || 0,
    FE: item.effortFE || 0,
    Design: item.effortDesign || 0,
    Analysis: item.effortAnalysis || 0,
    QA: item.effortQA || 0,
    Automation: item.effortAutomation || 0,
    Native: item.effortNative || 0,
    'Platform Eng': item.effortPlatformEng || 0,
  }
}

/**
 * Main aggregation function - processes all items and generates dashboard data
 */
export function aggregateData(items) {
  // Filter out junk rows (no type) that may exist in cached localStorage data
  items = items.filter(i => i.type)
  const classifiedItems = classifyItems(items)

  // Add computed fields
  const processedItems = classifiedItems.map(item => ({
    ...item,
    totalEffort: calculateEffort(item),
    sprintInfo: extractSprintInfo(item.iterationPath),
    effortByFamily: getEffortByFamily(item),
  }))

  // Estimate missing dates from sprint date range.
  // When the Excel export has corrupted dates (e.g. "########"), we can still
  // approximate startDate/finishDate from the Iteration Path sprint number.
  // For closed items, we estimate finishDate based on effort (lower effort =
  // finishes earlier in the sprint) to produce a more realistic distribution.
  const hasRealDates = processedItems.some(i =>
    i.startDate && parseDate(i.startDate) && i.startDate !== '########'
  )
  let datesEstimated = false
  if (!hasRealDates) {
    datesEstimated = true
    // Collect max effort per sprint for proportional estimation
    const sprintMaxEffort = new Map()
    processedItems.forEach(item => {
      if (!item.sprintInfo) return
      const key = item.sprintInfo.sprint
      const curr = sprintMaxEffort.get(key) || 0
      if (item.totalEffort > curr) sprintMaxEffort.set(key, item.totalEffort)
    })

    processedItems.forEach(item => {
      if (!item.sprintInfo) return
      const range = sprintDateRange(item.sprintInfo.sprint)
      const sprintStart = range.start.getTime()
      const sprintDuration = range.end.getTime() - sprintStart

      if (!item.startDate || !parseDate(item.startDate)) {
        // Estimate start: beginning of sprint + small offset based on item ID
        const offsetDays = (item.id % 5) // 0-4 days offset
        const startMs = sprintStart + offsetDays * 86400000
        item.startDate = toISO(new Date(Math.min(startMs, range.end.getTime())))
        item._estimatedDates = true
      }
      if (!item.finishDate || !parseDate(item.finishDate)) {
        if (item.state === 'Closed') {
          // Estimate finish: proportional to effort within sprint
          const maxEff = sprintMaxEffort.get(item.sprintInfo.sprint) || 1
          const effortRatio = Math.min((item.totalEffort || 1) / maxEff, 1)
          // Higher effort = finishes later; add deterministic jitter from ID
          const jitter = ((item.id % 7) / 7) * 0.2 // 0-20% jitter
          const progressRatio = Math.min(0.3 + effortRatio * 0.5 + jitter, 1.0)
          const finishMs = sprintStart + sprintDuration * progressRatio
          item.finishDate = toISO(new Date(finishMs))
          item._estimatedDates = true
        }
      }
      // Also fix createdDate/closedDate for incident MTTR
      if (!item.createdDate || !parseDate(item.createdDate)) {
        item.createdDate = item.startDate
      }
      if (item.state === 'Closed' && (!item.closedDate || !parseDate(item.closedDate))) {
        item.closedDate = item.finishDate
      }
    })
  }

  // Resolve "Same as parent" Value Area by walking up the parent chain
  const processedById = new Map()
  processedItems.forEach(item => processedById.set(item.id, item))
  processedItems.forEach(item => {
    if (item.valueArea === 'Same as parent' || !item.valueArea) {
      let current = item
      const visited = new Set()
      while (current.parent && !visited.has(current.parent)) {
        visited.add(current.parent)
        const parent = processedById.get(current.parent)
        if (!parent) break
        if (parent.valueArea && parent.valueArea !== 'Same as parent') {
          item.valueArea = parent.valueArea
          break
        }
        current = parent
      }
    }
  })

  // Build hierarchy
  const hierarchy = buildHierarchy(processedItems)

  // Classification summary (count and effort)
  const classificationSummary = {}
  const classifications = ['Strategic', 'KTLO', 'Small Change', 'Other', 'Unclassified']
  classifications.forEach(c => {
    classificationSummary[c] = { count: 0, effort: 0 }
  })
  processedItems.forEach(item => {
    const cls = item.classification || 'Unclassified'
    if (classificationSummary[cls]) {
      classificationSummary[cls].count++
      classificationSummary[cls].effort += item.totalEffort
    }
  })

  // Total metrics
  const totalItems = processedItems.length
  const totalEffort = processedItems.reduce((sum, i) => sum + i.totalEffort, 0)
  const classifiedCount = processedItems.filter(i => i.classification && i.classification !== 'Unclassified').length
  const coveragePercent = totalItems > 0 ? (classifiedCount / totalItems * 100) : 0

  // Effort by professional family
  const effortByFamily = {}
  PROFESSIONAL_FAMILIES.forEach(f => { effortByFamily[f] = 0 })
  processedItems.forEach(item => {
    Object.entries(item.effortByFamily).forEach(([family, effort]) => {
      effortByFamily[family] = (effortByFamily[family] || 0) + effort
    })
  })

  // Sprint timeline data (with per-family effort)
  const sprintMap = new Map()
  processedItems.forEach(item => {
    if (!item.sprintInfo) return
    const key = item.sprintInfo.sprint
    if (!sprintMap.has(key)) {
      const entry = {
        sprint: key,
        label: item.sprintInfo.label,
        fullLabel: item.sprintInfo.fullLabel,
        quarter: item.sprintInfo.quarter,
        year: item.sprintInfo.year,
        Strategic: 0,
        KTLO: 0,
        'Small Change': 0,
        Other: 0,
        Unclassified: 0,
        total: 0,
      }
      // Per-family effort columns
      PROFESSIONAL_FAMILIES.forEach(f => { entry[`effort_${f}`] = 0 })
      sprintMap.set(key, entry)
    }
    const entry = sprintMap.get(key)
    const cls = item.classification || 'Unclassified'
    entry[cls] = (entry[cls] || 0) + item.totalEffort
    entry.total += item.totalEffort
    // Accumulate per-family effort
    if (item.effortByFamily) {
      PROFESSIONAL_FAMILIES.forEach(f => {
        entry[`effort_${f}`] += (item.effortByFamily[f] || 0)
      })
    }
  })
  const sprintTimeline = Array.from(sprintMap.values()).sort((a, b) => a.sprint - b.sprint)

  // Top epics by effort
  const epicEffort = new Map()
  processedItems.forEach(item => {
    // Walk up to find Epic ancestor
    let epicId = null
    if (item.type === 'Epic') {
      epicId = item.id
    } else {
      // Check parent chain
      let current = item
      const visited = new Set()
      while (current.parent && !visited.has(current.parent)) {
        visited.add(current.parent)
        const parent = hierarchy.byId.get(current.parent)
        if (!parent) break
        if (parent.type === 'Epic') {
          epicId = parent.id
          break
        }
        current = parent
      }
    }
    if (epicId && hierarchy.byId.has(epicId)) {
      if (!epicEffort.has(epicId)) {
        const epic = hierarchy.byId.get(epicId)
        epicEffort.set(epicId, {
          id: epicId,
          title: epic.title,
          classification: epic.classification,
          effort: 0,
          childCount: 0,
        })
      }
      const entry = epicEffort.get(epicId)
      entry.effort += item.totalEffort
      if (item.type !== 'Epic') entry.childCount++
    }
  })
  const topEpics = Array.from(epicEffort.values())
    .sort((a, b) => b.effort - a.effort)
    .slice(0, 10)

  // Unclassified features
  const unclassifiedFeatures = processedItems
    .filter(i => i.type === 'Feature' && (i.classification === 'Unclassified' || !i.classification))
    .map(f => {
      const children = processedItems.filter(i => i.parent === f.id)
      const childEffort = children.reduce((sum, c) => sum + c.totalEffort, 0)
      // Find parent epic
      let epicTitle = ''
      if (f.parent && hierarchy.byId.has(f.parent)) {
        epicTitle = hierarchy.byId.get(f.parent).title || ''
      }
      return {
        ...f,
        childCount: children.length,
        childEffort,
        epicTitle,
      }
    })

  // Work item types distribution
  const typeDistribution = {}
  processedItems.forEach(item => {
    typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1
  })

  return {
    items: processedItems,
    hierarchy,
    classificationSummary,
    totalItems,
    totalEffort,
    classifiedCount,
    coveragePercent,
    effortByFamily,
    sprintTimeline,
    topEpics,
    unclassifiedFeatures,
    typeDistribution,
    classifications,
    datesEstimated,
  }
}
