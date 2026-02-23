import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, classificationToVariant } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import MetricCard from '@/components/dashboard/MetricCard'
import { CLASSIFICATION_COLORS, PROFESSIONAL_FAMILIES, formatSP, formatNumber } from '@/lib/utils'
import { ChevronRight, ChevronDown, FolderOpen, FileText, TrendingUp, Target, AlertTriangle } from 'lucide-react'

/* ── Constants ─────────────────────────────────────────── */

const FAMILY_COLORS = {
  BE: '#3b82f6',
  FE: '#f59e0b',
  Design: '#ec4899',
  Analysis: '#8b5cf6',
  QA: '#22c55e',
  Automation: '#06b6d4',
  Native: '#f97316',
  'Platform Eng': '#6366f1',
}

const STATE_STYLES = {
  Closed: 'bg-emerald-100 text-emerald-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Active: 'bg-amber-100 text-amber-700',
  New: 'bg-blue-100 text-blue-700',
}
const DEFAULT_STATE_STYLE = 'bg-gray-100 text-gray-700'

/* ── Helpers ───────────────────────────────────────────── */

function getDescendantIds(itemId, childrenMap) {
  const result = []
  const stack = [itemId]
  while (stack.length > 0) {
    const id = stack.pop()
    const kids = childrenMap.get(id)
    if (kids) {
      for (const kid of kids) {
        result.push(kid.id)
        stack.push(kid.id)
      }
    }
  }
  return result
}

function buildChildrenMap(allItems) {
  const map = new Map()
  allItems.forEach(item => {
    if (item.parent != null) {
      if (!map.has(item.parent)) map.set(item.parent, [])
      map.get(item.parent).push(item)
    }
  })
  return map
}

/* ── Sub-components ────────────────────────────────────── */

/** Stacked horizontal bar — classification effort distribution */
function ClassificationBar({ classificationEffort, total }) {
  if (total <= 0) return null
  const segments = Object.entries(classificationEffort)
    .filter(([, effort]) => effort > 0)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-1">
      <div className="h-2 rounded-full overflow-hidden flex bg-muted">
        {segments.map(([cls, effort]) => {
          const pct = (effort / total) * 100
          return (
            <div
              key={cls}
              title={`${cls}: ${Math.round(pct)}% (${formatSP(effort)})`}
              style={{
                width: `${pct}%`,
                backgroundColor: CLASSIFICATION_COLORS[cls] || CLASSIFICATION_COLORS.Unclassified,
              }}
              className="h-full transition-all"
            />
          )
        })}
      </div>
      <div className="flex gap-3 flex-wrap">
        {segments.map(([cls, effort]) => (
          <span key={cls} className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span
              className="w-2 h-2 rounded-full inline-block shrink-0"
              style={{ backgroundColor: CLASSIFICATION_COLORS[cls] || CLASSIFICATION_COLORS.Unclassified }}
            />
            {cls} {Math.round((effort / total) * 100)}%
          </span>
        ))}
      </div>
    </div>
  )
}

/** Family distribution — top 5 families as dot + label + pct */
function FamilyDistribution({ familyTotals, total }) {
  if (total <= 0) return null
  const entries = Object.entries(familyTotals)
    .filter(([, e]) => e > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  if (entries.length === 0) return null
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {entries.map(([family, effort]) => (
        <span key={family} className="flex items-center gap-1 text-xs text-muted-foreground">
          <span
            className="w-2 h-2 rounded-full inline-block shrink-0"
            style={{ backgroundColor: FAMILY_COLORS[family] || '#6b7280' }}
          />
          <span className="font-medium">{family}</span>
          <span className="font-mono">{Math.round((effort / total) * 100)}%</span>
        </span>
      ))}
    </div>
  )
}

/** Thin stacked bar — family effort (used inside Feature cards) */
function FamilyBar({ familyTotals, total }) {
  if (total <= 0) return null
  const segments = Object.entries(familyTotals)
    .filter(([, e]) => e > 0)
    .sort((a, b) => b[1] - a[1])

  return (
    <div className="h-1.5 rounded-full overflow-hidden flex bg-muted w-full">
      {segments.map(([family, effort]) => (
        <div
          key={family}
          title={`${family}: ${formatSP(effort)}`}
          style={{
            width: `${(effort / total) * 100}%`,
            backgroundColor: FAMILY_COLORS[family] || '#6b7280',
          }}
          className="h-full"
        />
      ))}
    </div>
  )
}

/** Colored state badges with counts */
function StateSummary({ items }) {
  const counts = useMemo(() => {
    const c = {}
    items.forEach(item => {
      const state = item.state || 'Unknown'
      c[state] = (c[state] || 0) + 1
    })
    return Object.entries(c).sort((a, b) => b[1] - a[1])
  }, [items])

  if (counts.length === 0) return null
  return (
    <div className="flex gap-1.5 flex-wrap">
      {counts.map(([state, count]) => (
        <span
          key={state}
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATE_STYLES[state] || DEFAULT_STATE_STYLE}`}
        >
          {count} {state}
        </span>
      ))}
    </div>
  )
}

/** Anomaly alert — conflicting classifications under a classified Epic */
function AnomalyAlert({ epicClassification, anomalies }) {
  const [showDetails, setShowDetails] = useState(false)

  // Group anomalies by their (wrong) classification
  const grouped = useMemo(() => {
    const g = {}
    anomalies.forEach(a => {
      g[a.classification] = (g[a.classification] || 0) + 1
    })
    return Object.entries(g).sort((a, b) => b[1] - a[1])
  }, [anomalies])

  const summary = grouped.map(([cls, count]) => `${count} ${cls}`).join(', ')

  return (
    <div className="ml-10 mt-3">
      <div className="rounded-lg border border-amber-300/50 bg-amber-50/50 p-3">
        <div
          className="flex items-start gap-2 cursor-pointer"
          onClick={() => setShowDetails(!showDetails)}
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-amber-800">
              Anomalia classificazione: {summary} sotto Epic {epicClassification}
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              {anomalies.length} {anomalies.length === 1 ? 'item' : 'items'} con classificazione in conflitto — clicca per dettagli
            </p>
          </div>
          {showDetails
            ? <ChevronDown className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            : <ChevronRight className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />}
        </div>

        {showDetails && (
          <div className="mt-2 ml-6 space-y-1 max-h-48 overflow-y-auto">
            {anomalies.map(a => (
              <div key={a.id} className="flex items-center gap-2 text-xs text-amber-900/80">
                <span className="font-mono w-14 shrink-0">{a.id}</span>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">{a.type}</Badge>
                <span className="truncate flex-1">{a.title}</span>
                <Badge variant={classificationToVariant(a.classification)} className="text-[10px] shrink-0">
                  {a.classification}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/** Structured table for work-item children */
function WorkItemsTable({ items }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 px-2 text-xs">ID</TableHead>
          <TableHead className="h-8 px-2 text-xs">Type</TableHead>
          <TableHead className="h-8 px-2 text-xs">Title</TableHead>
          <TableHead className="h-8 px-2 text-xs">State</TableHead>
          <TableHead className="h-8 px-2 text-xs text-right">Effort</TableHead>
          <TableHead className="h-8 px-2 text-xs">Families</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(item => {
          const activeFamilies = PROFESSIONAL_FAMILIES
            .map(f => ({ family: f, effort: (item.effortByFamily && item.effortByFamily[f]) || 0 }))
            .filter(f => f.effort > 0)

          return (
            <TableRow key={item.id}>
              <TableCell className="py-1.5 px-2 font-mono text-xs">{item.id}</TableCell>
              <TableCell className="py-1.5 px-2">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.type}</Badge>
              </TableCell>
              <TableCell className="py-1.5 px-2 max-w-[300px] truncate text-sm">{item.title}</TableCell>
              <TableCell className="py-1.5 px-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${STATE_STYLES[item.state] || DEFAULT_STATE_STYLE}`}>
                  {item.state || '—'}
                </span>
              </TableCell>
              <TableCell className="py-1.5 px-2 text-right font-mono text-xs">{formatSP(item.totalEffort)}</TableCell>
              <TableCell className="py-1.5 px-2">
                <div className="flex gap-1 flex-wrap">
                  {activeFamilies.map(({ family, effort }) => (
                    <span
                      key={family}
                      className="text-[10px] px-1.5 py-0 rounded font-mono"
                      style={{
                        backgroundColor: `${FAMILY_COLORS[family]}20`,
                        color: FAMILY_COLORS[family],
                      }}
                    >
                      {family}:{effort}
                    </span>
                  ))}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

/* ── Feature Card ──────────────────────────────────────── */

function FeatureItem({ feature, allItems, childrenMap }) {
  const [expanded, setExpanded] = useState(false)
  const children = childrenMap.get(feature.id) || []

  const { totalEffort, familyTotals } = useMemo(() => {
    const descIds = getDescendantIds(feature.id, childrenMap)
    const allItemsById = new Map(allItems.map(i => [i.id, i]))
    let total = 0
    const t = {}
    PROFESSIONAL_FAMILIES.forEach(f => { t[f] = 0 })
    descIds.forEach(id => {
      const item = allItemsById.get(id)
      if (!item) return
      total += item.totalEffort || 0
      if (item.effortByFamily) {
        Object.entries(item.effortByFamily).forEach(([f, e]) => { t[f] = (t[f] || 0) + e })
      }
    })
    return { totalEffort: total, familyTotals: t }
  }, [feature.id, allItems, childrenMap])

  return (
    <Card className="mb-2 border-muted/50">
      <CardContent className="p-3">
        {/* Header — always visible */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {children.length > 0 ? (
            expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : <div className="w-4 shrink-0" />}
          <Badge variant={classificationToVariant(feature.classification)} className="shrink-0">
            {feature.classification || 'Unclassified'}
          </Badge>
          <span className="text-sm font-medium flex-1 truncate">{feature.title}</span>
          <span className="text-xs text-muted-foreground font-mono shrink-0">
            {children.length} items · {formatSP(totalEffort)}
          </span>
        </div>

        {/* Mini family bar + state summary — always visible */}
        <div className="ml-6 mt-2 space-y-1.5">
          <FamilyBar familyTotals={familyTotals} total={totalEffort} />
          <StateSummary items={children} />
        </div>

        {/* Expanded: Work Items Table */}
        {expanded && children.length > 0 && (
          <div className="mt-3">
            <WorkItemsTable items={children} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ── Epic Card ─────────────────────────────────────────── */

function EpicCard({ epic, allItems, childrenMap }) {
  const [expanded, setExpanded] = useState(false)

  const features = useMemo(() =>
    (childrenMap.get(epic.id) || []).filter(i => i.type === 'Feature'),
    [epic.id, childrenMap]
  )

  const { descendantEffort, familyTotals, classificationEffort, descendantCount, anomalies } = useMemo(() => {
    const descIds = getDescendantIds(epic.id, childrenMap)
    const allItemsById = new Map(allItems.map(i => [i.id, i]))
    let total = 0
    const fam = {}
    PROFESSIONAL_FAMILIES.forEach(f => { fam[f] = 0 })
    const classEff = {}
    const epicCls = epic.classification || 'Unclassified'
    const conflicts = []

    descIds.forEach(id => {
      const item = allItemsById.get(id)
      if (!item) return
      total += item.totalEffort || 0

      const itemCls = item.classification || 'Unclassified'

      // Detect anomaly: descendant has a different non-Unclassified classification
      if (epicCls !== 'Unclassified' && itemCls !== 'Unclassified' && itemCls !== epicCls) {
        conflicts.push({ id: item.id, type: item.type, title: item.title, classification: itemCls })
      }

      // Business rule: Epic classification cascades to all descendants
      const cls = epicCls !== 'Unclassified' ? epicCls : itemCls
      classEff[cls] = (classEff[cls] || 0) + (item.totalEffort || 0)
      if (item.effortByFamily) {
        Object.entries(item.effortByFamily).forEach(([f, e]) => { fam[f] = (fam[f] || 0) + e })
      }
    })

    return {
      descendantEffort: total,
      familyTotals: fam,
      classificationEffort: classEff,
      descendantCount: descIds.length,
      anomalies: conflicts,
    }
  }, [epic.id, allItems, childrenMap])

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        {/* Epic header row */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? <ChevronDown className="h-5 w-5 shrink-0" />
            : <ChevronRight className="h-5 w-5 shrink-0" />}
          <FolderOpen className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="truncate">{epic.title}</CardTitle>
              <Badge variant={classificationToVariant(epic.classification)} className="shrink-0">
                {epic.classification || 'Unclassified'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {features.length} Features · {formatSP(descendantEffort)} totali · {descendantCount} items
            </p>
          </div>
        </div>

        {/* Classification distribution bar */}
        <div className="ml-10 mt-3">
          <ClassificationBar classificationEffort={classificationEffort} total={descendantEffort} />
        </div>

        {/* Family distribution */}
        <div className="ml-10 mt-2">
          <FamilyDistribution familyTotals={familyTotals} total={descendantEffort} />
        </div>

        {/* Anomaly alert */}
        {anomalies.length > 0 && (
          <AnomalyAlert epicClassification={epic.classification} anomalies={anomalies} />
        )}
      </CardHeader>

      {/* Expanded: Feature cards */}
      {expanded && (
        <CardContent>
          {features.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna feature</p>
          ) : (
            <div className="space-y-2">
              {features.map(f => (
                <FeatureItem key={f.id} feature={f} allItems={allItems} childrenMap={childrenMap} />
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

/* ── Main ──────────────────────────────────────────────── */

export default function EpicExplorer() {
  const { processedData, hasData } = useData()

  const { epics, childrenMap, kpi } = useMemo(() => {
    if (!processedData) return { epics: [], childrenMap: new Map(), kpi: { epics: 0, features: 0, totalSP: 0, classifiedPct: 0, anomalies: 0 } }

    const items = processedData.items
    const epicList = items.filter(i => i.type === 'Epic').sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    const featureCount = items.filter(i => i.type === 'Feature').length
    const cMap = buildChildrenMap(items)

    // Count global anomalies (items with classification conflicting with their Epic)
    let anomalyCount = 0
    epicList.forEach(epic => {
      const epicCls = epic.classification || 'Unclassified'
      if (epicCls === 'Unclassified') return
      const descIds = getDescendantIds(epic.id, cMap)
      const byId = new Map(items.map(i => [i.id, i]))
      descIds.forEach(id => {
        const item = byId.get(id)
        if (!item) return
        const itemCls = item.classification || 'Unclassified'
        if (itemCls !== 'Unclassified' && itemCls !== epicCls) anomalyCount++
      })
    })

    return {
      epics: epicList,
      childrenMap: cMap,
      kpi: {
        epics: epicList.length,
        features: featureCount,
        totalSP: processedData.totalEffort || 0,
        classifiedPct: processedData.coveragePercent || 0,
        anomalies: anomalyCount,
      },
    }
  }, [processedData])

  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Epic Explorer</h2>
        <span className="text-sm text-muted-foreground">{epics.length} Epics</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard title="Epics" value={formatNumber(kpi.epics)} icon={FolderOpen} colorIndex={0} />
        <MetricCard title="Features" value={formatNumber(kpi.features)} icon={FileText} colorIndex={1} />
        <MetricCard title="Total SP" value={formatNumber(Math.round(kpi.totalSP))} icon={TrendingUp} colorIndex={2} />
        <MetricCard title="Classified" value={`${Math.round(kpi.classifiedPct)}%`} subtitle="coverage" icon={Target} colorIndex={3} />
        <MetricCard title="Anomalie" value={formatNumber(kpi.anomalies)} subtitle={kpi.anomalies > 0 ? 'conflitti classificazione' : 'nessun conflitto'} icon={AlertTriangle} colorIndex={4} />
      </div>

      {/* Epic Cards */}
      <div>
        {epics.map(epic => (
          <EpicCard key={epic.id} epic={epic} allItems={processedData.items} childrenMap={childrenMap} />
        ))}
      </div>
    </div>
  )
}
