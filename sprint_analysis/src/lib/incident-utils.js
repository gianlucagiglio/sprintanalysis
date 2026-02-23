import { parseTags, PROFESSIONAL_FAMILIES } from './utils'
import { calculateCycleTime } from './flow-metrics'
import { getEffortByFamily } from './data-processor'

/**
 * An item is an incident if it has the tag "incident" or "emergency".
 * This separates the concept of Bug (work item type) from Incident/Emergency (operational event).
 */
export function isIncident(item) {
  const tags = parseTags(item.tags)
  return tags.some(t => t.toLowerCase() === 'incident' || t.toLowerCase() === 'emergency')
}

/**
 * Severity colors
 */
export const SEVERITY_COLORS = {
  P1: '#ef4444',
  P2: '#f97316',
  P3: '#f59e0b',
  P4: '#6b7280',
}

export const SEVERITY_LABELS = {
  P1: 'Critical',
  P2: 'High',
  P3: 'Medium',
  P4: 'Low',
}

/**
 * Map the dedicated Severity field (e.g. "1 – Critical") to P1-P4.
 */
function mapSeverityField(severity) {
  if (!severity || typeof severity !== 'string') return null
  const num = parseInt(severity)
  if (num === 1) return 'P1'
  if (num === 2) return 'P2'
  if (num === 3) return 'P3'
  if (num === 4) return 'P4'
  return null
}

/**
 * Parse severity from dedicated field, tags, or effort-based heuristic.
 */
export function parseSeverity(item) {
  // 1. Dedicated Severity field (new data model: "1 – Critical", "2 – High", etc.)
  const fromField = mapSeverityField(item.severity)
  if (fromField) return fromField

  // 2. Tags (legacy: P1, P2, P3, P4)
  const tags = parseTags(item.tags)
  for (const tag of tags) {
    const upper = tag.toUpperCase()
    if (upper === 'P1' || upper === 'P2' || upper === 'P3' || upper === 'P4') {
      return upper
    }
  }

  // 3. Fallback: derive from effort
  const effort = item.effort || item.totalEffort || 0
  if (effort > 20) return 'P1'
  if (effort > 13) return 'P2'
  if (effort > 7) return 'P3'
  return 'P4'
}

/**
 * Calculate impact score (0-100) for a single Bug.
 */
export function calculateImpactScore(item, maxEffort) {
  const effort = item.effort || item.totalEffort || 0
  const severity = item.severity || parseSeverity(item)
  const cycleTime = calculateCycleTime(item)
  const classification = item.classification || 'Unclassified'

  // Factor 1: Effort (0-30)
  const effortScore = maxEffort > 0 ? (effort / maxEffort) * 30 : 0

  // Factor 2: Resolution time (0-25)
  let resolutionScore
  if (item.state === 'Closed' && cycleTime != null) {
    resolutionScore = Math.min(cycleTime / 20, 1) * 25
  } else {
    resolutionScore = 25 // active/new = max penalty
  }

  // Factor 3: Severity (0-25)
  const severityScores = { P1: 25, P2: 18, P3: 10, P4: 5 }
  const severityScore = severityScores[severity] || 5

  // Factor 4: Classification (0-20)
  const classificationScores = {
    Strategic: 20,
    KTLO: 15,
    Other: 8,
    'Small Change': 4,
    Unclassified: 0,
  }
  const classificationScore = classificationScores[classification] || 0

  return Math.min(
    Math.round(effortScore + resolutionScore + severityScore + classificationScore),
    100
  )
}

/**
 * Enrich incident items (tagged "incident" or "emergency") with severity and impactScore.
 */
export function enrichIncidents(items) {
  const incidents = items.filter(isIncident)
  const maxEffort = incidents.length > 0
    ? Math.max(...incidents.map(b => b.effort || b.totalEffort || 0))
    : 1

  return items.map(item => {
    if (!isIncident(item)) return item
    const severityRaw = item.severity
    const severityParsed = parseSeverity(item)
    const impactScore = calculateImpactScore({ ...item, severity: severityParsed }, maxEffort)
    return { ...item, severityRaw, severity: severityParsed, impactScore }
  })
}

/**
 * Summary metrics across all incidents.
 */
export function incidentSummary(items) {
  const bugs = items.filter(isIncident)
  const allItems = items.filter(i => i.type !== 'Epic' && i.type !== 'Feature')
  const totalEffort = allItems.reduce((s, i) => s + (i.effort || i.totalEffort || 0), 0)
  const incidentEffort = bugs.reduce((s, i) => s + (i.effort || i.totalEffort || 0), 0)

  const closedBugs = bugs.filter(b => b.state === 'Closed')
  const activeBugs = bugs.filter(b => b.state === 'Active')

  const cycleTimes = closedBugs
    .map(b => calculateCycleTime(b))
    .filter(ct => ct != null)

  const globalMTTR = cycleTimes.length > 0
    ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length * 10) / 10
    : 0

  const sorted = [...cycleTimes].sort((a, b) => a - b)
  const medianMTTR = sorted.length > 0
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    : 0

  const resolutionRate = bugs.length > 0
    ? Math.round(closedBugs.length / bugs.length * 100)
    : 0

  const effortImpactPercent = totalEffort > 0
    ? Math.round(incidentEffort / totalEffort * 1000) / 10
    : 0

  // Average impact score
  const impactScores = bugs.map(b => b.impactScore).filter(s => s != null)
  const avgImpactScore = impactScores.length > 0
    ? Math.round(impactScores.reduce((a, b) => a + b, 0) / impactScores.length)
    : 0

  const activeEffort = activeBugs.reduce((s, i) => s + (i.effort || i.totalEffort || 0), 0)

  return {
    totalIncidents: bugs.length,
    activeIncidents: activeBugs.length,
    activeEffort,
    closedIncidents: closedBugs.length,
    globalMTTR,
    medianMTTR,
    resolutionRate,
    incidentEffort,
    effortImpactPercent,
    avgImpactScore,
  }
}

/**
 * Per-sprint incident trend data.
 */
export function incidentTrend(items, sprintTimeline) {
  const workItems = items.filter(i => i.type !== 'Epic' && i.type !== 'Feature')

  return sprintTimeline.map(s => {
    const sprintItems = workItems.filter(i => i.sprintInfo?.sprint === s.sprint)
    const incidents = sprintItems.filter(isIncident)
    const totalCount = sprintItems.length
    const incidentEffort = incidents.reduce((sum, b) => sum + (b.effort || b.totalEffort || 0), 0)
    const totalEffort = sprintItems.reduce((sum, i) => sum + (i.effort || i.totalEffort || 0), 0)

    return {
      sprint: s.sprint,
      label: s.fullLabel,
      count: incidents.length,
      percent: totalCount > 0 ? Math.round(incidents.length / totalCount * 1000) / 10 : 0,
      effort: incidentEffort,
      effortPercent: totalEffort > 0 ? Math.round(incidentEffort / totalEffort * 1000) / 10 : 0,
    }
  })
}

/**
 * MTTR trend per sprint (avg cycle time of closed bugs per sprint).
 */
export function incidentMTTRTrend(items, sprintTimeline) {
  const bugs = items.filter(isIncident)

  // Global average for reference line
  const allCycleTimes = bugs
    .filter(b => b.state === 'Closed')
    .map(b => calculateCycleTime(b))
    .filter(ct => ct != null)
  const globalAvg = allCycleTimes.length > 0
    ? Math.round(allCycleTimes.reduce((a, b) => a + b, 0) / allCycleTimes.length * 10) / 10
    : 0

  const trend = sprintTimeline.map(s => {
    const sprintBugs = bugs.filter(b => b.sprintInfo?.sprint === s.sprint && b.state === 'Closed')
    const cycleTimes = sprintBugs.map(b => calculateCycleTime(b)).filter(ct => ct != null)
    const mttr = cycleTimes.length > 0
      ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length * 10) / 10
      : null

    return {
      sprint: s.sprint,
      label: s.fullLabel,
      mttr,
      count: cycleTimes.length,
    }
  })

  return { trend, globalAvg }
}

/**
 * Severity distribution: count + effort per P1-P4.
 */
export function severityDistribution(items) {
  const bugs = items.filter(isIncident)
  const result = ['P1', 'P2', 'P3', 'P4'].map(sev => {
    const matching = bugs.filter(b => b.severity === sev)
    return {
      severity: sev,
      label: `${sev} - ${SEVERITY_LABELS[sev]}`,
      count: matching.length,
      effort: Math.round(matching.reduce((s, b) => s + (b.effort || b.totalEffort || 0), 0) * 10) / 10,
      color: SEVERITY_COLORS[sev],
    }
  })
  return result
}

/**
 * Incidents grouped by classification.
 */
export function incidentByClassification(items) {
  const bugs = items.filter(isIncident)
  const map = {}
  bugs.forEach(b => {
    const cls = b.classification || 'Unclassified'
    if (!map[cls]) map[cls] = { name: cls, count: 0, effort: 0 }
    map[cls].count++
    map[cls].effort += b.effort || b.totalEffort || 0
  })
  return Object.values(map).sort((a, b) => b.effort - a.effort)
}

/**
 * Bug effort distributed by professional family.
 */
export function incidentByFamily(items) {
  const bugs = items.filter(isIncident)
  const familyEffort = {}
  PROFESSIONAL_FAMILIES.forEach(f => { familyEffort[f] = 0 })

  bugs.forEach(bug => {
    const byFamily = getEffortByFamily(bug)
    Object.entries(byFamily).forEach(([family, effort]) => {
      familyEffort[family] = (familyEffort[family] || 0) + effort
    })
  })

  return PROFESSIONAL_FAMILIES
    .map(f => ({ family: f, effort: Math.round(familyEffort[f] * 10) / 10 }))
    .filter(f => f.effort > 0)
    .sort((a, b) => b.effort - a.effort)
}

/**
 * Bug effort grouped by Value Area (traced via parent chain to Epic).
 */
export function incidentByValueArea(items) {
  const bugs = items.filter(isIncident)
  const byId = new Map()
  items.forEach(i => byId.set(i.id, i))

  const areaMap = {}
  bugs.forEach(bug => {
    // Walk up parent chain to find valueArea
    let valueArea = ''
    let current = bug
    const visited = new Set()
    while (current.parent && !visited.has(current.parent)) {
      visited.add(current.parent)
      const parent = byId.get(current.parent)
      if (!parent) break
      if (parent.valueArea && parent.valueArea !== 'Same as parent') {
        valueArea = parent.valueArea
        break
      }
      current = parent
    }
    if (!valueArea) valueArea = 'Unknown'

    if (!areaMap[valueArea]) areaMap[valueArea] = { area: valueArea, count: 0, effort: 0 }
    areaMap[valueArea].count++
    areaMap[valueArea].effort += bug.effort || bug.totalEffort || 0
  })

  return Object.values(areaMap)
    .sort((a, b) => b.effort - a.effort)
    .slice(0, 10)
}

/**
 * Correlation data: per-sprint feature effort vs bug count.
 */
export function incidentCorrelation(items, sprintTimeline) {
  const workItems = items.filter(i => i.type !== 'Epic' && i.type !== 'Feature')

  return sprintTimeline.map(s => {
    const sprintItems = workItems.filter(i => i.sprintInfo?.sprint === s.sprint)
    const incidents = sprintItems.filter(isIncident)
    const nonIncidents = sprintItems.filter(i => !isIncident(i))
    const featureEffort = nonIncidents.reduce((sum, i) => sum + (i.effort || i.totalEffort || 0), 0)

    return {
      sprint: s.sprint,
      label: s.fullLabel,
      featureEffort: Math.round(featureEffort * 10) / 10,
      incidentCount: incidents.length,
    }
  }).filter(d => d.featureEffort > 0 || d.incidentCount > 0)
}
