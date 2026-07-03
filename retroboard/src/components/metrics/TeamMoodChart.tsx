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
import type { SessionTeamMoodData } from '@/hooks/useGlobalMoods'

const COLORS = {
  ottima: '#10B981',
  buona: '#0EA5E9',
  sufficiente: '#F59E0B',
  scarsa: '#EF4444',
}

interface TeamMoodChartProps {
  sessionTeamMoods: SessionTeamMoodData[]
}

export function TeamMoodChart({ sessionTeamMoods }: TeamMoodChartProps) {
  // Filtra solo le sessioni che hanno voti team mood
  const sessionsWithVotes = sessionTeamMoods.filter(s => s.total > 0)

  if (!sessionsWithVotes.length) {
    return (
      <Card className="!rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3">Collaborazione team per retrospettiva</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </Card>
    )
  }

  const data = sessionsWithVotes.map((s) => ({
    name: s.sessionTitle.length > 20 ? s.sessionTitle.slice(0, 20) + '...' : s.sessionTitle,
    Ottima: s.ottima,
    Buona: s.buona,
    Sufficiente: s.sufficiente,
    Scarsa: s.scarsa,
  }))

  return (
    <Card className="!rounded-2xl">
      <h3 className="text-sm font-semibold text-retro-text mb-3">Collaborazione team per retrospettiva</h3>
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
          <Bar dataKey="Ottima" stackId="a" fill={COLORS.ottima} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Buona" stackId="a" fill={COLORS.buona} />
          <Bar dataKey="Sufficiente" stackId="a" fill={COLORS.sufficiente} />
          <Bar dataKey="Scarsa" stackId="a" fill={COLORS.scarsa} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
