import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTeams } from '@/hooks/useTeams'
import { SessionCard } from './SessionCard'
import { CreateSessionModal } from './CreateSessionModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SessionCardSkeleton } from '@/components/ui/Skeleton'
import { motion } from 'framer-motion'
import {
  Plus,
  Link as LinkIcon,
  LayoutGrid,
  Play,
  CheckCircle2,
  FolderOpen,
  Users,
  Search,
  Activity,
  Filter,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { canCreate } from '@/config/permissions'
import type { Session } from '@/types/database'
import { PageHeader } from '@/components/ui/PageHeader'

type FilterTab = 'all' | 'active' | 'closed'

export function Dashboard() {
  const [sessions, setSessions] = useState<(Session & { participant_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const { teams } = useTeams()
  const navigate = useNavigate()
  const location = useLocation()

  const fetchSessions = useCallback(async () => {
    if (!user) return

    // Super admin sees ALL sessions
    if (isSuperAdmin()) {
      const { data: sessionsData, error: sessError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })

      if (sessError) return

      if (sessionsData) {
        // Fetch all participant counts in ONE query (fix N+1)
        const sessionIds = sessionsData.map(s => s.id)
        const { data: participants } = await supabase
          .from('session_participants')
          .select('session_id')
          .in('session_id', sessionIds)

        // Build count map
        const countMap: Record<string, number> = {}
        participants?.forEach(p => {
          countMap[p.session_id] = (countMap[p.session_id] || 0) + 1
        })

        const withCounts = sessionsData.map(s => ({
          ...s,
          participant_count: countMap[s.id] || 0
        }))
        setSessions(withCounts)
      }
      setLoading(false)
      return
    }

    // 1. Sessions where user is a participant
    const { data: participations, error: partError } = await supabase
      .from('session_participants')
      .select('session_id')
      .eq('user_id', user.id)

    if (partError) return // Don't clear sessions on transient error

    const participantSessionIds = participations?.map((p) => p.session_id) || []

    // 2. Sessions belonging to teams the user is a member of
    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)

    let teamSessionIds: string[] = []
    if (memberships?.length) {
      const teamIds = memberships.map((m) => m.team_id)
      const { data: teamSessions } = await supabase
        .from('sessions')
        .select('id')
        .in('team_id', teamIds)
      teamSessionIds = teamSessions?.map((s) => s.id) || []
    }

    // Merge and deduplicate
    const allSessionIds = [...new Set([...participantSessionIds, ...teamSessionIds])]

    if (!allSessionIds.length) {
      setSessions([])
      setLoading(false)
      return
    }

    const { data: sessionsData, error: sessError } = await supabase
      .from('sessions')
      .select('*')
      .in('id', allSessionIds)
      .order('created_at', { ascending: false })

    if (sessError) return // Don't clear sessions on transient error

    if (sessionsData) {
      // Fetch all participant counts in ONE query (fix N+1)
      const sessionIds = sessionsData.map(s => s.id)
      const { data: participants } = await supabase
        .from('session_participants')
        .select('session_id')
        .in('session_id', sessionIds)

      // Build count map
      const countMap: Record<string, number> = {}
      participants?.forEach(p => {
        countMap[p.session_id] = (countMap[p.session_id] || 0) + 1
      })

      const withCounts = sessionsData.map(s => ({
        ...s,
        participant_count: countMap[s.id] || 0
      }))
      setSessions(withCounts)
    }
    setLoading(false)
  }, [user])

  // Fetch on mount and when user changes
  useEffect(() => {
    setLoading(true)
    fetchSessions()
  }, [fetchSessions])

  // Re-fetch every time the user navigates to this page
  useEffect(() => {
    if (location.pathname === '/retrospettive') {
      fetchSessions()
    }
  }, [location.pathname, fetchSessions])

  // Realtime: refetch when sessions are created or deleted
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('dashboard-sessions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sessions' },
        () => fetchSessions()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'sessions' },
        () => fetchSessions()
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('dashboard sessions channel error:', err)
      })
    return () => { supabase.removeChannel(channel) }
  }, [user, fetchSessions])

  // Stats
  const activeSessions = sessions.filter((s) => s.current_step >= 1 && s.current_step <= 4)
  const closedSessions = sessions.filter((s) => s.current_step === 5)
  const totalParticipants = sessions.reduce((sum, s) => sum + s.participant_count, 0)

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    let result = sessions

    // Filter by status
    if (filter === 'active') result = result.filter((s) => s.current_step >= 1 && s.current_step <= 4)
    if (filter === 'closed') result = result.filter((s) => s.current_step === 5)

    // Filter by team
    if (selectedTeam) result = result.filter((s) => s.team_id === selectedTeam)

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase()
      result = result.filter((s) =>
        s.title.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query)
      )
    }

    return result
  }, [sessions, filter, selectedTeam, searchQuery])

  // Group sessions by team
  const teamMap = useMemo(() => {
    const map = new Map<string | null, typeof filteredSessions>()
    for (const s of filteredSessions) {
      const key = s.team_id ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [filteredSessions])

  const teamName = (teamId: string) =>
    teams.find((t) => t.id === teamId)?.name ?? teamId

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa retrospettiva? L\'azione è irreversibile.')) return

    // All child tables have ON DELETE CASCADE — deleting the session removes everything
    const { error } = await supabase.from('sessions').delete().eq('id', sessionId)
    if (error) {
      console.error('Error deleting session:', error)
      return
    }

    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
  }

  const handleJoin = async () => {
    if (!joinCode.trim() || !user) return
    const sessionId = joinCode.trim()

    // Join directly — skip session SELECT (blocked by RLS for non-participants).
    // If session_id doesn't exist, the FK constraint rejects the insert.
    const { error } = await supabase.from('session_participants').upsert(
      { session_id: sessionId, user_id: user.id, role: 'participant' },
      { onConflict: 'session_id,user_id' }
    )

    if (error) {
      alert('Sessione non trovata')
      return
    }

    navigate(`/session/${sessionId}`)
  }

  const filterTabs: { key: FilterTab; label: string; count: number; icon: typeof LayoutGrid }[] = [
    { key: 'all', label: 'Tutte', count: sessions.length, icon: LayoutGrid },
    { key: 'active', label: 'Attive', count: activeSessions.length, icon: Play },
    { key: 'closed', label: 'Concluse', count: closedSessions.length, icon: CheckCircle2 },
  ]

  const stats = [
    {
      label: 'Totale Sessioni',
      value: sessions.length,
      icon: LayoutGrid,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      label: 'In Corso',
      value: activeSessions.length,
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Concluse',
      value: closedSessions.length,
      icon: CheckCircle2,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Partecipanti',
      value: totalParticipants,
      icon: Users,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* ── Header ── */}
      <PageHeader
        variant="hero"
        title={isSuperAdmin() ? 'Tutte le retrospettive' : 'Le tue retrospettive'}
        description="Monitora, gestisci e analizza tutte le tue sessioni retrospettive [NUOVO DESIGN v1.14.17]"
        icon={LayoutGrid}
        gradient="primary"
        badge={{
          label: isSuperAdmin() ? 'Super Admin' : 'Dashboard',
          variant: 'default'
        }}
      />

      {/* ── Hero Stats ── */}
      {!loading && sessions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Card className="!p-5 !rounded-2xl hover:scale-[1.02] transition-transform duration-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon size={24} className={stat.iconColor} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-retro-text-secondary font-medium mb-1">
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold font-display bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Quick Actions Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Join Session */}
        <Card className="flex-1 !p-3 !rounded-2xl">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text-secondary pointer-events-none" />
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                placeholder="Incolla ID sessione per partecipare..."
                className="!pl-10"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoin()
                }}
              />
            </div>
            <Button variant="secondary" onClick={handleJoin} disabled={!joinCode.trim()}>
              <LinkIcon size={16} />
              Unisciti
            </Button>
          </div>
        </Card>

        {/* Create Session */}
        {canCreate(user?.email) && (
          <Button
            onClick={() => setShowCreate(true)}
            size="lg"
            className="!bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 !text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={18} />
            Nuova Retrospettiva
          </Button>
        )}
      </div>

      {/* ── Advanced Filters ── */}
      {sessions.length > 0 && (
        <div className="space-y-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
            {filterTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = filter === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white shadow-soft text-retro-text scale-105'
                      : 'text-retro-text-secondary hover:text-retro-text'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold transition-transform ${
                    isActive ? 'bg-retro-primary-light text-retro-primary scale-110' : 'bg-slate-200 text-retro-text-secondary'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search & Team Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text-secondary pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per titolo o ID sessione..."
                className="!pl-10 !bg-white"
              />
            </div>

            {/* Team Filter */}
            {teams.length > 0 && (
              <div className="relative sm:w-64">
                <Filter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text-secondary pointer-events-none z-10" />
                <select
                  value={selectedTeam || ''}
                  onChange={(e) => setSelectedTeam(e.target.value || null)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-retro-text focus:outline-none focus:ring-2 focus:ring-retro-primary/20 focus:border-retro-primary transition-all appearance-none cursor-pointer"
                >
                  <option value="">Tutti i team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Filters Indicator */}
          {(searchQuery || selectedTeam) && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-retro-text-secondary">
                Mostrando {filteredSessions.length} di {sessions.length} sessioni
              </span>
              <button
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTeam(null)
                }}
                className="text-sm text-retro-primary hover:text-retro-primary-dark font-medium transition-colors"
              >
                Azzera filtri
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
          <SessionCardSkeleton />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="!rounded-2xl text-center !py-16">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-retro-primary-400 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-primary animate-pulse-glow">
            <FolderOpen size={36} className="text-white" />
          </div>
          <p className="text-xl font-bold tracking-display text-retro-text-DEFAULT mb-2">
            Nessuna retrospettiva trovata
          </p>
          <p className="text-sm text-retro-text-secondary mb-8 max-w-sm mx-auto">
            Crea la tua prima sessione per iniziare a raccogliere feedback dal team,
            oppure unisciti a una retrospettiva esistente.
          </p>
          {canCreate(user?.email) && (
            <div className="flex items-center justify-center gap-3">
              <Button onClick={() => setShowCreate(true)} size="lg">
                <Plus size={18} />
                Crea la prima sessione
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder*="ID sessione"]')
                  input?.focus()
                }}
              >
                <LinkIcon size={18} />
                Ho un codice
              </Button>
            </div>
          )}
        </Card>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Search size={28} className="text-retro-text-secondary" />
          </div>
          <p className="text-lg font-semibold text-retro-text mb-1">
            Nessun risultato
          </p>
          <p className="text-sm text-retro-text-secondary">
            Prova a modificare i filtri di ricerca
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sessions grouped by team */}
          {[...teamMap.entries()]
            .filter(([key]) => key !== null)
            .sort(([a], [b]) => teamName(a!).localeCompare(teamName(b!)))
            .map(([teamId, teamSessions]) => (
              <div key={teamId}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  <h2 className="text-base font-bold text-retro-text tracking-wide">
                    {teamName(teamId!)}
                  </h2>
                  <span className="text-xs text-retro-text-secondary bg-slate-100 rounded-full px-2.5 py-1 font-semibold">
                    {teamSessions.length}
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {teamSessions.map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                    >
                      <SessionCard session={s} participantCount={s.participant_count} onDelete={handleDelete} index={idx} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

          {/* Sessions without a team */}
          {teamMap.has(null) && (
            <div>
              {teamMap.size > 1 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <FolderOpen size={16} className="text-retro-text-secondary" />
                  </div>
                  <h2 className="text-base font-bold text-retro-text tracking-wide">
                    Senza team
                  </h2>
                  <span className="text-xs text-retro-text-secondary bg-slate-100 rounded-full px-2.5 py-1 font-semibold">
                    {teamMap.get(null)!.length}
                  </span>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teamMap.get(null)!.map((s, index) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <SessionCard session={s} participantCount={s.participant_count} onDelete={handleDelete} index={index} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateSessionModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
