import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTeams } from '@/hooks/useTeams'
import { SessionCard } from './SessionCard'
import { CreateSessionModal } from './CreateSessionModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import {
  Plus,
  Link as LinkIcon,
  Loader2,
  LayoutGrid,
  Play,
  CheckCircle2,
  FolderOpen,
  Users,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { canCreate } from '@/config/permissions'
import type { Session } from '@/types/database'

type FilterTab = 'all' | 'active' | 'closed'

export function Dashboard() {
  const [sessions, setSessions] = useState<(Session & { participant_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
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

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    if (filter === 'active') return sessions.filter((s) => s.current_step >= 1 && s.current_step <= 4)
    if (filter === 'closed') return sessions.filter((s) => s.current_step === 5)
    return sessions
  }, [sessions, filter])

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-retro-text">
            {isSuperAdmin() ? 'Tutte le retrospettive' : 'Le tue retrospettive'}
          </h1>
          <p className="text-sm text-retro-text-secondary mt-1">
            {sessions.length} {sessions.length === 1 ? 'sessione' : 'sessioni'} {isSuperAdmin() ? 'nel sistema' : 'totali'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate(user?.email) && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              Nuova sessione
            </Button>
          )}
        </div>
      </div>

      {/* ── Join bar ── */}
      <Card className="!p-3 !rounded-2xl">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-retro-text-secondary pointer-events-none" />
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Incolla ID sessione per partecipare..."
              className="!pl-9"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleJoin()
              }}
            />
          </div>
          <Button variant="secondary" onClick={handleJoin} disabled={!joinCode.trim()}>
            Unisciti
          </Button>
        </div>
      </Card>

      {/* ── Stats + Filter tabs ── */}
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
                  ? 'bg-white shadow-soft text-retro-text'
                  : 'text-retro-text-secondary hover:text-retro-text'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? 'bg-retro-primary-light text-retro-primary' : 'bg-slate-200 text-retro-text-secondary'
              }`}>
                {tab.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-retro-primary" size={32} />
        </div>
      ) : sessions.length === 0 ? (
        <Card className="!rounded-2xl text-center !py-16">
          <div className="w-16 h-16 rounded-2xl bg-retro-primary-light flex items-center justify-center mx-auto mb-4">
            <FolderOpen size={28} className="text-retro-primary" />
          </div>
          <p className="text-lg font-semibold text-retro-text mb-1">Nessuna retrospettiva</p>
          <p className="text-sm text-retro-text-secondary mb-6">Crea una nuova sessione o unisciti a una esistente</p>
          {canCreate(user?.email) && (
            <Button onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              Crea la prima sessione
            </Button>
          )}
        </Card>
      ) : filteredSessions.length === 0 ? (
        <div className="text-center py-12 text-retro-text-secondary">
          <p className="text-sm">Nessuna retrospettiva {filter === 'active' ? 'attiva' : 'conclusa'}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sessions grouped by team */}
          {[...teamMap.entries()]
            .filter(([key]) => key !== null)
            .sort(([a], [b]) => teamName(a!).localeCompare(teamName(b!)))
            .map(([teamId, teamSessions]) => (
              <div key={teamId}>
                <div className="flex items-center gap-2 mb-3">
                  <Users size={14} className="text-retro-primary" />
                  <h2 className="text-sm font-bold text-retro-text uppercase tracking-wide">
                    {teamName(teamId!)}
                  </h2>
                  <span className="text-xs text-retro-text-secondary bg-slate-100 rounded-full px-2 py-0.5">
                    {teamSessions.length}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {teamSessions.map((s) => (
                    <SessionCard key={s.id} session={s} participantCount={s.participant_count} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            ))}

          {/* Sessions without a team */}
          {teamMap.has(null) && (
            <div>
              {teamMap.size > 1 && (
                <div className="flex items-center gap-2 mb-3">
                  <FolderOpen size={14} className="text-retro-text-secondary" />
                  <h2 className="text-sm font-bold text-retro-text uppercase tracking-wide">
                    Senza team
                  </h2>
                  <span className="text-xs text-retro-text-secondary bg-slate-100 rounded-full px-2 py-0.5">
                    {teamMap.get(null)!.length}
                  </span>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                {teamMap.get(null)!.map((s) => (
                  <SessionCard key={s.id} session={s} participantCount={s.participant_count} onDelete={handleDelete} />
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
