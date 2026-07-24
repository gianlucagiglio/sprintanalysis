import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Users } from 'lucide-react'
import type { SessionTeamMoodData } from '@/hooks/useGlobalMoods'

const COLORS = {
  ottima: '#10B981',
  buona: '#0EA5E9',
  sufficiente: '#F59E0B',
  scarsa: '#EF4444',
}

const EMOJI = {
  ottima: '🌟',
  buona: '👍',
  sufficiente: '😐',
  scarsa: '👎',
}

interface TeamMoodChartProps {
  sessionTeamMoods: SessionTeamMoodData[]
}

export function TeamMoodChart({ sessionTeamMoods }: TeamMoodChartProps) {
  const sessionsWithVotes = sessionTeamMoods.filter(s => s.total > 0)

  if (!sessionsWithVotes.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
          <Users size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-retro-text mb-2">Collaborazione Team</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </div>
    )
  }

  const data = sessionsWithVotes.map((s) => ({
    name: s.sessionTitle.length > 20 ? s.sessionTitle.slice(0, 20) + '...' : s.sessionTitle,
    Ottima: s.ottima,
    Buona: s.buona,
    Sufficiente: s.sufficiente,
    Scarsa: s.scarsa,
  }))

  const totalOttima = sessionsWithVotes.reduce((sum, s) => sum + s.ottima, 0)
  const totalBuona = sessionsWithVotes.reduce((sum, s) => sum + s.buona, 0)
  const totalSufficiente = sessionsWithVotes.reduce((sum, s) => sum + s.sufficiente, 0)
  const totalScarsa = sessionsWithVotes.reduce((sum, s) => sum + s.scarsa, 0)
  const total = totalOttima + totalBuona + totalSufficiente + totalScarsa

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Users size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-retro-text">Collaborazione per Retrospettiva</h3>
        </div>
        <p className="text-sm text-retro-text-secondary">
          Qualità della collaborazione team per sessione
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
                {key}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-2 border border-emerald-100">
          <p className="text-xs text-retro-text-secondary mb-0.5">Ottima</p>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold text-emerald-600">{totalOttima}</p>
            <p className="text-xs text-emerald-600 font-semibold">
              {total > 0 ? Math.round((totalOttima / total) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-2 border border-cyan-100">
          <p className="text-xs text-retro-text-secondary mb-0.5">Buona</p>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold text-cyan-600">{totalBuona}</p>
            <p className="text-xs text-cyan-600 font-semibold">
              {total > 0 ? Math.round((totalBuona / total) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-2 border border-amber-100">
          <p className="text-xs text-retro-text-secondary mb-0.5">Sufficiente</p>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold text-amber-600">{totalSufficiente}</p>
            <p className="text-xs text-amber-600 font-semibold">
              {total > 0 ? Math.round((totalSufficiente / total) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-red-50 rounded-lg p-2 border border-rose-100">
          <p className="text-xs text-retro-text-secondary mb-0.5">Scarsa</p>
          <div className="flex items-baseline gap-1">
            <p className="text-lg font-bold text-rose-600">{totalScarsa}</p>
            <p className="text-xs text-rose-600 font-semibold">
              {total > 0 ? Math.round((totalScarsa / total) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
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
          <Bar dataKey="Ottima" stackId="a" fill={COLORS.ottima} radius={[0, 0, 0, 0]} />
          <Bar dataKey="Buona" stackId="a" fill={COLORS.buona} />
          <Bar dataKey="Sufficiente" stackId="a" fill={COLORS.sufficiente} />
          <Bar dataKey="Scarsa" stackId="a" fill={COLORS.scarsa} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
