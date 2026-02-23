import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import MetricCard from '@/components/dashboard/MetricCard'
import { formatNumber } from '@/lib/utils'
import { Clock, TrendingUp, Activity, Layers, AlertTriangle } from 'lucide-react'
import {
  flowMetricsSummary, cycleTimeDistribution, cycleTimeTrend,
  calculateThroughput, calculateWIP,
} from '@/lib/flow-metrics'

export default function CycleTimeDashboard() {
  const { processedData, hasData } = useData()
  const summary = useMemo(() => {
    if (!processedData) return null
    return flowMetricsSummary(processedData.items)
  }, [processedData])

  const histogram = useMemo(() => {
    if (!processedData) return []
    return cycleTimeDistribution(processedData.items)
  }, [processedData])

  const trend = useMemo(() => {
    if (!processedData) return { trend: [], globalAvg: 0 }
    return cycleTimeTrend(processedData.items, processedData.sprintTimeline)
  }, [processedData])

  const throughput = useMemo(() => {
    if (!processedData) return []
    return calculateThroughput(processedData.items, processedData.sprintTimeline)
  }, [processedData])

  const wip = useMemo(() => {
    if (!processedData) return []
    return calculateWIP(processedData.items, processedData.sprintTimeline)
  }, [processedData])

  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cycle Time & Flow Metrics</h2>

      {processedData.datesEstimated && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 flex gap-3 text-sm">
          <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-amber-300">
            <strong>Date stimate.</strong> Il file Excel non contiene date valide (Created Date, Closed Date risultano "########").
            Le metriche di Cycle Time sono stimate usando le date degli sprint dall'Iteration Path.
            Per dati precisi, ri-esporta l'Excel allargando le colonne data prima di salvare.
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          title="Avg Cycle Time"
          value={`${summary.avgCycleTime}d`}
          icon={Clock}
          colorIndex={0}
        />
        <MetricCard
          title="Median Cycle Time"
          value={`${summary.medianCycleTime}d`}
          icon={Clock}
          colorIndex={1}
        />
        <MetricCard
          title="Avg Lead Time"
          value={`${summary.avgLeadTime}d`}
          icon={TrendingUp}
          colorIndex={2}
        />
        <MetricCard
          title="Throughput"
          value={formatNumber(summary.throughput)}
          subtitle="closed items"
          icon={Activity}
          colorIndex={3}
        />
        <MetricCard
          title="WIP"
          value={formatNumber(summary.wip)}
          subtitle="active items"
          icon={Layers}
          colorIndex={4}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Histogram */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cycle Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogram}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(val) => [`${val} items`, 'Count']} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cycle Time Trend (avg per sprint)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trend.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis unit="d" />
                <Tooltip formatter={(val) => val != null ? [`${val}d`, 'Avg Cycle Time'] : ['-', 'No data']} />
                <ReferenceLine y={trend.globalAvg} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: `Avg ${trend.globalAvg}d`, fill: '#f59e0b', fontSize: 11 }} />
                <Line type="monotone" dataKey="avgCycleTime" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-2 gap-6">
        {/* Throughput */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Throughput per Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={throughput}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(val) => [`${val} items`, 'Throughput']} />
                <Bar dataKey="throughput" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* WIP */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">WIP per Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={wip}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(val) => [`${val} items`, 'WIP']} />
                <Area type="monotone" dataKey="wip" fill="#a855f7" fillOpacity={0.2} stroke="#a855f7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
