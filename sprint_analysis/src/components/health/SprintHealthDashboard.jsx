import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useData } from '@/context/DataContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import MetricCard from '@/components/dashboard/MetricCard'
import { HeartPulse, TrendingUp, Shield, BarChart3 } from 'lucide-react'
import { calculateHealthScores, healthScoreColor, healthScoreLabel } from '@/lib/health-score'

function GaugeChart({ score, size = 180 }) {
  const radius = (size - 20) / 2
  const cx = size / 2
  const cy = size / 2 + 10
  const circumference = Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = healthScoreColor(score)

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="12"
          className="text-muted/20"
        />
        {/* Score arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={offset}
        />
        {/* Score text */}
        <text x={cx} y={cy - 15} textAnchor="middle" className="text-3xl font-bold fill-foreground" fontSize="36" fontWeight="bold">
          {score}
        </text>
        <text x={cx} y={cy + 5} textAnchor="middle" fill={color} fontSize="14" fontWeight="500">
          {healthScoreLabel(score)}
        </text>
      </svg>
    </div>
  )
}

export default function SprintHealthDashboard() {
  const { processedData, hasData } = useData()
  const scores = useMemo(() => {
    if (!processedData) return []
    return calculateHealthScores(processedData.items, processedData.sprintTimeline)
  }, [processedData])

  const avgScore = useMemo(() => {
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length)
  }, [scores])

  const factors = useMemo(() => {
    if (scores.length === 0) return { velocity: 0, carryOver: 0, classification: 0, balance: 0 }
    const n = scores.length
    return {
      velocity: Math.round(scores.reduce((s, x) => s + x.velocityScore, 0) / n * 10) / 10,
      carryOver: Math.round(scores.reduce((s, x) => s + x.carryOverScore, 0) / n * 10) / 10,
      classification: Math.round(scores.reduce((s, x) => s + x.classificationScore, 0) / n * 10) / 10,
      balance: Math.round(scores.reduce((s, x) => s + x.balanceScore, 0) / n * 10) / 10,
    }
  }, [scores])

  if (!hasData) return <Navigate to="/" replace />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sprint Health Score</h2>

      {/* Top section: Gauge + Factor breakdown */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-1 flex items-center justify-center">
          <CardContent className="pt-6">
            <GaugeChart score={avgScore} />
            <p className="text-center text-xs text-muted-foreground mt-2">Average Health Score</p>
          </CardContent>
        </Card>

        <div className="col-span-2 grid grid-cols-2 gap-4">
          <MetricCard
            title="Velocity Trend"
            value={`${factors.velocity}/25`}
            subtitle="closeness to average"
            icon={TrendingUp}
            colorIndex={0}
          />
          <MetricCard
            title="Carry-over"
            value={`${factors.carryOver}/25`}
            subtitle="lower carry-over = better"
            icon={Shield}
            colorIndex={1}
          />
          <MetricCard
            title="Classification"
            value={`${factors.classification}/25`}
            subtitle="tag coverage"
            icon={BarChart3}
            colorIndex={2}
          />
          <MetricCard
            title="Effort Balance"
            value={`${factors.balance}/25`}
            subtitle="family distribution"
            icon={HeartPulse}
            colorIndex={3}
          />
        </div>
      </div>

      {/* Score per sprint */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Health Score per Sprint</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(val, name) => [`${val}`, name]}
                labelFormatter={(label) => `Sprint ${label}`}
              />
              <Bar dataKey="score" name="Health Score" radius={[4, 4, 0, 0]}>
                {scores.map((s, idx) => (
                  <Cell key={idx} fill={healthScoreColor(s.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detail table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sprint Health Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sprint</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Velocity</TableHead>
                <TableHead className="text-right">Carry-over</TableHead>
                <TableHead className="text-right">Classification</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Effort</TableHead>
                <TableHead className="text-right">CO %</TableHead>
                <TableHead className="text-right">Coverage %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scores.map(s => (
                <TableRow key={s.sprint}>
                  <TableCell className="font-medium">{s.label}</TableCell>
                  <TableCell className="text-right font-mono font-bold" style={{ color: healthScoreColor(s.score) }}>
                    {s.score}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.velocityScore}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.carryOverScore}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.classificationScore}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.balanceScore}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.effort} SP</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.carryOverPercent}%</TableCell>
                  <TableCell className="text-right font-mono text-xs">{s.coveragePercent}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
