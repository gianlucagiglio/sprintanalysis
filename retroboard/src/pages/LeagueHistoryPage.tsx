import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AppLayout } from '@/components/layout/AppLayout'
import { useLeagues, useLeagueHistory } from '@/hooks/useLeagues'
import { useAuthStore } from '@/stores/authStore'
import { useTeamStore } from '@/stores/teamStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { LeagueAdminPanel } from '@/components/gamification/LeagueAdminPanel'
import {
  Trophy,
  Crown,
  Medal,
  Calendar,
  Users,
  Target,
  Archive,
  TrendingUp,
  Award,
  Zap,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const podiumPositions = [
  { icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { icon: Medal, color: 'text-slate-300', bg: 'bg-slate-400/10' },
  { icon: Medal, color: 'text-orange-400', bg: 'bg-orange-500/10' },
]

export function LeagueHistoryPage() {
  const currentTeamId = useTeamStore(s => s.currentTeamId)
  const { leagues, loading: leaguesLoading } = useLeagues(currentTeamId)
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())

  // Seleziona la league da visualizzare (default: prima chiusa)
  const closedLeagues = leagues.filter((l) => l.status === 'closed')
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(
    closedLeagues[0]?.id || null
  )

  const {
    league: selectedLeague,
    rankings,
    loading: historyLoading,
  } = useLeagueHistory(selectedLeagueId)

  const loading = leaguesLoading || historyLoading

  // Top 3 for podium (riordinati per effetto visivo: 2°, 1°, 3°)
  const podium = rankings.slice(0, 3)
  const podiumDisplay = podium.length >= 3
    ? [podium[1], podium[0], podium[2]] // Silver, Gold, Bronze
    : podium.length === 2
    ? [null, podium[0], podium[1]] // Skip silver, show gold and bronze
    : podium.length === 1
    ? [null, podium[0], null] // Only gold
    : []

  // Current user stats
  const currentUserRanking = rankings.find((r) => r.user_id === user?.id)

  // Stats calcolate
  const stats = useMemo(() => {
    if (!selectedLeague || rankings.length === 0) return null

    const totalPoints = rankings.reduce((acc, r) => acc + r.total_points, 0)
    const totalGames = rankings.reduce((acc, r) => acc + r.games_played, 0)
    const avgPointsPerGame = totalGames > 0 ? totalPoints / totalGames : 0
    const topScore = rankings[0]?.total_points || 0

    return {
      totalPlayers: rankings.length,
      totalPoints,
      totalGames,
      avgPointsPerGame,
      topScore,
    }
  }, [rankings, selectedLeague])

  // Dati per grafico distribuzione top 10
  const chartData = useMemo(() => {
    return rankings.slice(0, 10).map((r, idx) => ({
      name: r.user_name.split(' ')[0], // Solo nome
      points: r.total_points,
      rank: idx + 1,
    }))
  }, [rankings])

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <PageHeader
          variant="hero"
          title="Storico League Quiz"
          description="Classifiche storiche delle stagioni passate"
          icon={Archive}
          gradient="primary"
          badge={{
            label: closedLeagues.length > 0 ? `${closedLeagues.length} Stagioni` : 'Nessuna stagione',
            variant: 'default',
          }}
        />

        {/* Admin Panel (solo super admin) */}
        {isSuperAdmin && (
          <div>
            <h2 className="text-xl font-bold text-retro-text mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Gestione League
            </h2>
            <LeagueAdminPanel />
          </div>
        )}

        {/* League Selector */}
        {closedLeagues.length > 0 ? (
          <>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-retro-text mb-6 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-retro-primary/10">
                  <Calendar className="w-5 h-5 text-retro-primary" />
                </div>
                Seleziona Stagione
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {closedLeagues.map((league, index) => {
                  const isSelected = selectedLeagueId === league.id
                  const startDate = new Date(league.start_date)
                  const endDate = league.end_date ? new Date(league.end_date) : null
                  const durationDays = endDate
                    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                    : 0

                  return (
                    <motion.button
                      key={league.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedLeagueId(league.id)}
                      className={`relative p-5 rounded-xl border-2 transition-all text-left overflow-hidden group ${
                        isSelected
                          ? 'border-retro-primary bg-gradient-to-br from-retro-primary/20 to-retro-primary/5 shadow-lg shadow-retro-primary/20'
                          : 'border-retro-border bg-retro-surface hover:border-retro-primary/50 hover:shadow-md'
                      }`}
                    >
                      {/* Badge angolo se selezionato */}
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <div className="w-3 h-3 rounded-full bg-retro-primary animate-pulse" />
                        </div>
                      )}

                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${
                          isSelected ? 'bg-retro-primary/20' : 'bg-retro-primary/10'
                        }`}>
                          <Trophy className={`w-5 h-5 ${
                            isSelected ? 'text-retro-primary' : 'text-retro-text/60'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-bold mb-1 ${
                            isSelected ? 'text-retro-primary' : 'text-retro-text'
                          }`}>
                            {league.name}
                          </div>
                          {league.description && (
                            <div className="text-xs text-retro-text/60 line-clamp-2">
                              {league.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-retro-text/60">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {startDate.toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                            {' → '}
                            {endDate
                              ? endDate.toLocaleDateString('it-IT', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })
                              : 'In corso'}
                          </span>
                        </div>

                        {durationDays > 0 && (
                          <div className="flex items-center gap-2 text-xs text-retro-text/60">
                            <div className={`px-2 py-0.5 rounded ${
                              isSelected ? 'bg-retro-primary/10' : 'bg-retro-surface'
                            }`}>
                              {durationDays} {durationDays === 1 ? 'giorno' : 'giorni'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Hover effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-retro-primary/0 via-retro-primary/5 to-retro-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                    </motion.button>
                  )
                })}
              </div>
            </Card>

            {/* Selected League Rankings */}
            {selectedLeague && (
              <>
                {/* League Info */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="relative p-8 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-blue-500/10 border-purple-500/20 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-retro-primary/10 to-transparent rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row items-start justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                            <Trophy className="w-8 h-8 text-purple-400" />
                          </div>
                          <div>
                            <h2 className="text-3xl font-black text-retro-text mb-1">
                              {selectedLeague.name}
                            </h2>
                            {selectedLeague.status === 'closed' && (
                              <Badge variant="outline" className="border-red-500/30 text-red-400">
                                Stagione Conclusa
                              </Badge>
                            )}
                          </div>
                        </div>

                        {selectedLeague.description && (
                          <p className="text-retro-text/70 mb-4 text-lg">
                            {selectedLeague.description}
                          </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 bg-retro-surface/50 rounded-lg p-3">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="text-xs text-retro-text/60">Inizio</div>
                              <div className="font-bold text-retro-text">
                                {new Date(selectedLeague.start_date).toLocaleDateString('it-IT', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>

                          {selectedLeague.end_date && (
                            <div className="flex items-center gap-3 bg-retro-surface/50 rounded-lg p-3">
                              <Calendar className="w-5 h-5 text-purple-400" />
                              <div>
                                <div className="text-xs text-retro-text/60">Fine</div>
                                <div className="font-bold text-retro-text">
                                  {new Date(selectedLeague.end_date).toLocaleDateString('it-IT', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-3 bg-retro-surface/50 rounded-lg p-3">
                            <Users className="w-5 h-5 text-green-400" />
                            <div>
                              <div className="text-xs text-retro-text/60">Partecipanti</div>
                              <div className="font-bold text-retro-text">
                                {rankings.length} {rankings.length === 1 ? 'giocatore' : 'giocatori'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Current User Stats (if participated) */}
                {currentUserRanking && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-blue-500/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <Award className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-retro-text">La Tua Performance</h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Posizione */}
                        <div className="bg-retro-surface/50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-black text-retro-primary mb-1">
                            #{currentUserRanking.rank}
                          </div>
                          <div className="text-xs text-retro-text/60">Posizione</div>
                        </div>

                        {/* Punti Totali */}
                        <div className="bg-retro-surface/50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-black text-retro-primary mb-1">
                            {currentUserRanking.total_points.toLocaleString('it-IT')}
                          </div>
                          <div className="text-xs text-retro-text/60">Punti Totali</div>
                        </div>

                        {/* Partite */}
                        <div className="bg-retro-surface/50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-black text-retro-primary mb-1">
                            {currentUserRanking.games_played}
                          </div>
                          <div className="text-xs text-retro-text/60">Partite</div>
                        </div>

                        {/* Media */}
                        <div className="bg-retro-surface/50 rounded-lg p-4 text-center">
                          <div className="text-3xl font-black text-retro-primary mb-1">
                            {currentUserRanking.games_played > 0
                              ? Math.round(currentUserRanking.total_points / currentUserRanking.games_played)
                              : 0}
                          </div>
                          <div className="text-xs text-retro-text/60">Media/Partita</div>
                        </div>
                      </div>

                      {/* Distacco dal leader */}
                      {currentUserRanking.rank > 1 && rankings[0] && (
                        <div className="mt-4 pt-4 border-t border-retro-border/30">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-retro-text/60">Distacco dal 1°:</span>
                            <span className="font-bold text-orange-400">
                              -{(rankings[0].total_points - currentUserRanking.total_points).toLocaleString('it-IT')} punti
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Messaggio se è il vincitore */}
                      {currentUserRanking.rank === 1 && (
                        <div className="mt-4 pt-4 border-t border-yellow-400/30 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Crown className="w-5 h-5 text-yellow-400" />
                            <span className="font-bold text-yellow-400">Campione della League!</span>
                            <Crown className="w-5 h-5 text-yellow-400" />
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}

                {/* Podium (Top 3) - Stile Olimpico */}
                {podium.length > 0 && (
                  <Card className="p-8 bg-gradient-to-br from-yellow-500/5 via-retro-bg to-purple-500/5">
                    <h3 className="text-2xl font-bold text-retro-text mb-8 flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10">
                        <Trophy className="w-7 h-7 text-yellow-400" />
                      </div>
                      Podio dei Campioni
                    </h3>

                    {/* Podio con effetto scalini */}
                    <div className="flex items-end justify-center gap-6 mb-8">
                      {podiumDisplay.map((ranking, visualIndex) => {
                        if (!ranking) {
                          return <div key={`empty-${visualIndex}`} className="w-1/3" />
                        }

                        // Posizione reale (1°, 2°, 3°)
                        const actualRank = ranking.rank
                        const position = podiumPositions[actualRank - 1]
                        if (!position) return null
                        const Icon = position.icon

                        // Altezza podio: 1° più alto, 2° medio, 3° più basso
                        const heights = ['h-40', 'h-52', 'h-32'] // Silver, Gold, Bronze
                        const podiumHeight = heights[visualIndex]

                        // Dimensioni icona
                        const iconSizes = ['w-14 h-14', 'w-20 h-20', 'w-12 h-12']
                        const iconSize = iconSizes[visualIndex]

                        const avgPoints = ranking.games_played > 0
                          ? Math.round(ranking.total_points / ranking.games_played)
                          : 0

                        return (
                          <motion.div
                            key={ranking.id}
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: visualIndex * 0.2, type: 'spring' }}
                            className="flex-1 flex flex-col items-center"
                          >
                            {/* Avatar e info sopra il podio */}
                            <div className="mb-4 text-center">
                              <div className="flex justify-center mb-3">
                                <motion.div
                                  animate={{
                                    rotate: actualRank === 1 ? [0, -5, 5, 0] : 0,
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 1,
                                  }}
                                  className={`p-3 rounded-full ${position.bg} border-2 ${
                                    actualRank === 1
                                      ? 'border-yellow-400'
                                      : actualRank === 2
                                      ? 'border-slate-300'
                                      : 'border-orange-400'
                                  }`}
                                >
                                  <Icon className={`${iconSize} ${position.color}`} />
                                </motion.div>
                              </div>
                              <div className={`font-bold mb-1 ${
                                actualRank === 1 ? 'text-xl' : 'text-lg'
                              } text-retro-text`}>
                                {ranking.user_name}
                              </div>
                              <div className={`font-bold ${
                                actualRank === 1 ? 'text-3xl' : 'text-2xl'
                              } text-retro-primary mb-1`}>
                                {ranking.total_points.toLocaleString('it-IT')}
                              </div>
                              <div className="text-xs text-retro-text/60">
                                {ranking.games_played} partite • ~{avgPoints} pt/game
                              </div>
                            </div>

                            {/* Piedistallo */}
                            <div
                              className={`${podiumHeight} w-full rounded-t-xl ${position.bg} border-2 ${
                                actualRank === 1
                                  ? 'border-yellow-400/30'
                                  : actualRank === 2
                                  ? 'border-slate-300/30'
                                  : 'border-orange-400/30'
                              } flex items-center justify-center relative overflow-hidden`}
                            >
                              {/* Numero posizione */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                                <span className={`${
                                  actualRank === 1 ? 'text-9xl' : 'text-7xl'
                                } font-black ${position.color}`}>
                                  {actualRank}
                                </span>
                              </div>
                              <div className="relative z-10">
                                <div className={`text-5xl font-black ${position.color}`}>
                                  {actualRank}°
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Stats globali league */}
                    {stats && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-retro-border/30">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-retro-primary">
                            {stats.totalPlayers}
                          </div>
                          <div className="text-xs text-retro-text/60">Partecipanti</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-retro-primary">
                            {stats.totalGames.toLocaleString('it-IT')}
                          </div>
                          <div className="text-xs text-retro-text/60">Partite Totali</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-retro-primary">
                            {Math.round(stats.avgPointsPerGame).toLocaleString('it-IT')}
                          </div>
                          <div className="text-xs text-retro-text/60">Media Pt/Partita</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">
                            {stats.topScore.toLocaleString('it-IT')}
                          </div>
                          <div className="text-xs text-retro-text/60">Punteggio Max</div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Grafico Top 10 */}
                {chartData.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold text-retro-text mb-6 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-retro-primary" />
                      Distribuzione Punteggi Top 10
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          stroke="#888"
                          tick={{ fill: '#888', fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#888"
                          tick={{ fill: '#888', fontSize: 12 }}
                          tickFormatter={(value) => value.toLocaleString('it-IT')}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '8px',
                            color: '#fff',
                          }}
                          formatter={(value: number) => [
                            `${value.toLocaleString('it-IT')} punti`,
                            'Punteggio',
                          ]}
                          labelFormatter={(label) => `Giocatore: ${label}`}
                        />
                        <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index === 0
                                  ? '#fbbf24' // Gold
                                  : index === 1
                                  ? '#cbd5e1' // Silver
                                  : index === 2
                                  ? '#fb923c' // Bronze
                                  : '#8b5cf6' // Purple
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                {/* Full Rankings Table */}
                {rankings.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold text-retro-text mb-6 flex items-center gap-2">
                      <Target className="w-6 h-6 text-retro-primary" />
                      Classifica Completa
                      <Badge variant="outline" className="ml-auto">
                        {rankings.length} giocatori
                      </Badge>
                    </h3>

                    {/* Header tabella */}
                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-3 mb-3 border-b border-retro-border/30 text-xs font-semibold text-retro-text/60">
                      <div className="col-span-1">Pos</div>
                      <div className="col-span-4">Giocatore</div>
                      <div className="col-span-2 text-right">Punti</div>
                      <div className="col-span-2 text-right">Partite</div>
                      <div className="col-span-2 text-right">Media</div>
                      <div className="col-span-1 text-right">Gap</div>
                    </div>

                    <div className="space-y-2">
                      {rankings.map((ranking) => {
                        const isCurrentUser = ranking.user_id === user?.id
                        const isTopThree = ranking.rank <= 3
                        const avgPoints = ranking.games_played > 0
                          ? Math.round(ranking.total_points / ranking.games_played)
                          : 0
                        const gapFromFirst = rankings[0]
                          ? rankings[0].total_points - ranking.total_points
                          : 0

                        return (
                          <motion.div
                            key={ranking.id}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: ranking.rank * 0.02 }}
                            className={`grid grid-cols-12 gap-4 p-4 rounded-lg border transition-all ${
                              isCurrentUser
                                ? 'bg-retro-primary/10 border-retro-primary/50 shadow-lg shadow-retro-primary/20'
                                : 'bg-retro-surface border-retro-border hover:border-retro-primary/30'
                            }`}
                          >
                            {/* Rank */}
                            <div className="col-span-1 flex items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  isTopThree
                                    ? podiumPositions[ranking.rank - 1]?.bg || 'bg-retro-surface'
                                    : 'bg-retro-surface'
                                }`}
                              >
                                {isTopThree && ranking.rank <= podiumPositions.length ? (
                                  (() => {
                                    const Icon = podiumPositions[ranking.rank - 1].icon
                                    return (
                                      <Icon
                                        className={`w-5 h-5 ${podiumPositions[ranking.rank - 1].color}`}
                                      />
                                    )
                                  })()
                                ) : (
                                  <span className="text-sm text-retro-text/60">
                                    {ranking.rank}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Name */}
                            <div className="col-span-11 md:col-span-4 flex items-center">
                              <div>
                                <div className="font-bold text-retro-text flex items-center gap-2">
                                  {ranking.user_name}
                                  {isCurrentUser && (
                                    <Badge variant="outline" className="text-xs">
                                      Tu
                                    </Badge>
                                  )}
                                  {ranking.rank === 1 && (
                                    <Crown className="w-4 h-4 text-yellow-400" />
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Points */}
                            <div className="col-span-4 md:col-span-2 flex items-center justify-end">
                              <div className="text-right">
                                <div className="text-xl font-black text-retro-primary">
                                  {ranking.total_points.toLocaleString('it-IT')}
                                </div>
                                <div className="text-xs text-retro-text/60 md:hidden">punti</div>
                              </div>
                            </div>

                            {/* Games */}
                            <div className="col-span-4 md:col-span-2 flex items-center justify-end">
                              <div className="text-right">
                                <div className="text-lg font-bold text-retro-text">
                                  {ranking.games_played}
                                </div>
                                <div className="text-xs text-retro-text/60">
                                  {ranking.games_played === 1 ? 'partita' : 'partite'}
                                </div>
                              </div>
                            </div>

                            {/* Average */}
                            <div className="col-span-4 md:col-span-2 flex items-center justify-end">
                              <div className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <TrendingUp className="w-3 h-3 text-green-400" />
                                  <span className="text-lg font-bold text-green-400">
                                    {avgPoints}
                                  </span>
                                </div>
                                <div className="text-xs text-retro-text/60">pt/game</div>
                              </div>
                            </div>

                            {/* Gap from first */}
                            <div className="hidden md:flex col-span-1 items-center justify-end">
                              {ranking.rank > 1 && (
                                <div className="text-right">
                                  <div className="text-xs font-mono text-orange-400">
                                    -{gapFromFirst}
                                  </div>
                                </div>
                              )}
                              {ranking.rank === 1 && (
                                <Zap className="w-4 h-4 text-yellow-400" />
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </Card>
                )}

                {rankings.length === 0 && !loading && (
                  <Card className="p-12 text-center">
                    <Users className="w-16 h-16 text-retro-text/20 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-retro-text mb-2">
                      Nessuna classifica disponibile
                    </h3>
                    <p className="text-sm text-retro-text/60">
                      Non ci sono dati per questa league.
                    </p>
                  </Card>
                )}
              </>
            )}
          </>
        ) : (
          <Card className="p-12 text-center">
            <Archive className="w-16 h-16 text-retro-text/20 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-retro-text mb-2">
              Nessuna League Chiusa
            </h3>
            <p className="text-sm text-retro-text/60">
              Le league chiuse appariranno qui una volta completate.
            </p>
          </Card>
        )}

        {loading && (
          <Card className="p-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-primary"></div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
