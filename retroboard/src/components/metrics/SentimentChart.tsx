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
import { Smile } from 'lucide-react'
import type { SessionMoodData } from '@/hooks/useGlobalMoods'

const COLORS = {
  glad: '#10B981',
  sad: '#F59E0B',
  mad: '#EF4444',
  custom: '#6366F1',
}

const EMOJI = {
  glad: '😊',
  sad: '😢',
  mad: '😠',
  custom: '💭',
}

interface SentimentChartProps {
  sessionMoods: SessionMoodData[]
}

export function SentimentChart({ sessionMoods }: SentimentChartProps) {
  if (!sessionMoods.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
          <Smile size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-retro-text mb-2">Sentiment per Retrospettiva</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </div>
    )
  }

  const data = sessionMoods.map((s) => ({
    name: s.sessionTitle.length > 20 ? s.sessionTitle.slice(0, 20) + '...' : s.sessionTitle,
    Contento: s.glad,
    Triste: s.sad,
    Arrabbiato: s.mad,
    Altro: s.custom,
  }))

  const totals = sessionMoods.map(s => s.glad + s.sad + s.mad + s.custom)
  const maxTotal = Math.max(...totals)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Smile size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-retro-text">Sentiment per Retrospettiva</h3>
        </div>
        <p className="text-sm text-retro-text-secondary">
          Distribuzione dei mood per ogni sessione
        </p>
      </div>

      {/* Legend con emoji */}
      <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-slate-200">
        {Object.entries(EMOJI).map(([key, emoji]) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[key as keyof typeof COLORS] }}
              />
              <span className="text-sm font-medium text-retro-text capitalize">
                {key === 'glad' ? 'Contento' : key === 'sad' ? 'Triste' : key === 'mad' ? 'Arrabbiato' : 'Altro'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            height={70}
            stroke="#CBD5E1"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            stroke="#CBD5E1"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: '16px',
              boxShadow: '0 12px 32px 0 rgb(0 0 0 / 0.15)',
              padding: '12px 16px',
            }}
            labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
          />
          <Bar dataKey="Contento" stackId="a" fill={COLORS.glad} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Triste" stackId="a" fill={COLORS.sad} />
          <Bar dataKey="Arrabbiato" stackId="a" fill={COLORS.mad} />
          <Bar dataKey="Altro" stackId="a" fill={COLORS.custom} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
