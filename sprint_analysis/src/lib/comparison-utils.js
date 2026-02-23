import { PROFESSIONAL_FAMILIES } from './utils'

/**
 * Compute aggregate metrics for a set of sprints.
 */
export function computeAggregate(items, sprintTimeline, sprintNums) {
  const sprintSet = new Set(sprintNums)
  const selectedSprints = sprintTimeline.filter(s => sprintSet.has(s.sprint))
  const workItems = items.filter(i =>
    i.sprintInfo && sprintSet.has(i.sprintInfo.sprint) &&
    i.type !== 'Epic' && i.type !== 'Feature'
  )

  const totalEffort = workItems.reduce((sum, i) => sum + (i.totalEffort || 0), 0)
  const closedItems = workItems.filter(i => i.state === 'Closed')
  const activeItems = workItems.filter(i => i.state === 'Active')

  // Classification breakdown
  const classificationEffort = {}
  const classifications = ['Strategic', 'KTLO', 'Small Change', 'Other', 'Unclassified']
  classifications.forEach(c => { classificationEffort[c] = 0 })
  workItems.forEach(item => {
    const cls = item.classification || 'Unclassified'
    classificationEffort[cls] = (classificationEffort[cls] || 0) + (item.totalEffort || 0)
  })

  // Family breakdown
  const familyEffort = {}
  PROFESSIONAL_FAMILIES.forEach(f => { familyEffort[f] = 0 })
  workItems.forEach(item => {
    if (item.effortByFamily) {
      PROFESSIONAL_FAMILIES.forEach(f => {
        familyEffort[f] += (item.effortByFamily[f] || 0)
      })
    }
  })

  const avgVelocity = selectedSprints.length > 0 ? totalEffort / selectedSprints.length : 0

  return {
    sprintCount: selectedSprints.length,
    totalItems: workItems.length,
    totalEffort: Math.round(totalEffort * 10) / 10,
    closedCount: closedItems.length,
    activeCount: activeItems.length,
    avgVelocity: Math.round(avgVelocity * 10) / 10,
    completionRate: workItems.length > 0
      ? Math.round(closedItems.length / workItems.length * 1000) / 10
      : 0,
    classificationEffort,
    familyEffort,
    label: selectedSprints.length === 1
      ? selectedSprints[0].fullLabel
      : `${selectedSprints.length} sprints`,
  }
}

/**
 * Compute delta between two aggregates.
 */
export function computeDelta(aggA, aggB) {
  function delta(a, b) {
    if (a === 0 && b === 0) return { value: 0, percent: 0 }
    const diff = b - a
    const pct = a !== 0 ? (diff / a * 100) : (b !== 0 ? 100 : 0)
    return { value: Math.round(diff * 10) / 10, percent: Math.round(pct * 10) / 10 }
  }

  return {
    totalEffort: delta(aggA.totalEffort, aggB.totalEffort),
    totalItems: delta(aggA.totalItems, aggB.totalItems),
    closedCount: delta(aggA.closedCount, aggB.closedCount),
    avgVelocity: delta(aggA.avgVelocity, aggB.avgVelocity),
    completionRate: delta(aggA.completionRate, aggB.completionRate),
  }
}

/**
 * Get sprint numbers for a quarter key like "2025-Q1".
 */
export function getSprintsForQuarter(sprintTimeline, quarterKey) {
  return sprintTimeline
    .filter(s => `${s.year}-${s.quarter}` === quarterKey)
    .map(s => s.sprint)
}

/**
 * Get sprint numbers for a range.
 */
export function getSprintsForRange(sprintTimeline, from, to) {
  return sprintTimeline
    .filter(s => s.sprint >= from && s.sprint <= to)
    .map(s => s.sprint)
}
