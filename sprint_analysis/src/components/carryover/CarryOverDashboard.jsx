import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  ComposedChart, Bar, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import MetricCard from '@/components/dashboard/MetricCard'
import { formatNumber, formatSP } from '@/lib/utils'
import { RefreshCw, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import { detectCarryOver } from '@/lib/carryover-utils'

export default function CarryOverDashboard() {
  const { processedData, hasData } = useData()
  const data = useMemo(() => {
    if (!processedData) return null
    return detectCarryOver(processedData.items, processedData.sprintTimeline)
  }, [processedData])

  if (!hasData) return <Navigate to="/" replace />
  if (!data) return null

  const { perSprint, repeatOffenders, summary } = data

  const effortData = perSprint.map(s => ({
    label: s.label,
    carryOverEffort: s.carryOverEffort,
    closedEffort: s.closedEffort,
  }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Carry-over Tracking</h2>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Carry-over"
          value={formatNumber(summary.totalCarryOver)}
          subtitle="items"
          icon={RefreshCw}
          colorIndex={0}
        />
        <MetricCard
          title="Avg Carry-over %"
          value={`${summary.avgCarryOverPercent}%`}
          icon={TrendingUp}
          colorIndex={1}
        />
        <MetricCard
          title="Repeat Offenders"
          value={formatNumber(summary.repeatOffenderCount)}
          subtitle="items"
          icon={AlertCircle}
          colorIndex={4}
        />
        <MetricCard
          title="Carry-over Effort"
          value={formatSP(Math.round(summary.totalCarryOverEffort))}
          icon={Zap}
          colorIndex={3}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Carry-over count + % */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Carry-over per Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={perSprint}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" unit="%" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="carryOverCount" name="Carry-over Count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="carryOverPercent" name="Carry-over %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Effort breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Effort: Carry-over vs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={effortData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip formatter={(val) => [`${val} SP`, '']} />
                <Legend />
                <Area type="monotone" dataKey="closedEffort" name="Completed" fill="#22c55e" fillOpacity={0.3} stroke="#22c55e" stackId="1" />
                <Area type="monotone" dataKey="carryOverEffort" name="Carry-over" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Repeat Offenders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Repeat Offenders</CardTitle>
        </CardHeader>
        <CardContent>
          {repeatOffenders.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun repeat offender trovato.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="w-24">Type</TableHead>
                  <TableHead className="w-20">State</TableHead>
                  <TableHead className="w-20 text-right">Effort</TableHead>
                  <TableHead>Sprint(s)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repeatOffenders.slice(0, 20).map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.id}</TableCell>
                    <TableCell className="text-sm max-w-[300px] truncate">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.state === 'Active' ? 'default' : 'outline'} className="text-[10px]">
                        {item.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatSP(Math.round(item.effort))}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.sprints.join(', ')}</TableCell>
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
