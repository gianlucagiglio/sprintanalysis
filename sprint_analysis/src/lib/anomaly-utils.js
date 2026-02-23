import { PROFESSIONAL_FAMILIES } from './utils'

/**
 * Calculate z-scores for a metric array.
 */
export function calculateZScores(values) {
  const n = values.length
  if (n < 2) return values.map(() => 0)
  const mean = values.reduce((a, b) => a + b, 0) / n
  const std = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n)
  if (std === 0) return values.map(() => 0)
  return values.map(v => (v - mean) / std)
}

/**
 * Detect anomalies across sprint metrics.
 * Returns flags for sprints with |z-score| > threshold.
 */
export function detectAnomalies(sprintTimeline, items, threshold = 2.0) {
  const workItems = items.filter(i =>
    i.sprintInfo && i.type !== 'Epic' && i.type !== 'Feature'
  )

  // Build metrics per sprint
  const sprintMetrics = sprintTimeline.map(s => {
    const sItems = workItems.filter(i => i.sprintInfo.sprint === s.sprint)
    const totalEffort = sItems.reduce((sum, i) => sum + (i.totalEffort || 0), 0)
    const count = sItems.length
    const closedCount = sItems.filter(i => i.state === 'Closed').length

    // Effort by classification
    const classEffort = {}
    const classifications = ['Strategic', 'KTLO', 'Small Change', 'Other', 'Unclassified']
    classifications.forEach(c => { classEffort[c] = 0 })
    sItems.forEach(item => {
      const cls = item.classification || 'Unclassified'
      classEffort[cls] = (classEffort[cls] || 0) + (item.totalEffort || 0)
    })

    // Effort by family
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
      totalEffort,
      count,
      closedCount,
      classEffort,
      familyEffort,
    }
  })

  // Define metrics to check
  const metricDefs = [
    { key: 'totalEffort', label: 'Total Effort' },
    { key: 'count', label: 'Item Count' },
    { key: 'closedCount', label: 'Closed Count' },
  ]

  // Add per-classification metrics
  ;['Strategic', 'KTLO', 'Small Change'].forEach(cls => {
    metricDefs.push({
      key: `class_${cls}`,
      label: `${cls} Effort`,
      extract: m => m.classEffort[cls],
    })
  })

  // Add per-family metrics
  PROFESSIONAL_FAMILIES.forEach(f => {
    metricDefs.push({
      key: `family_${f}`,
      label: `${f} Effort`,
      extract: m => m.familyEffort[f],
    })
  })

  // Compute anomalies
  const anomalies = []
  const heatmapData = []

  metricDefs.forEach(def => {
    const values = sprintMetrics.map(m =>
      def.extract ? def.extract(m) : m[def.key]
    )
    const zScores = calculateZScores(values)
    const mean = values.reduce((a, b) => a + b, 0) / values.length

    sprintMetrics.forEach((m, idx) => {
      const z = zScores[idx]
      const val = values[idx]

      heatmapData.push({
        sprint: m.sprint,
        label: m.label,
        metric: def.label,
        value: Math.round(val * 10) / 10,
        zScore: Math.round(z * 100) / 100,
        isAnomaly: Math.abs(z) > threshold,
      })

      if (Math.abs(z) > threshold) {
        anomalies.push({
          sprint: m.sprint,
          label: m.label,
          metric: def.label,
          value: Math.round(val * 10) / 10,
          mean: Math.round(mean * 10) / 10,
          zScore: Math.round(z * 100) / 100,
          direction: z > 0 ? 'high' : 'low',
        })
      }
    })
  })

  // Summary
  const anomalousSprints = new Set(anomalies.map(a => a.sprint))
  const sprintFlagCount = {}
  anomalies.forEach(a => {
    sprintFlagCount[a.sprint] = (sprintFlagCount[a.sprint] || 0) + 1
  })
  const mostAnomalous = Object.entries(sprintFlagCount)
    .sort((a, b) => b[1] - a[1])[0]

  return {
    anomalies,
    heatmapData,
    summary: {
      anomalousSprintCount: anomalousSprints.size,
      totalFlags: anomalies.length,
      mostAnomalousSprint: mostAnomalous
        ? { sprint: Number(mostAnomalous[0]), flags: mostAnomalous[1] }
        : null,
    },
    sprintMetrics,
  }
}
