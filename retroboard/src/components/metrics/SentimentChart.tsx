import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import type { SessionMoodData } from '@/hooks/useGlobalMoods'

const COLORS = {
  glad: '#10B981',
  sad: '#F59E0B',
  mad: '#EF4444',
  custom: '#6366F1',
}

interface SentimentChartProps {
  sessionMoods: SessionMoodData[]
}

export function SentimentChart({ sessionMoods }: SentimentChartProps) {
  if (!sessionMoods.length) {
    return (
      <Card className="!rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3">Sentiment per retrospettiva</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </Card>
    )
  }

  const data = sessionMoods.map((s) => ({
    name: s.sessionTitle.length > 20 ? s.sessionTitle.slice(0, 20) + '...' : s.sessionTitle,
    Contento: s.glad,
    Triste: s.sad,
    Arrabbiato: s.mad,
    Altro: s.custom,
  }))

  return (
    <Card className="!rounded-2xl">
      <h3 className="text-sm font-semibold text-retro-text mb-3">Sentiment per retrospettiva</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
          <Bar dataKey="Contento" stackId="a" fill={COLORS.glad} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Triste" stackId="a" fill={COLORS.sad} />
          <Bar dataKey="Arrabbiato" stackId="a" fill={COLORS.mad} />
          <Bar dataKey="Altro" stackId="a" fill={COLORS.custom} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
