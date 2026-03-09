import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTeams } from '@/hooks/useTeams'
import { SessionCard } from './SessionCard'
import { CreateSessionModal } from './CreateSessionModal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Link as LinkIcon, Loader2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { Session } from '@/types/database'

export function Dashboard() {
  const [sessions, setSessions] = useState<(Session & { participant_count: number })[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const user = useAuthStore((s) => s.user)
  const { teams } = useTeams()
  const navigate = useNavigate()
  const location = useLocation()

  const fetchSessions = useCallback(async () => {
    if (!user) return

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
      const withCounts = await Promise.all(
        sessionsData.map(async (s) => {
          const { count } = await supabase
            .from('session_participants')
            .select('*', { count: 'exact', head: true })
            .eq('session_id', s.id)
          return { ...s, participant_count: count || 0 }
        })
      )
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

  // Group sessions by team
  const teamMap = useMemo(() => {
    const map = new Map<string | null, typeof sessions>()
    for (const s of sessions) {
      const key = s.team_id ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(s)
    }
    return map
  }, [sessions])

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-retro-text">
          Le tue retrospettive 👋
        </h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          Nuova sessione
        </Button>
      </div>

      <div className="flex gap-2 mb-8">
        <Input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Incolla ID sessione per partecipare..."
          className="flex-1"
        />
        <Button variant="secondary" onClick={handleJoin} disabled={!joinCode.trim()}>
          <LinkIcon size={16} />
          Unisciti
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-retro-primary" size={32} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20 text-retro-text-secondary">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-medium mb-2">Nessuna retrospettiva</p>
          <p className="text-sm mb-6">Crea una nuova sessione o unisciti a una esistente</p>
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Crea la prima sessione
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Sessions grouped by team */}
          {[...teamMap.entries()]
            .filter(([key]) => key !== null)
            .sort(([a], [b]) => teamName(a!).localeCompare(teamName(b!)))
            .map(([teamId, teamSessions]) => (
              <div key={teamId}>
                <h2 className="inline-flex items-center bg-slate-100 rounded-xl px-4 py-2 text-sm font-semibold text-retro-text-secondary uppercase tracking-wide mb-3">
                  {teamName(teamId!)}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 mt-3">
                  {teamSessions.map((s) => (
                    <SessionCard key={s.id} session={s} participantCount={s.participant_count} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            ))}

          {/* Sessions without a team */}
          {teamMap.has(null) && (
            <div>
              <h2 className="inline-flex items-center bg-slate-100 rounded-xl px-4 py-2 text-sm font-semibold text-retro-text-secondary uppercase tracking-wide mb-3">
                Senza team
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 mt-3">
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
