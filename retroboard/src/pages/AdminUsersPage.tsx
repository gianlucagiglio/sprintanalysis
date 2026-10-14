import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useUserManagement } from '@/hooks/useUserManagement'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  Users,
  Shield,
  Ban,
  Trash2,
  CheckCircle,
  XCircle,
  Crown,
  Calendar,
  Mail,
  AlertTriangle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

export function AdminUsersPage() {
  const { users, loading, banUser, deleteUser } = useUserManagement()
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const navigate = useNavigate()

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!isSuperAdmin) {
    return (
      <AppLayout>
        <Card className="p-12 text-center max-w-md mx-auto mt-20">
          <Ban className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-retro-text mb-2">Accesso Negato</h2>
          <p className="text-retro-text/60">
            Solo i super admin possono accedere a questa pagina.
          </p>
        </Card>
      </AppLayout>
    )
  }

  const handleBan = async (userId: string, userName: string, currentlyBanned: boolean) => {
    if (!confirm(
      currentlyBanned
        ? `Sbannare ${userName}? Potrà accedere nuovamente.`
        : `Bannare ${userName}? Non potrà più accedere all'app.`
    )) return

    setActionLoading(userId)
    setError(null)
    setSuccess(null)

    try {
      const result = await banUser(userId, !currentlyBanned)
      setSuccess(
        currentlyBanned
          ? `${result.userName} è stato sbannato`
          : `${result.userName} è stato bannato`
      )
    } catch (err: any) {
      setError(err.message || 'Errore durante il ban/unban')
      // console.error('Error ban/unban:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(
      `⚠️ ATTENZIONE: Eliminare definitivamente ${userName}?\n\nQuesta azione:\n- Elimina il profilo utente\n- Rimuove da tutti i team\n- Cancella tutti i suoi dati\n- È IRREVERSIBILE\n\nDigita "ELIMINA" per confermare`
    )) return

    const confirmation = prompt('Digita "ELIMINA" per confermare:')
    if (confirmation !== 'ELIMINA') {
      alert('Eliminazione annullata')
      return
    }

    setActionLoading(userId)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteUser(userId)
      setSuccess(`${result.userName} è stato eliminato`)
    } catch (err: any) {
      setError(err.message || 'Errore durante l\'eliminazione')
      // console.error('Error delete user:', err)
    } finally {
      setActionLoading(null)
    }
  }



  const totalUsers = users.length
  const bannedUsers = users.filter((u) => u.is_banned).length
  const superAdmins = users.filter((u) => u.is_super_admin).length
  const activeUsers = users.filter((u) => !u.is_banned && !u.is_super_admin).length

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <PageHeader
          variant="hero"
          title="Pannello Admin"
          description="Gestisci utenti e team"
          icon={Shield}
          gradient="primary"
          badge={{
            label: 'Super Admin',
            variant: 'default',
          }}
        />

        {/* Admin Navigation Tabs */}
        <div className="flex gap-2 border-b border-retro-border pb-4">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-retro-primary text-white"
          >
            <Users className="w-4 h-4 inline mr-2" />
            Gestione Utenti
          </button>
          <button
            onClick={() => navigate('/admin/teams')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-retro-text/60 hover:text-retro-text hover:bg-slate-50"
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Gestione Team
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{totalUsers}</div>
                <div className="text-xs text-retro-text/60">Totale Utenti</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{activeUsers}</div>
                <div className="text-xs text-retro-text/60">Utenti Attivi</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{superAdmins}</div>
                <div className="text-xs text-retro-text/60">Super Admin</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-500/10 to-pink-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Ban className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{bannedUsers}</div>
                <div className="text-xs text-retro-text/60">Bannati</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Messages */}
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
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </Card>
        )}

        {/* Users Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-retro-text mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-retro-primary" />
            Tutti gli Utenti
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-primary"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-retro-text/20 mx-auto mb-4" />
              <p className="text-retro-text/60">Nessun utente trovato</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u, index) => {
                const isCurrentUser = u.id === user?.id
                const isLoading = actionLoading === u.id

                return (
                  <motion.div
                    key={u.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrentUser
                        ? 'bg-retro-primary/10 border-retro-primary/30'
                        : u.is_banned
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-retro-surface border-retro-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-retro-text truncate">
                            {u.name}
                          </h3>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">Tu</Badge>
                          )}
                          {u.is_super_admin && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                              <Crown className="w-3 h-3 mr-1" />
                              Super Admin
                            </Badge>
                          )}
                          {u.is_banned && (
                            <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                              <Ban className="w-3 h-3 mr-1" />
                              Bannato
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-retro-text/60">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{u.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              Iscritto{' '}
                              {formatDistanceToNow(new Date(u.created_at), {
                                addSuffix: true,
                                locale: it,
                              })}
                            </span>
                          </div>
                          {u.teams_count > 0 && (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3.5 h-3.5" />
                              <span>
                                {u.teams_count} {u.teams_count === 1 ? 'team' : 'team'}
                              </span>
                            </div>
                          )}
                        </div>

                        {u.is_banned && u.banned_at && (
                          <div className="mt-2 text-xs text-red-400/80 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Bannato{' '}
                            {formatDistanceToNow(new Date(u.banned_at), {
                              addSuffix: true,
                              locale: it,
                            })}
                            {u.banned_by_name && ` da ${u.banned_by_name}`}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isCurrentUser && (
                        <div className="flex items-center gap-2 flex-wrap">

                          <Button
                            onClick={() => handleBan(u.id, u.name, u.is_banned)}
                            disabled={isLoading}
                            size="sm"
                            variant="secondary"
                            className={
                              u.is_banned
                                ? 'border-green-500/30 hover:bg-green-500/10'
                                : 'border-orange-500/30 hover:bg-orange-500/10'
                            }
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            ) : u.is_banned ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Sbanna
                              </>
                            ) : (
                              <>
                                <Ban className="w-4 h-4 mr-1" />
                                Banna
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => handleDelete(u.id, u.name)}
                            disabled={isLoading}
                            size="sm"
                            variant="secondary"
                            className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                          >
                            {isLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Elimina
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
