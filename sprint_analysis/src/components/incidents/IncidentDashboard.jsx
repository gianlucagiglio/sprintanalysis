import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ComposedChart, PieChart, Pie, Cell, ScatterChart, Scatter,
  ReferenceLine, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import MetricCard from '@/components/dashboard/MetricCard'
import { ShieldAlert, Clock, Zap, CheckCircle, AlertTriangle, ArrowUpDown } from 'lucide-react'
import { CLASSIFICATION_COLORS, formatNumber, formatSP } from '@/lib/utils'
import {
  isIncident,
  enrichIncidents,
  incidentSummary,
  incidentTrend,
  incidentMTTRTrend,
  severityDistribution,
  incidentByClassification,
  incidentByFamily,
  incidentByValueArea,
  incidentCorrelation,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
} from '@/lib/incident-utils'
import { calculateCycleTime } from '@/lib/flow-metrics'

const FAMILY_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899', '#f97316']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color || entry.fill }}>
          {entry.name}: <span className="font-mono font-medium">{typeof entry.value === 'number' ? formatNumber(entry.value, 1) : entry.value}</span>
        </p>
      ))}
    </div>
  )
}

function SeverityBadge({ severity }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
      style={{
        backgroundColor: `${SEVERITY_COLORS[severity]}20`,
        color: SEVERITY_COLORS[severity],
      }}
    >
      {severity}
    </span>
  )
}

function StateBadge({ state }) {
  const colors = {
    Closed: 'bg-emerald-500/15 text-emerald-400',
    Active: 'bg-amber-500/15 text-amber-400',
    New: 'bg-blue-500/15 text-blue-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${colors[state] || 'bg-gray-500/15 text-gray-400'}`}>
      {state}
    </span>
  )
}

export default function IncidentDashboard() {
  const { processedData, hasData } = useData()
  const [sortField, setSortField] = useState('impactScore')
  const [sortDir, setSortDir] = useState('desc')

  const data = useMemo(() => {
    if (!processedData) return null

    const enriched = enrichIncidents(processedData.items)
    const summary = incidentSummary(enriched)
    const trend = incidentTrend(enriched, processedData.sprintTimeline)
    const mttrData = incidentMTTRTrend(enriched, processedData.sprintTimeline)
    const severity = severityDistribution(enriched)
    const byClassification = incidentByClassification(enriched)
    const byFamily = incidentByFamily(enriched)
    const byValueArea = incidentByValueArea(enriched)
    const correlation = incidentCorrelation(enriched, processedData.sprintTimeline)

    const incidents = enriched.filter(i => isIncident(i)).map(b => ({
      ...b,
      cycleTime: calculateCycleTime(b),
    }))

    return { summary, trend, mttrData, severity, byClassification, byFamily, byValueArea, correlation, incidents }
  }, [processedData])

  if (!hasData) return <Navigate to="/" replace />
  if (!data) return null

  const { summary, trend, mttrData, severity, byClassification, byFamily, byValueArea, correlation, incidents } = data

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sortedIncidents = [...incidents].sort((a, b) => {
    let av = a[sortField]
    let bv = b[sortField]
    if (typeof av === 'string') av = av.toLowerCase()
    if (typeof bv === 'string') bv = bv.toLowerCase()
    if (av == null) av = sortDir === 'asc' ? Infinity : -Infinity
    if (bv == null) bv = sortDir === 'asc' ? Infinity : -Infinity
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const SortHeader = ({ field, children }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className={`h-3 w-3 ${sortField === field ? 'text-blue-400' : 'text-muted-foreground/40'}`} />
      </div>
    </TableHead>
  )

  // Pie chart label renderer
  const renderPieLabel = ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Incident Analysis</h2>

      {processedData.datesEstimated && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex gap-3 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="text-amber-300">
            <strong>MTTR stimato</strong> — le date nel file sono corrotte. I tempi di risoluzione sono stimati dalle date degli sprint.
          </span>
        </div>
      )}

      {summary.totalIncidents === 0 && (
        <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 flex gap-3 text-sm">
          <ShieldAlert className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-blue-300">
            <strong>Nessun incident trovato.</strong> Gli incident vengono identificati tramite i tag{' '}
            <code className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 text-xs font-mono">incident</code>{' '}o{' '}
            <code className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 text-xs font-mono">emergency</code>{' '}
            nel campo Tags del work item. Aggiungi questi tag agli item nel backlog per popolare questa dashboard.
          </div>
        </div>
      )}

      {/* Row 1: MetricCards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          title="Total Incidents"
          value={summary.totalIncidents}
          icon={ShieldAlert}
          colorIndex={4}
        />
        <MetricCard
          title="MTTR"
          value={`${formatNumber(summary.globalMTTR, 1)}d`}
          subtitle={`Mediana: ${formatNumber(summary.medianMTTR, 1)}d`}
          icon={Clock}
          colorIndex={0}
        />
        <MetricCard
          title="Effort Impact"
          value={`${formatNumber(summary.effortImpactPercent, 1)}%`}
          subtitle={formatSP(summary.incidentEffort)}
          icon={Zap}
          colorIndex={3}
        />
        <MetricCard
          title="Resolution Rate"
          value={`${summary.resolutionRate}%`}
          subtitle={`${summary.closedIncidents}/${summary.totalIncidents}`}
          icon={CheckCircle}
          colorIndex={1}
        />
        <MetricCard
          title="Active Incidents"
          value={summary.activeIncidents}
          subtitle={formatSP(summary.activeEffort)}
          icon={AlertTriangle}
          colorIndex={3}
        />
      </div>

      {/* Row 2: Trend + Severity */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incident Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="count" name="Incident Count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" dataKey="percent" name="% of Items" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={severity}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="severity" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                  {severity.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="effort" name="Effort (SP)" radius={[4, 4, 0, 0]}>
                  {severity.map((entry, i) => (
                    <Cell key={i} fill={`${entry.color}80`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: MTTR Trend + Classification */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">MTTR Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {mttrData.trend.filter(d => d.mttr != null).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mttrData.trend.filter(d => d.mttr != null)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} unit="d" />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={mttrData.globalAvg} stroke="#6b7280" strokeDasharray="5 5" label={{ value: `Avg: ${mttrData.globalAvg}d`, position: 'right', fontSize: 11, fill: '#6b7280' }} />
                  <Line dataKey="mttr" name="MTTR (days)" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Nessun incident chiuso con tempi di risoluzione disponibili
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Incidents by Classification</CardTitle>
          </CardHeader>
          <CardContent>
            {byClassification.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={byClassification}
                    dataKey="effort"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={renderPieLabel}
                    labelLine={{ stroke: '#666', strokeWidth: 1 }}
                  >
                    {byClassification.map((entry, i) => (
                      <Cell key={i} fill={CLASSIFICATION_COLORS[entry.name] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Nessun incident trovato. Usa i tag "incident" o "emergency".
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Family + Value Area */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Impact by Professional Family</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byFamily} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="family" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="effort" name="Effort (SP)" radius={[0, 4, 4, 0]}>
                  {byFamily.map((_, i) => (
                    <Cell key={i} fill={FAMILY_COLORS[i % FAMILY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Impact by Value Area (Top 10)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byValueArea} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="area" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="effort" name="Effort (SP)" fill="#ef4444" radius={[0, 4, 4, 0]}>
                  {byValueArea.map((_, i) => (
                    <Cell key={i} fill={FAMILY_COLORS[i % FAMILY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Correlation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Effort vs Incident Count (per Sprint)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="featureEffort" name="Feature Effort (SP)" tick={{ fontSize: 11 }} unit=" SP" />
              <YAxis dataKey="incidentCount" name="Incident Count" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0].payload
                  return (
                    <div className="rounded-lg border bg-card p-3 shadow-lg text-sm">
                      <p className="font-medium mb-1">{d.label}</p>
                      <p>Feature Effort: <span className="font-mono">{formatNumber(d.featureEffort, 1)} SP</span></p>
                      <p>Incidents: <span className="font-mono">{d.incidentCount}</span></p>
                    </div>
                  )
                }}
              />
              <Scatter data={correlation} fill="#3b82f6">
                {correlation.map((_, i) => (
                  <Cell key={i} fill="#3b82f6" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 6: Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Incident Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortHeader field="id">ID</SortHeader>
                  <SortHeader field="type">Type</SortHeader>
                  <SortHeader field="title">Title</SortHeader>
                  <SortHeader field="severity">Severity</SortHeader>
                  <SortHeader field="state">State</SortHeader>
                  <SortHeader field="effort">Effort</SortHeader>
                  <SortHeader field="cycleTime">Cycle Time</SortHeader>
                  <TableHead>Sprint</TableHead>
                  <TableHead>Classification</TableHead>
                  <SortHeader field="impactScore">Impact Score</SortHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedIncidents.map(inc => (
                  <TableRow key={inc.id}>
                    <TableCell className="font-mono text-xs">{inc.id}</TableCell>
                    <TableCell className="text-xs">{inc.type}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm" title={inc.title}>{inc.title}</TableCell>
                    <TableCell><SeverityBadge severity={inc.severity} /></TableCell>
                    <TableCell><StateBadge state={inc.state} /></TableCell>
                    <TableCell className="font-mono text-sm">{formatNumber(inc.effort || inc.totalEffort || 0)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {inc.cycleTime != null ? `${inc.cycleTime}d` : '—'}
                    </TableCell>
                    <TableCell className="text-xs">{inc.sprintInfo?.fullLabel || '—'}</TableCell>
                    <TableCell className="text-xs">{inc.classification || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${inc.impactScore || 0}%`,
                              backgroundColor: inc.impactScore >= 70 ? '#ef4444' : inc.impactScore >= 40 ? '#f59e0b' : '#22c55e',
                            }}
                          />
                        </div>
                        <span className="font-mono text-xs w-6 text-right">{inc.impactScore || 0}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
