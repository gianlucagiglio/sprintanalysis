import { AppLayout } from '@/components/layout/AppLayout'
import { useGlobalQuizStats } from '@/hooks/useGlobalQuizStats'
import { Card } from '@/components/ui/Card'
import { Trophy, Medal, Users } from 'lucide-react'

const podiumColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']
const podiumStyles = [
  'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200',
  'bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200',
  'bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200',
]

export function LeaderboardPage() {
  const { globalLeaderboard, sessionWinners, loading } = useGlobalQuizStats()

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-retro-text flex items-center gap-2">
            <Trophy size={24} className="text-yellow-500" />
            Classifiche Quiz
          </h1>
          <p className="text-sm text-retro-text-secondary mt-1">
            Classifica globale e vincitori per ogni retrospettiva
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-retro-primary" />
          </div>
        ) : globalLeaderboard.length === 0 ? (
          <Card className="text-center py-12">
            <Trophy size={48} className="mx-auto text-retro-text-secondary mb-3 opacity-40" />
            <p className="text-lg font-medium text-retro-text">Nessun quiz giocato</p>
            <p className="text-sm text-retro-text-secondary mt-1">
              Le classifiche appariranno dopo il primo quiz in una retrospettiva
            </p>
          </Card>
        ) : (
          <>
            {/* Classifica globale */}
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <Trophy size={20} className="text-yellow-500" />
                <h2 className="text-lg font-semibold text-retro-text">Classifica globale</h2>
              </div>
              <div className="space-y-2">
                {globalLeaderboard.map((entry, i) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      i < 3 ? podiumStyles[i] : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {i < 3 ? (
                        <Medal size={22} className={podiumColors[i]} />
                      ) : (
                        <span className="text-sm font-medium text-retro-text-secondary">{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-sm flex-1 ${i === 0 ? 'font-bold text-retro-text' : 'text-retro-text font-medium'}`}>
                      {entry.name}
                    </span>
                    <span className="text-xs text-retro-text-secondary">
                      {entry.sessionsPlayed} {entry.sessionsPlayed === 1 ? 'sessione' : 'sessioni'}
                    </span>
                    <span className="font-mono font-bold text-retro-primary min-w-[60px] text-right">
                      {entry.totalPoints} pt
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Vincitori per sessione */}
            <div>
              <h2 className="text-lg font-semibold text-retro-text mb-4">Vincitori per sessione</h2>
              {sessionWinners.length === 0 ? (
                <Card className="text-center py-8">
                  <p className="text-sm text-retro-text-secondary">Nessun quiz completato</p>
                </Card>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sessionWinners.map((sw) => (
                    <Card key={sw.sessionId} hover className="!p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-retro-text truncate flex-1">
                          {sw.sessionTitle}
                        </h3>
                        <span className="text-xs text-retro-text-secondary ml-2 whitespace-nowrap">
                          {new Date(sw.sessionDate).toLocaleDateString('it-IT')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-sm font-medium text-retro-text">{sw.winnerName}</span>
                        <span className="font-mono text-xs font-bold text-retro-primary">{sw.winnerPoints} pt</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-retro-text-secondary">
                        <Users size={12} />
                        {sw.participantCount} partecipanti
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  )
}
