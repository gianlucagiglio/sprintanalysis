import { Card } from '@/components/ui/Card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface TeamMoodTrendProps {
  teamMoodCounts: {
    ottima: number
    buona: number
    sufficiente: number
    scarsa: number
  }
}

const COLORS = {
  ottima: '#10b981',
  buona: '#0ea5e9',
  sufficiente: '#f59e0b',
  scarsa: '#ef4444',
}

const LABELS = {
  ottima: 'Ottima',
  buona: 'Buona',
  sufficiente: 'Sufficiente',
  scarsa: 'Scarsa',
}

export function TeamMoodTrend({ teamMoodCounts }: TeamMoodTrendProps) {
  const data = Object.entries(teamMoodCounts)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: LABELS[key as keyof typeof LABELS],
      value,
      color: COLORS[key as keyof typeof COLORS],
    }))

  const total = Object.values(teamMoodCounts).reduce((a, b) => a + b, 0)

  if (total === 0) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-retro-text mb-3">Collaborazione Team</h3>
        <p className="text-xs text-retro-text-secondary text-center py-8">Nessun dato disponibile</p>
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-retro-text mb-3">Collaborazione Team</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
