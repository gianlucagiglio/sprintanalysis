import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card } from '@/components/ui/Card'
import type { MoodVote } from '@/types/database'

const COLORS: Record<string, string> = {
  glad: '#10B981',
  sad: '#F59E0B',
  mad: '#EF4444',
  custom: '#6366F1',
}

const LABELS: Record<string, string> = {
  glad: 'Contento',
  sad: 'Triste',
  mad: 'Arrabbiato',
  custom: 'Altro',
}

interface MoodTrendProps {
  moodVotes: MoodVote[]
}

export function MoodTrend({ moodVotes }: MoodTrendProps) {
  const data = Object.entries(
    moodVotes.reduce<Record<string, number>>((acc, v) => {
      acc[v.mood] = (acc[v.mood] || 0) + 1
      return acc
    }, {})
  ).map(([mood, count]) => ({
    name: LABELS[mood] || mood,
    value: count,
    color: COLORS[mood] || '#94A3B8',
  }))

  if (!data.length) return null

  return (
    <Card>
      <h3 className="text-sm font-medium text-retro-text mb-3">Mood del team</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
