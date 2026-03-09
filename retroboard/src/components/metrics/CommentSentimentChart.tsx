import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import type { CommentSentimentData } from '@/hooks/useMetrics'

interface CommentSentimentChartProps {
  data: CommentSentimentData[]
}

export function CommentSentimentChart({ data }: CommentSentimentChartProps) {
  if (!data.length) {
    return (
      <Card className="!rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3">Sentiment commenti</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </Card>
    )
  }

  const chartData = data.map((d) => ({
    name: d.sessionTitle.length > 15 ? d.sessionTitle.slice(0, 15) + '...' : d.sessionTitle,
    Positivi: d.positive,
    Negativi: d.negative,
    Neutri: d.neutral,
  }))

  return (
    <Card className="!rounded-2xl">
      <h3 className="text-sm font-semibold text-retro-text mb-3">Sentiment commenti</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              boxShadow: '0 8px 24px 0 rgb(0 0 0 / 0.12)',
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="Positivi"
            stackId="1"
            stroke="#10B981"
            fill="#10B981"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Negativi"
            stackId="1"
            stroke="#EF4444"
            fill="#EF4444"
            fillOpacity={0.6}
          />
          <Area
            type="monotone"
            dataKey="Neutri"
            stackId="1"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  )
}
