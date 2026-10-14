import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { useTeamManagement } from '@/hooks/useTeamManagement'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  Users,
  Shield,
  Ban,
  Crown,
  CheckCircle,
  XCircle,
  UserMinus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { it } from 'date-fns/locale'

export function AdminTeamsPage() {
  const { teams, loading, updateMemberRole, removeMember } = useTeamManagement()
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())
  const navigate = useNavigate()

  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
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

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(teamId)) {
        newSet.delete(teamId)
      } else {
        newSet.add(teamId)
      }
      return newSet
    })
  }

  const handleRoleChange = async (
    memberId: string,
    userName: string,
    teamName: string,
    currentRole: string,
    newRole: 'owner' | 'admin' | 'member'
  ) => {
    if (!confirm(
      `Cambiare ruolo di ${userName} in "${teamName}" da ${currentRole} a ${newRole}?`
    )) return

    setActionLoading(memberId)
    setError(null)
    setSuccess(null)

    try {
      await updateMemberRole(memberId, newRole)
      setSuccess(`${userName} è ora ${newRole} del team "${teamName}"`)
    } catch (err: any) {
      setError(err.message || 'Errore durante il cambio ruolo')
      console.error('Error changing role:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemoveMember = async (
    memberId: string,
    userName: string,
    teamName: string
  ) => {
    if (!confirm(
      `⚠️ Rimuovere ${userName} dal team "${teamName}"?\n\nL'utente perderà accesso a tutte le retrospettive del team.`
    )) return

    setActionLoading(memberId)
    setError(null)
    setSuccess(null)

    try {
      await removeMember(memberId)
      setSuccess(`${userName} rimosso dal team "${teamName}"`)
    } catch (err: any) {
      setError(err.message || 'Errore durante la rimozione')
      console.error('Error removing member:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const totalTeams = teams.length
  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0)
  const totalOwners = teams.reduce(
    (acc, t) => acc + t.members.filter(m => m.role === 'owner').length,
    0
  )
  const totalRegularMembers = teams.reduce(
    (acc, t) => acc + t.members.filter(m => m.role === 'member' || m.role === 'admin').length,
    0
  )

  const getRoleBadge = (role: string) => {
    if (role === 'owner') {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
          <Crown className="w-3 h-3 mr-1" />
          Owner
        </Badge>
      )
    }
    // Treat both 'member' and 'admin' as Member in UI
    return (
      <Badge variant="outline" className="text-xs">
        <Users className="w-3 h-3 mr-1" />
        Member
      </Badge>
    )
  }

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
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-retro-text/60 hover:text-retro-text hover:bg-slate-50"
          >
            <Users className="w-4 h-4 inline mr-2" />
            Gestione Utenti
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-retro-primary text-white"
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
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{totalTeams}</div>
                <div className="text-xs text-retro-text/60">Team Totali</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{totalMembers}</div>
                <div className="text-xs text-retro-text/60">Membri Totali</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{totalOwners}</div>
                <div className="text-xs text-retro-text/60">Owner</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-retro-text">{totalRegularMembers}</div>
                <div className="text-xs text-retro-text/60">Members</div>
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

        {/* Teams List */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-retro-text mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-retro-primary" />
            Tutti i Team
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-retro-primary"></div>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-retro-text/20 mx-auto mb-4" />
              <p className="text-retro-text/60">Nessun team trovato</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teams.map((team, index) => {
                const isExpanded = expandedTeams.has(team.id)

                return (
                  <motion.div
                    key={team.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="border border-retro-border rounded-lg overflow-hidden"
                  >
                    {/* Team Header */}
                    <button
                      onClick={() => toggleTeam(team.id)}
                      className="w-full p-4 bg-retro-surface hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-retro-primary" />
                        <div className="text-left">
                          <h3 className="font-bold text-retro-text">{team.name}</h3>
                          <p className="text-sm text-retro-text/60">
                            {team.members.length} {team.members.length === 1 ? 'membro' : 'membri'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {team.members.filter(m => m.role === 'owner').length} owner
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-retro-text/60" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-retro-text/60" />
                        )}
                      </div>
                    </button>

                    {/* Team Members */}
                    {isExpanded && (
                      <div className="border-t border-retro-border bg-slate-50/50 p-4">
                        <div className="space-y-2">
                          {team.members.map((member) => {
                            const isLoading = actionLoading === member.id

                            return (
                              <div
                                key={member.id}
                                className="p-3 bg-white rounded-lg border border-retro-border flex items-center justify-between gap-4"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-retro-text truncate">
                                      {member.user_name}
                                    </span>
                                    {getRoleBadge(member.role)}
                                  </div>
                                  <p className="text-xs text-retro-text/60 truncate">
                                    {member.user_email}
                                  </p>
                                  <p className="text-xs text-retro-text/40 mt-1">
                                    Iscritto{' '}
                                    {formatDistanceToNow(new Date(member.joined_at), {
                                      addSuffix: true,
                                      locale: it,
                                    })}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Role Buttons - Only Owner and Member */}
                                  {member.role !== 'owner' && (
                                    <Button
                                      onClick={() =>
                                        handleRoleChange(
                                          member.id,
                                          member.user_name,
                                          team.name,
                                          member.role,
                                          'owner'
                                        )
                                      }
                                      disabled={isLoading}
                                      size="sm"
                                      variant="secondary"
                                      className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-400"
                                    >
                                      <Crown className="w-4 h-4 mr-1" />
                                      Owner
                                    </Button>
                                  )}

                                  {member.role === 'owner' && (
                                    <Button
                                      onClick={() =>
                                        handleRoleChange(
                                          member.id,
                                          member.user_name,
                                          team.name,
                                          member.role,
                                          'member'
                                        )
                                      }
                                      disabled={isLoading}
                                      size="sm"
                                      variant="secondary"
                                      className="border-slate-500/30 hover:bg-slate-500/10 text-slate-400"
                                    >
                                      <Users className="w-4 h-4 mr-1" />
                                      Member
                                    </Button>
                                  )}

                                  <Button
                                    onClick={() =>
                                      handleRemoveMember(member.id, member.user_name, team.name)
                                    }
                                    disabled={isLoading}
                                    size="sm"
                                    variant="secondary"
                                    className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                                  >
                                    {isLoading ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
                                    ) : (
                                      <>
                                        <UserMinus className="w-4 h-4 mr-1" />
                                        Rimuovi
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
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
