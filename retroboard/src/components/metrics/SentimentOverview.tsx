import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
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

const DOMINANT_LABELS: Record<string, string> = {
  glad: 'Contento',
  sad: 'Triste',
  mad: 'Arrabbiato',
  custom: 'Altro',
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
    }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Pie Chart */}
      <Card className="!rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3">Distribuzione globale sentiment</h3>
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px 0 rgb(0 0 0 / 0.12)',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-retro-text-secondary">Nessun voto registrato</p>
        )}
      </Card>

      {/* Summary Table */}
      <Card className="!rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3">Riepilogo per sessione</h3>
        {sessionMoods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-retro-border">
                  <th className="text-left py-2.5 px-2 text-retro-text-secondary font-medium">Sessione</th>
                  <th className="text-left py-2.5 px-2 text-retro-text-secondary font-medium">Data</th>
                  <th className="text-center py-2.5 px-2 text-retro-text-secondary font-medium">Voti</th>
                  <th className="text-left py-2.5 px-2 text-retro-text-secondary font-medium">Prevalente</th>
                </tr>
              </thead>
              <tbody>
                {sessionMoods.map((s) => (
                  <tr key={s.sessionId} className="border-b border-retro-border/50 hover:bg-slate-50 transition-colors rounded-lg">
                    <td className="py-2.5 px-2 text-retro-text truncate max-w-[150px]">{s.sessionTitle}</td>
                    <td className="py-2.5 px-2 text-retro-text-secondary">
                      {new Date(s.sessionDate).toLocaleDateString('it-IT')}
                    </td>
                    <td className="py-2.5 px-2 text-center text-retro-text font-medium">{s.total}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: COLORS[s.dominant] + '20',
                          color: COLORS[s.dominant],
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: COLORS[s.dominant] }}
                        />
                        {DOMINANT_LABELS[s.dominant]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-retro-text-secondary">Nessuna sessione trovata</p>
        )}
      </Card>
    </div>
  )
}
