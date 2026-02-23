import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/dashboard/MetricCard'
import { formatNumber } from '@/lib/utils'
import { AlertTriangle, BarChart3, Target, Zap } from 'lucide-react'
import { detectAnomalies } from '@/lib/anomaly-utils'

function HeatmapCell({ zScore, isAnomaly }) {
  const absZ = Math.abs(zScore)
  let bg = 'bg-muted/30'
  if (absZ > 2) bg = zScore > 0 ? 'bg-red-500/60' : 'bg-blue-500/60'
  else if (absZ > 1.5) bg = zScore > 0 ? 'bg-red-500/30' : 'bg-blue-500/30'
  else if (absZ > 1) bg = zScore > 0 ? 'bg-orange-500/20' : 'bg-cyan-500/20'

  return (
    <div className={`w-full h-8 rounded flex items-center justify-center text-[10px] font-mono ${bg}`}>
      {zScore.toFixed(1)}
    </div>
  )
}

export default function AnomalyDashboard() {
  const { processedData, hasData } = useData()
  const [threshold] = useState(2.0)

  const data = useMemo(() => {
    if (!processedData) return null
    return detectAnomalies(processedData.sprintTimeline, processedData.items, threshold)
  }, [processedData, threshold])

  if (!hasData) return <Navigate to="/" replace />
  if (!data) return null

  const { anomalies, heatmapData, summary, sprintMetrics } = data

  // Bar chart: anomaly flags per sprint
  const flagsPerSprint = sprintMetrics.map(m => {
    const flags = anomalies.filter(a => a.sprint === m.sprint).length
    return { sprint: m.sprint, label: m.label, flags }
  })

  // Heatmap: organize by metric × sprint
  const metrics = [...new Set(heatmapData.map(d => d.metric))]
  const sprints = sprintMetrics.map(m => m.label)
  const heatmapByMetric = metrics.slice(0, 6).map(metric => ({
    metric,
    cells: sprintMetrics.map(m => {
      const cell = heatmapData.find(d => d.sprint === m.sprint && d.metric === metric)
      return cell || { zScore: 0, isAnomaly: false }
    }),
  }))

  const mostAnomalousLabel = summary.mostAnomalousSprint
    ? sprintMetrics.find(m => m.sprint === summary.mostAnomalousSprint.sprint)?.label || '-'
    : '-'

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Anomaly Detection</h2>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Anomalous Sprints"
          value={formatNumber(summary.anomalousSprintCount)}
          icon={AlertTriangle}
          colorIndex={4}
        />
        <MetricCard
          title="Total Flags"
          value={formatNumber(summary.totalFlags)}
          icon={Zap}
          colorIndex={3}
        />
        <MetricCard
          title="Most Anomalous"
          value={mostAnomalousLabel}
          subtitle={summary.mostAnomalousSprint ? `${summary.mostAnomalousSprint.flags} flags` : ''}
          icon={Target}
          colorIndex={1}
        />
        <MetricCard
          title="Threshold"
          value={`${threshold}σ`}
          subtitle="z-score"
          icon={BarChart3}
          colorIndex={2}
        />
      </div>

      {/* Flags per sprint */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anomaly Flags per Sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={flagsPerSprint}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(val) => [`${val} flags`, 'Anomalies']} />
              <Bar dataKey="flags" radius={[4, 4, 0, 0]}>
                {flagsPerSprint.map((s, idx) => (
                  <Cell key={idx} fill={s.flags > 0 ? '#ef4444' : '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Z-Score Heatmap (Sprint × Metric)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header row */}
              <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: `160px repeat(${sprints.length}, 1fr)` }}>
                <div className="text-[10px] text-muted-foreground font-medium px-1">Metric</div>
                {sprints.map(s => (
                  <div key={s} className="text-[10px] text-muted-foreground text-center">{s}</div>
                ))}
              </div>
              {/* Data rows */}
              {heatmapByMetric.map(row => (
                <div key={row.metric} className="grid gap-1 mb-1" style={{ gridTemplateColumns: `160px repeat(${sprints.length}, 1fr)` }}>
                  <div className="text-[11px] text-foreground px-1 flex items-center truncate">{row.metric}</div>
                  {row.cells.map((cell, idx) => (
                    <HeatmapCell key={idx} zScore={cell.zScore} isAnomaly={cell.isAnomaly} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Anomaly Details</CardTitle>
        </CardHeader>
        <CardContent>
          {anomalies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna anomalia rilevata con soglia {threshold}σ.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sprint</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Mean</TableHead>
                  <TableHead className="text-right">Z-Score</TableHead>
                  <TableHead>Direction</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {anomalies.map((a, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{a.label}</TableCell>
                    <TableCell className="text-sm">{a.metric}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{a.value}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{a.mean}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold" style={{ color: a.direction === 'high' ? '#ef4444' : '#3b82f6' }}>
                      {a.zScore > 0 ? '+' : ''}{a.zScore}
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.direction === 'high' ? 'destructive' : 'default'} className="text-[10px]">
                        {a.direction === 'high' ? '↑ High' : '↓ Low'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
