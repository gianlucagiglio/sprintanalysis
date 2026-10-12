import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useLeagues } from '@/hooks/useLeagues'
import { useAuthStore } from '@/stores/authStore'
import {
  Trophy,
  Calendar,
  Users,
  Archive,
  Plus,
  CheckCircle,
  ExternalLink,
  Crown,
  Clock,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'
import { Link } from 'react-router-dom'

export function LeagueAdminPanel() {
  const { activeLeague, leagues, closeLeagueAndOpenNew, loading } = useLeagues()
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const [isClosing, setIsClosing] = useState(false)
  const [newLeagueName, setNewLeagueName] = useState('')
  const [newLeagueDescription, setNewLeagueDescription] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isSuperAdmin) {
    return (
      <Card className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
        <div className="flex items-center gap-3">
          <Archive className="w-6 h-6 text-red-400" />
          <div>
            <h3 className="text-lg font-semibold text-retro-text">Accesso Negato</h3>
            <p className="text-sm text-retro-text/60">
              Solo i super admin possono gestire le league.
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const handleCloseAndOpenNew = async () => {
    if (!activeLeague) return
    if (!newLeagueName.trim()) {
      setError('Inserisci un nome per la nuova league')
      return
    }

    setIsClosing(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await closeLeagueAndOpenNew(
        activeLeague.id,
        newLeagueName.trim(),
        newLeagueDescription.trim() || undefined
      )

      setSuccess(
        `League "${activeLeague.name}" chiusa con successo! ${result.rankingsSaved} classifiche salvate. Nuova league "${newLeagueName}" creata.`
      )
      setNewLeagueName('')
      setNewLeagueDescription('')
      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'Errore durante la chiusura della league')
      console.error('Error closing league:', err)
    } finally {
      setIsClosing(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-retro-primary"></div>
        </div>
      </Card>
    )
  }

  const closedLeagues = leagues.filter((l) => l.status === 'closed')

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {success && (
        <Card className="p-4 bg-green-500/10 border-green-500/20">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-200">{success}</p>
          </div>
        </Card>
      )}

      {error && (
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <p className="text-sm text-red-200">{error}</p>
        </Card>
      )}

      {/* Active League Info */}
      <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-xl font-bold text-retro-text">League Attiva</h3>
              {activeLeague ? (
                <p className="text-sm text-retro-text/60">
                  Creata{' '}
                  {formatDistanceToNow(new Date(activeLeague.created_at), {
                    addSuffix: true,
                    locale: it,
                  })}
                </p>
              ) : (
                <p className="text-sm text-retro-text/60">Nessuna league attiva</p>
              )}
            </div>
          </div>
        </div>

        {activeLeague ? (
          <div className="space-y-4">
            <div className="bg-black/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-retro-primary" />
                <span className="font-bold text-lg text-retro-text">
                  {activeLeague.name}
                </span>
              </div>
              {activeLeague.description && (
                <p className="text-sm text-retro-text/70">{activeLeague.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-retro-text/50">
                <Calendar className="w-3 h-3" />
                <span>
                  Inizio:{' '}
                  {new Date(activeLeague.start_date).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Close League Form */}
            {!showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                variant="secondary"
                className="w-full border-orange-500/30 hover:bg-orange-500/10"
              >
                <Archive className="w-4 h-4 mr-2" />
                Chiudi League e Apri Nuova Stagione
              </Button>
            ) : (
              <div className="bg-black/20 rounded-lg p-4 space-y-4">
                <h4 className="font-semibold text-retro-text flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Nuova League
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-retro-text/70 mb-1 block">
                      Nome League *
                    </label>
                    <Input
                      type="text"
                      placeholder="es. Stagione 2"
                      value={newLeagueName}
                      onChange={(e) => setNewLeagueName(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-retro-text/70 mb-1 block">
                      Descrizione (opzionale)
                    </label>
                    <Input
                      type="text"
                      placeholder="es. Q2 2025"
                      value={newLeagueDescription}
                      onChange={(e) => setNewLeagueDescription(e.target.value)}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleCloseAndOpenNew}
                    disabled={isClosing || !newLeagueName.trim()}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isClosing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Chiusura...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Conferma
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowForm(false)
                      setNewLeagueName('')
                      setNewLeagueDescription('')
                      setError(null)
                    }}
                    variant="secondary"
                    disabled={isClosing}
                  >
                    Annulla
                  </Button>
                </div>

                <p className="text-xs text-retro-text/50">
                  ⚠️ Questa azione chiuderà la league corrente, salverà la classifica finale e
                  creerà una nuova league. I punti dei quiz verranno azzerati, ma i punti
                  personali e i badge rimarranno intatti.
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-retro-text/60">
            Non c'è una league attiva al momento.
          </p>
        )}
      </Card>

      {/* Closed Leagues History */}
      {closedLeagues.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Archive className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-retro-text">Storico League</h3>
                <p className="text-sm text-retro-text/60">
                  {closedLeagues.length}{' '}
                  {closedLeagues.length === 1 ? 'stagione conclusa' : 'stagioni concluse'}
                </p>
              </div>
            </div>
            <Link to="/league-history">
              <Button variant="secondary" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                Vedi Classifiche
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {closedLeagues.map((league, index) => {
              const startDate = new Date(league.start_date)
              const endDate = league.end_date ? new Date(league.end_date) : null
              const durationDays = endDate
                ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                : 0

              return (
                <motion.div
                  key={league.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to="/league-history" className="block h-full">
                    <div className="h-full bg-gradient-to-br from-retro-surface to-retro-surface/50 hover:from-retro-primary/10 hover:to-purple-500/10 rounded-xl p-5 border border-retro-border hover:border-purple-500/30 transition-all group cursor-pointer">
                      {/* Header con titolo e badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                            <Trophy className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-retro-text truncate group-hover:text-retro-primary transition-colors">
                              {league.name}
                            </h4>
                            {league.description && (
                              <p className="text-xs text-retro-text/60 truncate">
                                {league.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-red-500/30 text-red-400 text-xs flex-shrink-0"
                        >
                          Chiusa
                        </Badge>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-black/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs text-retro-text/60">Inizio</span>
                          </div>
                          <div className="text-sm font-bold text-retro-text">
                            {startDate.toLocaleDateString('it-IT', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-xs text-retro-text/60">Durata</span>
                          </div>
                          <div className="text-sm font-bold text-retro-text">
                            {durationDays > 0
                              ? `${durationDays} ${durationDays === 1 ? 'giorno' : 'giorni'}`
                              : '-'}
                          </div>
                        </div>
                      </div>

                      {/* Date range */}
                      <div className="flex items-center gap-2 text-xs text-retro-text/50 pt-3 border-t border-retro-border/30">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {startDate.toLocaleDateString('it-IT')}
                          {' → '}
                          {endDate
                            ? endDate.toLocaleDateString('it-IT')
                            : 'In corso'}
                        </span>
                      </div>

                      {/* Hover indicator */}
                      <div className="mt-3 pt-3 border-t border-retro-border/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 text-xs text-retro-primary">
                          <ExternalLink className="w-3 h-3" />
                          <span>Visualizza classifica completa</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          {/* Footer con totale stagioni */}
          <div className="mt-6 pt-4 border-t border-retro-border/30">
            <div className="flex items-center justify-center gap-2 text-sm text-retro-text/60">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span>
                {closedLeagues.length}{' '}
                {closedLeagues.length === 1 ? 'stagione archiviata' : 'stagioni archiviate'}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
