import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTeams } from '@/hooks/useTeams'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import type { Team, TeamMember, Profile, Session, Action } from '@/types/database'
import { TrendKPIs } from '@/components/metrics/TrendKPIs'
import { HappinessTrendLine } from '@/components/metrics/HappinessTrendLine'
import { CommentSentimentChart } from '@/components/metrics/CommentSentimentChart'
import { SentimentDelta } from '@/components/metrics/SentimentDelta'
import { TeamMoodChart } from '@/components/metrics/TeamMoodChart'
import { TeamMoodOverview } from '@/components/metrics/TeamMoodOverview'
import { useGlobalMoods } from '@/hooks/useGlobalMoods'
import { useMetrics } from '@/hooks/useMetrics'
import {
  Crown, Shield, User, Users, Copy, Check, Search, UserPlus, Trash2, ArrowLeft, X, Calendar, CheckCircle2, LogOut,
} from 'lucide-react'

type MemberWithProfile = TeamMember & { profiles: Profile }

const roleIcons = { owner: Crown, admin: Shield, member: User }
const roleLabels = { owner: 'Owner', admin: 'Admin', member: 'Membro' }

export function TeamPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { searchUsers, addMember, removeMember, leaveTeam, deleteTeam } = useTeams()

  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [actions, setActions] = useState<(Action & { sessionTitle?: string })[]>([])
  const [myRole, setMyRole] = useState<TeamMember['role'] | null>(null)
  const [loading, setLoading] = useState(true)

  // Team-scoped metrics
  const { sessionMoods, sessionTeamMoods, globalTeamMoodCounts, loading: moodsLoading } = useGlobalMoods(id)
  const { commentSentiments, happinessData, trendKPIs, sentimentDeltas, loading: metricsLoading } = useMetrics(id)

  // Invite link copy state
  const [copied, setCopied] = useState(false)

  // User search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Profile[]>([])
  const [searching, setSearching] = useState(false)

  const fetchTeam = useCallback(async () => {
    if (!id) return
    const { data } = await supabase.from('teams').select('*').eq('id', id).single()
    if (data) setTeam(data)
  }, [id])

  const fetchMembers = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('team_members')
      .select('*, profiles(*)')
      .eq('team_id', id)
    if (data) {
      setMembers(data as MemberWithProfile[])
      const me = data.find((m) => m.user_id === user?.id)
      setMyRole((me?.role as TeamMember['role']) || null)
    }
  }, [id, user])

  const fetchSessions = useCallback(async () => {
    if (!id) return
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('team_id', id)
      .order('created_at', { ascending: false })
    if (data) setSessions(data)
  }, [id])

  const fetchActions = useCallback(async () => {
    if (!id) return
    const { data: teamSessions } = await supabase
      .from('sessions')
      .select('id, title')
      .eq('team_id', id)
    if (!teamSessions?.length) return
    const sIds = teamSessions.map((s) => s.id)
    const { data } = await supabase
      .from('actions')
      .select('*')
      .in('session_id', sIds)
      .order('created_at', { ascending: false })
    if (data) {
      const titleMap = new Map(teamSessions.map((s) => [s.id, s.title]))
      setActions(data.map((a) => ({ ...a, sessionTitle: titleMap.get(a.session_id) })))
    }
  }, [id])

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchTeam(), fetchMembers(), fetchSessions(), fetchActions()]).finally(() =>
      setLoading(false)
    )
  }, [fetchTeam, fetchMembers, fetchSessions, fetchActions])

  const canManage = myRole === 'owner' || myRole === 'admin'

  const handleCopyInvite = () => {
    if (!team) return
    navigator.clipboard.writeText(team.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    const results = await searchUsers(searchQuery, id)
    setSearchResults(results)
    setSearching(false)
  }

  const handleAddMember = async (userId: string) => {
    if (!id) return
    const ok = await addMember(id, userId)
    if (ok) {
      setSearchResults((prev) => prev.filter((u) => u.id !== userId))
      await fetchMembers()
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!id) return
    const ok = await removeMember(id, userId)
    if (ok) await fetchMembers()
  }

  const handleLeaveTeam = async () => {
    if (!id || !confirm('Sei sicuro di voler abbandonare questo team?')) return
    const ok = await leaveTeam(id)
    if (ok) navigate('/teams')
  }

  const handleDeleteTeam = async () => {
    if (!id || !confirm('Sei sicuro di voler eliminare questo team?')) return
    const ok = await deleteTeam(id)
    if (ok) navigate('/teams')
  }

  if (loading) {
    return (
      <AppLayout>
        <p className="text-retro-text-secondary text-center py-16">Caricamento...</p>
      </AppLayout>
    )
  }

  if (!team) {
    return (
      <AppLayout>
        <div className="text-center py-16">
          <p className="text-retro-text-secondary mb-4">Team non trovato</p>
          <Button onClick={() => navigate('/teams')}>
            <ArrowLeft size={16} />
            Torna ai team
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teams')}
              className="p-1.5 rounded-lg hover:bg-retro-border/30 text-retro-text-secondary"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-retro-text">{team.name}</h1>
            {myRole && (
              <Badge variant="primary">{roleLabels[myRole]}</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {myRole && myRole !== 'owner' && (
              <Button variant="ghost" onClick={handleLeaveTeam} className="text-orange-500 hover:text-orange-600">
                <LogOut size={16} />
                Abbandona
              </Button>
            )}
            {myRole === 'owner' && (
              <Button variant="ghost" onClick={handleDeleteTeam} className="text-red-500 hover:text-red-600">
                <Trash2 size={16} />
                Elimina team
              </Button>
            )}
          </div>
        </div>

        {/* Invite section */}
        <Card>
          <h2 className="font-semibold text-retro-text mb-3">Invita membri</h2>

          {/* Invite code */}
          <div className="mb-4">
            <label className="block text-sm text-retro-text-secondary mb-1">Codice invito</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-retro-sidebar rounded-lg text-sm font-mono text-retro-text">
                {team.invite_code}
              </code>
              <Button variant="secondary" onClick={handleCopyInvite}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copiato!' : 'Copia'}
              </Button>
            </div>
          </div>

          {/* User search */}
          {canManage && (
            <div>
              <form onSubmit={handleSearch} className="flex items-end gap-2">
                <div className="flex-1">
                  <Input
                    label="Cerca utenti per nome o email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca..."
                  />
                </div>
                <Button type="submit" variant="secondary" disabled={searching}>
                  <Search size={16} />
                  {searching ? 'Ricerca...' : 'Cerca'}
                </Button>
              </form>

              {searchResults.length > 0 && (
                <div className="mt-3 border border-retro-border rounded-lg divide-y divide-retro-border">
                  {searchResults.map((profile) => (
                    <div key={profile.id} className="flex items-center justify-between px-3 py-2">
                      <div>
                        <span className="text-sm font-medium text-retro-text">{profile.name}</span>
                        <span className="text-xs text-retro-text-secondary ml-2">{profile.email}</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleAddMember(profile.id)}>
                        <UserPlus size={14} />
                        Aggiungi
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Members section */}
        <Card>
          <h2 className="font-semibold text-retro-text mb-3">
            Membri ({members.length})
          </h2>
          <div className="divide-y divide-retro-border">
            {members.map((m) => {
              const RoleIcon = roleIcons[m.role]
              return (
                <div key={m.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-retro-primary/10 flex items-center justify-center text-sm font-medium text-retro-primary">
                      {m.profiles.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-retro-text">{m.profiles.name}</span>
                      <span className="text-xs text-retro-text-secondary ml-2">{m.profiles.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={m.role === 'owner' ? 'primary' : 'default'}>
                      <RoleIcon size={12} className="mr-1" />
                      {roleLabels[m.role]}
                    </Badge>
                    {canManage && m.role !== 'owner' && m.user_id !== user?.id && (
                      <button
                        onClick={() => handleRemoveMember(m.user_id)}
                        className="p-1 rounded hover:bg-red-50 text-retro-text-secondary hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Team sessions */}
        <Card>
          <h2 className="font-semibold text-retro-text mb-3">
            Retrospettive del team ({sessions.length})
          </h2>
          {sessions.length === 0 ? (
            <p className="text-sm text-retro-text-secondary py-4 text-center">
              Nessuna retrospettiva associata a questo team.
            </p>
          ) : (
            <div className="divide-y divide-retro-border">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/session/${s.id}`)}
                  className="w-full flex items-center justify-between py-2.5 hover:bg-retro-sidebar/50 px-2 rounded transition-colors text-left"
                >
                  <span className="text-sm font-medium text-retro-text">{s.title}</span>
                  <span className="text-xs text-retro-text-secondary">
                    {new Date(s.created_at).toLocaleDateString('it-IT')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Team Sentiment Dashboard */}
        {!moodsLoading && !metricsLoading && sessionMoods.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-retro-text">Sentiment storico del team</h2>
            <TrendKPIs kpis={trendKPIs} />
            <HappinessTrendLine data={happinessData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CommentSentimentChart data={commentSentiments} />
              <SentimentDelta data={sentimentDeltas} />
            </div>

            {/* Collaborazione Team */}
            {sessionTeamMoods.some(s => s.total > 0) && (
              <div className="space-y-6 mt-6">
                <h3 className="text-lg font-semibold text-retro-text flex items-center gap-2">
                  <Users size={18} className="text-emerald-500" />
                  Collaborazione Team
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TeamMoodChart sessionTeamMoods={sessionTeamMoods} />
                </div>
                <TeamMoodOverview sessionTeamMoods={sessionTeamMoods} globalTeamMoodCounts={globalTeamMoodCounts} />
              </div>
            )}
          </>
        )}

        {/* Team Actions */}
        {actions.length > 0 && (
          <Card>
            <h2 className="font-semibold text-retro-text mb-3">
              Azioni del team ({actions.length})
            </h2>
            <div className="space-y-2">
              {actions.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-xl bg-retro-sidebar/50">
                  <CheckCircle2
                    size={16}
                    className={`mt-0.5 shrink-0 ${
                      a.status === 'done' ? 'text-emerald-500' :
                      a.status === 'in_progress' ? 'text-retro-primary' :
                      'text-retro-text-secondary'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm text-retro-text ${a.status === 'done' ? 'line-through opacity-60' : ''}`}>
                      {a.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {a.sessionTitle && (
                        <span className="text-[10px] text-retro-text-secondary bg-slate-100 rounded-full px-2 py-0.5">
                          {a.sessionTitle}
                        </span>
                      )}
                      {a.deadline && (
                        <span className="flex items-center gap-1 text-[10px] text-retro-text-secondary">
                          <Calendar size={10} />
                          {new Date(a.deadline).toLocaleDateString('it-IT')}
                        </span>
                      )}
                      <Badge variant={a.status === 'done' ? 'primary' : 'default'} className="text-[10px]">
                        {a.status === 'done' ? 'Completato' : a.status === 'in_progress' ? 'In corso' : 'Da fare'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
