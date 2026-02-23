import { detectCarryOver } from './carryover-utils'
import { PROFESSIONAL_FAMILIES } from './utils'

/**
 * Calculate sprint health score (0-100) for each sprint.
 * 4 factors, each 0-25:
 *   1. Velocity trend (closeness to average)
 *   2. Carry-over % (lower = better)
 *   3. Classification coverage (higher = better)
 *   4. Effort balance (Shannon entropy across families)
 */
export function calculateHealthScores(items, sprintTimeline) {
  const carryOverData = detectCarryOver(items, sprintTimeline)

  // Precompute per-sprint metrics
  const workItems = items.filter(i =>
    i.sprintInfo && i.type !== 'Epic' && i.type !== 'Feature'
  )

  const sprintMetrics = sprintTimeline.map(s => {
    const sItems = workItems.filter(i => i.sprintInfo.sprint === s.sprint)
    const effort = sItems.reduce((sum, i) => sum + (i.totalEffort || 0), 0)
    const classified = sItems.filter(i => i.classification && i.classification !== 'Unclassified').length
    const total = sItems.length

    // Effort per family
    const familyEffort = {}
    PROFESSIONAL_FAMILIES.forEach(f => { familyEffort[f] = 0 })
    sItems.forEach(item => {
      if (item.effortByFamily) {
        PROFESSIONAL_FAMILIES.forEach(f => {
          familyEffort[f] += (item.effortByFamily[f] || 0)
        })
      }
    })

    return {
      sprint: s.sprint,
      label: s.fullLabel,
      effort,
      classified,
      total,
      familyEffort,
    }
  })

  // Average velocity
  const velocities = sprintMetrics.map(s => s.effort)
  const avgVelocity = velocities.length > 0
    ? velocities.reduce((a, b) => a + b, 0) / velocities.length
    : 0
  const stdVelocity = velocities.length > 1
    ? Math.sqrt(velocities.reduce((sum, v) => sum + (v - avgVelocity) ** 2, 0) / velocities.length)
    : 1

  return sprintMetrics.map((s, idx) => {
    // Factor 1: Velocity trend (how close to average)
    const velocityDeviation = stdVelocity > 0
      ? Math.abs(s.effort - avgVelocity) / stdVelocity
      : 0
    const velocityScore = Math.max(0, 25 - velocityDeviation * 12.5)

    // Factor 2: Carry-over (lower % = better)
    const coData = carryOverData.perSprint.find(c => c.sprint === s.sprint)
    const coPercent = coData ? coData.carryOverPercent : 0
    const carryOverScore = Math.max(0, 25 - coPercent * 0.5)

    // Factor 3: Classification coverage
    const coveragePercent = s.total > 0 ? (s.classified / s.total * 100) : 100
    const classificationScore = coveragePercent * 0.25

    // Factor 4: Effort balance (Shannon entropy)
    const totalFamilyEffort = Object.values(s.familyEffort).reduce((a, b) => a + b, 0)
    let entropy = 0
    if (totalFamilyEffort > 0) {
      const activeFamilies = PROFESSIONAL_FAMILIES.filter(f => s.familyEffort[f] > 0)
      activeFamilies.forEach(f => {
        const p = s.familyEffort[f] / totalFamilyEffort
        if (p > 0) entropy -= p * Math.log2(p)
      })
      const maxEntropy = Math.log2(PROFESSIONAL_FAMILIES.length)
      const normalizedEntropy = maxEntropy > 0 ? entropy / maxEntropy : 0
      var balanceScore = normalizedEntropy * 25
    } else {
      var balanceScore = 0
    }

    const totalScore = Math.round(velocityScore + carryOverScore + classificationScore + balanceScore)

    return {
      sprint: s.sprint,
      label: s.label,
      score: Math.min(100, Math.max(0, totalScore)),
      velocityScore: Math.round(velocityScore * 10) / 10,
      carryOverScore: Math.round(carryOverScore * 10) / 10,
      classificationScore: Math.round(classificationScore * 10) / 10,
      balanceScore: Math.round(balanceScore * 10) / 10,
      effort: Math.round(s.effort * 10) / 10,
      carryOverPercent: coPercent,
      coveragePercent: Math.round(coveragePercent * 10) / 10,
    }
  })
}

export function healthScoreColor(score) {
  if (score >= 75) return '#22c55e' // green
  if (score >= 50) return '#f59e0b' // yellow
  return '#ef4444' // red
}

export function healthScoreLabel(score) {
  if (score >= 75) return 'Healthy'
  if (score >= 50) return 'At Risk'
  return 'Critical'
}
