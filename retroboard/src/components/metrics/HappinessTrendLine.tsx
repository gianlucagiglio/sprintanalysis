import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import type { HappinessDataPoint } from '@/hooks/useMetrics'

interface HappinessTrendLineProps {
  data: HappinessDataPoint[]
}

export function HappinessTrendLine({ data }: HappinessTrendLineProps) {
  if (!data.length) {
    return (
      <Card className="!rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3">Trend felicita\u0300</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </Card>
    )
  }

  const avg = data.reduce((sum, d) => sum + d.score, 0) / data.length
  const lastTwo = data.slice(-2)
  const trendPositive = lastTwo.length < 2 || lastTwo[1].score >= lastTwo[0].score

  const chartData = data.map((d) => ({
    name: d.sessionTitle.length > 15 ? d.sessionTitle.slice(0, 15) + '...' : d.sessionTitle,
    score: d.score,
  }))

  return (
    <Card className="!rounded-2xl">
      <h3 className="text-sm font-semibold text-retro-text mb-3">Trend felicita\u0300</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px 0 rgb(0 0 0 / 0.12)',
            }}
            formatter={(value: number) => [value.toFixed(2), 'Score']}
          />
          <ReferenceLine
            y={avg}
            stroke="#94A3B8"
            strokeDasharray="5 5"
            label={{ value: `Media: ${avg.toFixed(2)}`, fill: '#94A3B8', fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke={trendPositive ? '#10B981' : '#EF4444'}
            strokeWidth={2.5}
            dot={{ fill: trendPositive ? '#10B981' : '#EF4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
