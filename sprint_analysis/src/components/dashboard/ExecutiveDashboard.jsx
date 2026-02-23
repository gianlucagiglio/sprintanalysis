import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import MetricCard from './MetricCard'
import { CLASSIFICATION_COLORS, PROFESSIONAL_FAMILIES, formatNumber, formatSP } from '@/lib/utils'
import { ListChecks, Clock, Tag, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react'

export default function ExecutiveDashboard() {
  const { processedData, hasData } = useData()
  const pieData = useMemo(() => {
    if (!processedData) return []
    return processedData.classifications.map(cls => ({
      name: cls,
      value: processedData.classificationSummary[cls].count,
      effort: processedData.classificationSummary[cls].effort,
    })).filter(d => d.value > 0)
  }, [processedData])

  const effortByClassification = useMemo(() => {
    if (!processedData) return []
    return processedData.classifications.map(cls => ({
      name: cls,
      effort: Math.round(processedData.classificationSummary[cls].effort * 10) / 10,
    })).filter(d => d.effort > 0)
  }, [processedData])

  const familyData = useMemo(() => {
    if (!processedData) return []
    return Object.entries(processedData.effortByFamily)
      .map(([name, effort]) => ({ name, effort: Math.round(effort * 10) / 10 }))
      .filter(d => d.effort > 0)
      .sort((a, b) => b.effort - a.effort)
  }, [processedData])

  const topEpicsData = useMemo(() => {
    if (!processedData) return []
    return processedData.topEpics
  }, [processedData])

  if (!hasData) return <Navigate to="/" replace />

  const d = processedData

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Executive Dashboard</h2>

      {d.totalEffort === 0 && d.totalItems > 0 && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-400">Nessun dato di effort trovato</p>
            <p className="text-xs text-muted-foreground mt-1">
              Il file Excel non contiene valori nella colonna Effort. I grafici basati su effort saranno vuoti.
              Aggiungi i valori nella colonna Effort del file Excel e ricaricalo.
            </p>
          </div>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          title="Total Items"
          value={formatNumber(d.totalItems)}
          icon={ListChecks}
        />
        <MetricCard
          title="Total Story Points"
          value={formatSP(Math.round(d.totalEffort))}
          icon={Clock}
        />
        <MetricCard
          title="Classifications"
          value={d.classifications.length}
          subtitle="categories"
          icon={Tag}
        />
        <MetricCard
          title="Classified"
          value={formatNumber(d.classifiedCount)}
          subtitle={`${d.coveragePercent.toFixed(1)}% coverage`}
          icon={CheckCircle}
        />
        <MetricCard
          title="Unclassified"
          value={formatNumber(d.classificationSummary.Unclassified.count)}
          subtitle="items need tags"
          icon={TrendingUp}
        />
      </div>

      {/* Professional family effort summary cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Effort by Professional Family</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {PROFESSIONAL_FAMILIES.map(f => {
              const effort = d.effortByFamily[f] || 0
              const pct = d.totalEffort > 0 ? (effort / d.totalEffort * 100) : 0
              return (
                <div key={f} className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground font-medium">{f}</p>
                  <p className="text-xl font-bold font-mono mt-1">{formatSP(Math.round(effort))}</p>
                  <p className="text-xs text-muted-foreground">{pct.toFixed(1)}%</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution by Classification (count)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map(entry => (
                    <Cell key={entry.name} fill={CLASSIFICATION_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Effort by classification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Effort by Classification (SP)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={effortByClassification} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={100} />
                <Tooltip formatter={(val) => [`${val} SP`, 'Effort']} />
                <Bar dataKey="effort" radius={[0, 4, 4, 0]}>
                  {effortByClassification.map(entry => (
                    <Cell key={entry.name} fill={CLASSIFICATION_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Effort by professional family bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Story Points by Professional Family</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={familyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val) => [`${val} SP`, 'Effort']} />
                <Bar dataKey="effort" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 10 Epics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top 10 Epics by Effort</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topEpicsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="title" width={180} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${(val || 0).toFixed(1)} SP`, 'Effort']} />
                <Bar dataKey="effort" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
