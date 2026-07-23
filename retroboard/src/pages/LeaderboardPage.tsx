import { AppLayout } from '@/components/layout/AppLayout'
import { useGlobalQuizStats } from '@/hooks/useGlobalQuizStats'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import {
  Trophy,
  Medal,
  Users,
  Zap,
  Target,
  Calendar,
  Crown,
  Hash,
  FolderOpen,
} from 'lucide-react'

const podiumGradients = [
  'from-yellow-400 to-amber-500',  // gold
  'from-slate-300 to-slate-400',   // silver
  'from-amber-500 to-orange-600',  // bronze
]

const podiumBg = [
  'bg-gradient-to-br from-yellow-50 to-amber-50 ring-1 ring-yellow-200',
  'bg-gradient-to-br from-slate-50 to-gray-100 ring-1 ring-slate-200',
  'bg-gradient-to-br from-orange-50 to-amber-50 ring-1 ring-amber-200',
]

const podiumHeights = ['h-28', 'h-20', 'h-16']

export function LeaderboardPage() {
  const { globalLeaderboard, sessionWinners, loading } = useGlobalQuizStats()
  const user = useAuthStore((s) => s.user)

  const totalPoints = globalLeaderboard.reduce((sum, e) => sum + e.totalPoints, 0)
  const totalSessions = new Set(sessionWinners.map((w) => w.sessionId)).size
  const currentUserEntry = globalLeaderboard.find((e) => e.userId === user?.id)
  const currentUserRank = currentUserEntry
    ? globalLeaderboard.indexOf(currentUserEntry) + 1
    : null

  // Top 3 for podium, rest for table
  const podium = globalLeaderboard.slice(0, 3)
  // Reorder podium for visual: [2nd, 1st, 3rd]
  const podiumDisplay = podium.length >= 3
    ? [podium[1], podium[0], podium[2]]
    : podium

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 p-8 md:p-10 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Trophy size={180} />
          </div>
          <div className="relative">
            <Badge className="!bg-white/20 !text-white !backdrop-blur-sm mb-4">
              Classifiche Quiz
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold tracking-display mb-1">Hall of Fame</h1>
            <p className="text-white/70 text-sm">
              Classifica globale e vincitori per ogni retrospettiva
            </p>

            {/* Current user rank */}
            {currentUserRank && currentUserEntry && (
              <div className="mt-5 inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  #{currentUserRank}
                </div>
                <div>
                  <p className="text-sm font-semibold">La tua posizione</p>
                  <p className="text-xs text-white/70">{currentUserEntry.totalPoints} punti in {currentUserEntry.sessionsPlayed} {currentUserEntry.sessionsPlayed === 1 ? 'sessione' : 'sessioni'}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Skeleton variant="text" width={30} />
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width="40%" className="flex-1" />
                <Skeleton variant="text" width={60} />
              </div>
            ))}
          </div>
        ) : globalLeaderboard.length === 0 ? (
          <Card className="!rounded-2xl text-center !py-16">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-amber-400" />
            </div>
            <p className="text-lg font-semibold text-retro-text mb-1">Nessun quiz giocato</p>
            <p className="text-sm text-retro-text-secondary">
              Le classifiche appariranno dopo il primo quiz in una retrospettiva
            </p>
          </Card>
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Quiz giocati', value: totalSessions, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { label: 'Punti totali', value: totalPoints, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
                { label: 'Giocatori', value: globalLeaderboard.length, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="!p-4 !rounded-2xl text-center">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon size={20} className={stat.color} />
                    </div>
                    <p className="text-2xl font-bold text-retro-text">{stat.value}</p>
                    <p className="text-xs text-retro-text-secondary mt-0.5">{stat.label}</p>
                  </Card>
                )
              })}
            </div>

            {/* ── Podium ── */}
            {podium.length >= 3 && (
              <div>
                <h2 className="text-lg font-bold text-retro-text mb-5 flex items-center gap-2">
                  <Crown size={18} className="text-yellow-500" />
                  Podio
                </h2>
                <div className="flex items-end justify-center gap-3 md:gap-4">
                  {podiumDisplay.map((entry, displayIdx) => {
                    // Map display index back to actual rank: [2nd, 1st, 3rd] → [1, 0, 2]
                    const actualRank = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2
                    return (
                      <div key={entry.userId} className="flex flex-col items-center flex-1 max-w-[160px]">
                        {/* Avatar */}
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br ${podiumGradients[actualRank]} flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg mb-2 ${actualRank === 0 ? 'ring-4 ring-yellow-200 scale-110' : ''}`}>
                          {entry.name.charAt(0).toUpperCase()}
                        </div>
                        <p className={`text-sm font-semibold text-retro-text text-center truncate w-full ${actualRank === 0 ? 'text-base' : ''}`}>
                          {entry.name}
                        </p>
                        <p className="text-xs font-bold font-mono text-retro-primary">{entry.totalPoints} pt</p>
                        {/* Podium block */}
                        <div className={`w-full ${podiumHeights[actualRank]} ${podiumBg[actualRank]} rounded-t-2xl mt-2 flex items-start justify-center pt-3`}>
                          {actualRank === 0 ? (
                            <Trophy size={24} className="text-yellow-500" />
                          ) : (
                            <Medal size={20} className={actualRank === 1 ? 'text-slate-400' : 'text-amber-600'} />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Full leaderboard ── */}
            <div>
              <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
                <Hash size={18} className="text-indigo-500" />
                Classifica completa
              </h2>
              <Card className="!p-0 !rounded-2xl overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {globalLeaderboard.map((entry, i) => {
                    const isCurrentUser = entry.userId === user?.id
                    return (
                      <div
                        key={entry.userId}
                        className={`flex items-center gap-3 px-5 py-3.5 transition-colors ${
                          isCurrentUser ? 'bg-retro-primary-light' : i < 3 ? podiumBg[i] : 'hover:bg-slate-50'
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-8 h-8 flex items-center justify-center shrink-0">
                          {i < 3 ? (
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${podiumGradients[i]} flex items-center justify-center`}>
                              <span className="text-xs font-bold text-white">{i + 1}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-medium text-retro-text-secondary">{i + 1}</span>
                          )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm truncate ${i === 0 ? 'font-bold' : 'font-medium'} text-retro-text`}>
                              {entry.name}
                            </span>
                            {isCurrentUser && (
                              <Badge variant="primary" className="!text-[10px] !px-2 !py-0.5">Tu</Badge>
                            )}
                          </div>
                          <span className="text-xs text-retro-text-secondary">
                            {entry.sessionsPlayed} {entry.sessionsPlayed === 1 ? 'sessione' : 'sessioni'}
                          </span>
                        </div>

                        {/* Points */}
                        <span className="font-mono font-bold text-retro-primary text-sm">
                          {entry.totalPoints} pt
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>

            {/* ── Session winners ── */}
            {sessionWinners.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
                  <FolderOpen size={18} className="text-amber-500" />
                  Vincitori per sessione
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {sessionWinners.map((sw) => (
                    <Card key={sw.sessionId} hover className="!p-0 !rounded-2xl overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h3 className="text-sm font-semibold text-retro-text truncate flex-1">
                            {sw.sessionTitle}
                          </h3>
                          <span className="flex items-center gap-1 text-xs text-retro-text-secondary shrink-0">
                            <Calendar size={10} />
                            {new Date(sw.sessionDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-sm font-bold">
                              {sw.winnerName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-retro-text">{sw.winnerName}</p>
                              <p className="text-xs text-retro-text-secondary flex items-center gap-1">
                                <Users size={10} /> {sw.participantCount} giocatori
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-bold text-retro-primary">{sw.winnerPoints}</p>
                            <p className="text-[10px] text-retro-text-secondary">punti</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}
