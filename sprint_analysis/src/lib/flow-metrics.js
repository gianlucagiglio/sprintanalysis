import { diffDays } from './date-utils'

/**
 * Calculate cycle time for an item (startDate → finishDate in days).
 * Returns null if either date is missing.
 */
export function calculateCycleTime(item) {
  if (!item.startDate || !item.finishDate) return null
  const days = diffDays(item.startDate, item.finishDate)
  return days != null && days >= 0 ? days : null
}

/**
 * Calculate lead time for an item.
 * For now, same as cycle time (creation → completion not tracked separately).
 */
export function calculateLeadTime(item) {
  return calculateCycleTime(item)
}

/**
 * Calculate throughput per sprint (count of Closed items).
 */
export function calculateThroughput(items, sprintTimeline) {
  const throughputMap = new Map()
  sprintTimeline.forEach(s => throughputMap.set(s.sprint, 0))

  items.forEach(item => {
    if (item.state === 'Closed' && item.sprintInfo) {
      const current = throughputMap.get(item.sprintInfo.sprint) || 0
      throughputMap.set(item.sprintInfo.sprint, current + 1)
    }
  })

  return sprintTimeline.map(s => ({
    sprint: s.sprint,
    label: s.fullLabel,
    throughput: throughputMap.get(s.sprint) || 0,
  }))
}

/**
 * Calculate WIP per sprint (count of Active items in that sprint).
 */
export function calculateWIP(items, sprintTimeline) {
  const wipMap = new Map()
  sprintTimeline.forEach(s => wipMap.set(s.sprint, 0))

  items.forEach(item => {
    if (item.state === 'Active' && item.sprintInfo) {
      const current = wipMap.get(item.sprintInfo.sprint) || 0
      wipMap.set(item.sprintInfo.sprint, current + 1)
    }
  })

  return sprintTimeline.map(s => ({
    sprint: s.sprint,
    label: s.fullLabel,
    wip: wipMap.get(s.sprint) || 0,
  }))
}

/**
 * Compute cycle time distribution as histogram buckets.
 */
export function cycleTimeDistribution(items, bucketSize = 2) {
  const cycleTimes = items
    .map(calculateCycleTime)
    .filter(ct => ct != null)

  if (cycleTimes.length === 0) return []

  const max = Math.max(...cycleTimes)
  const numBuckets = Math.ceil((max + 1) / bucketSize)
  const buckets = []

  for (let i = 0; i < numBuckets; i++) {
    const from = i * bucketSize
    const to = from + bucketSize - 1
    buckets.push({
      range: `${from}-${to}d`,
      from,
      to,
      count: 0,
    })
  }

  cycleTimes.forEach(ct => {
    const idx = Math.floor(ct / bucketSize)
    if (buckets[idx]) buckets[idx].count++
  })

  return buckets
}

/**
 * Compute average cycle time per sprint for trend analysis.
 */
export function cycleTimeTrend(items, sprintTimeline) {
  const sprintCycleTimes = new Map()
  sprintTimeline.forEach(s => sprintCycleTimes.set(s.sprint, []))

  items.forEach(item => {
    if (!item.sprintInfo) return
    const ct = calculateCycleTime(item)
    if (ct != null) {
      sprintCycleTimes.get(item.sprintInfo.sprint)?.push(ct)
    }
  })

  const allCycleTimes = items.map(calculateCycleTime).filter(ct => ct != null)
  const globalAvg = allCycleTimes.length > 0
    ? allCycleTimes.reduce((a, b) => a + b, 0) / allCycleTimes.length
    : 0

  return {
    trend: sprintTimeline.map(s => {
      const cts = sprintCycleTimes.get(s.sprint) || []
      const avg = cts.length > 0 ? cts.reduce((a, b) => a + b, 0) / cts.length : null
      const median = cts.length > 0 ? sortedMedian(cts) : null
      return {
        sprint: s.sprint,
        label: s.fullLabel,
        avgCycleTime: avg != null ? Math.round(avg * 10) / 10 : null,
        medianCycleTime: median,
        count: cts.length,
      }
    }),
    globalAvg: Math.round(globalAvg * 10) / 10,
  }
}

function sortedMedian(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

/**
 * Compute summary flow metrics.
 */
export function flowMetricsSummary(items) {
  const cycleTimes = items.map(calculateCycleTime).filter(ct => ct != null)
  const closed = items.filter(i => i.state === 'Closed').length
  const active = items.filter(i => i.state === 'Active').length

  return {
    avgCycleTime: cycleTimes.length > 0
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length * 10) / 10
      : 0,
    medianCycleTime: cycleTimes.length > 0 ? sortedMedian(cycleTimes) : 0,
    avgLeadTime: cycleTimes.length > 0
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length * 10) / 10
      : 0,
    throughput: closed,
    wip: active,
    totalWithCycleTime: cycleTimes.length,
  }
}
