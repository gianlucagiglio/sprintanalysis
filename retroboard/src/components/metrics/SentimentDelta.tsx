import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import type { SentimentDeltaPoint } from '@/hooks/useMetrics'

interface SentimentDeltaProps {
  data: SentimentDeltaPoint[]
}

export function SentimentDelta({ data }: SentimentDeltaProps) {
  if (!data.length) {
    return (
      <Card className="!rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3">Variazione tra sessioni</h3>
        <p className="text-sm text-retro-text-secondary">Servono almeno 2 sessioni per calcolare le variazioni</p>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    name: d.sessionTitle.length > 15 ? d.sessionTitle.slice(0, 15) + '...' : d.sessionTitle,
    delta: d.delta,
  }))

  return (
    <Card className="!rounded-2xl">
      <h3 className="text-sm font-semibold text-retro-text mb-3">Variazione tra sessioni</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px 0 rgb(0 0 0 / 0.12)',
            }}
            formatter={(value: number) => [value > 0 ? `+${value}` : value, 'Delta']}
          />
          <ReferenceLine y={0} stroke="#94A3B8" />
          <Bar dataKey="delta" radius={[6, 6, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.delta >= 0 ? '#10B981' : '#EF4444'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
