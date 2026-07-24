import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChart as PieChartIcon, Table } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { SessionMoodData } from '@/hooks/useGlobalMoods'

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

const EMOJI: Record<string, string> = {
  glad: '😊',
  sad: '😢',
  mad: '😠',
  custom: '💭',
}

interface SentimentOverviewProps {
  sessionMoods: SessionMoodData[]
  globalCounts: { glad: number; sad: number; mad: number; custom: number }
}

export function SentimentOverview({ sessionMoods, globalCounts }: SentimentOverviewProps) {
  const pieData = Object.entries(globalCounts)
    .filter(([, count]) => count > 0)
    .map(([mood, count]) => ({
      name: LABELS[mood] || mood,
      value: count,
      color: COLORS[mood] || '#94A3B8',
      emoji: EMOJI[mood] || '💬',
    }))

  const total = Object.values(globalCounts).reduce((sum, val) => sum + val, 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Donut Chart */}
      <Card className="!p-6 !rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <PieChartIcon size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-retro-text">Distribuzione Globale</h3>
            <p className="text-sm text-retro-text-secondary">Sentiment complessivo</p>
          </div>
        </div>

        {pieData.length > 0 ? (
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.color}
                      strokeWidth={2}
                      stroke="#FFFFFF"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E2E8F0',
                    borderRadius: '16px',
                    boxShadow: '0 12px 32px 0 rgb(0 0 0 / 0.15)',
                    padding: '12px 16px',
                  }}
                  formatter={(value: number) => [
                    `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
                    '',
                  ]}
                  labelStyle={{ fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-3xl font-bold text-retro-text">{total}</p>
              <p className="text-xs text-retro-text-secondary font-medium">Voti Totali</p>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {pieData.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-slate-50"
                >
                  <span className="text-base">{entry.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-retro-text-secondary truncate">{entry.name}</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-sm font-bold" style={{ color: entry.color }}>
                        {entry.value}
                      </p>
                      <p className="text-[10px] font-semibold text-retro-text-secondary">
                        {total > 0 ? Math.round((entry.value / total) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
              <PieChartIcon size={32} className="text-slate-400" />
            </div>
            <p className="text-sm text-retro-text-secondary">Nessun voto registrato</p>
          </div>
        )}
      </Card>

      {/* Summary Table */}
      <Card className="!p-6 !rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Table size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-retro-text">Riepilogo Sessioni</h3>
            <p className="text-sm text-retro-text-secondary">Sentiment prevalente</p>
          </div>
        </div>

        {sessionMoods.length > 0 ? (
          <div className="bg-slate-50 rounded-2xl p-4 max-h-[330px] overflow-y-auto">
            <div className="space-y-2">
              {sessionMoods.map((s) => (
                <div
                  key={s.sessionId}
                  className="bg-white rounded-xl p-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-retro-text truncate">
                        {s.sessionTitle}
                      </p>
                      <p className="text-xs text-retro-text-secondary">
                        {new Date(s.sessionDate).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                      style={{
                        backgroundColor: COLORS[s.dominant] + '20',
                        color: COLORS[s.dominant],
                      }}
                    >
                      <span className="text-sm">{EMOJI[s.dominant]}</span>
                      {LABELS[s.dominant]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${s.total > 0 ? (s[s.dominant as keyof typeof s] as number / s.total) * 100 : 0}%`,
                          backgroundColor: COLORS[s.dominant],
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-retro-text-secondary shrink-0">
                      {s.total} voti
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
              <Table size={32} className="text-slate-400" />
            </div>
            <p className="text-sm text-retro-text-secondary">Nessuna sessione trovata</p>
          </div>
        )}
      </Card>
    </div>
  )
}
