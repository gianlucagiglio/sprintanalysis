import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useTeams, type TeamWithMemberCount } from '@/hooks/useTeams'

const MOOD_SCORES: Record<string, number> = {
  glad: 3,
  custom: 2,
  sad: 1,
  mad: 0,
}

export type TeamStats = {
  team: TeamWithMemberCount
  retroCount: number
  memberCount: number
  avgParticipants: number
  happinessAvg: number
  happinessTrend: 'up' | 'down' | 'stable'
  totalComments: number
  positiveRate: number
  totalActions: number
  doneActions: number
  lastSessionDate: string | null
}

export type NoTeamStats = {
  retroCount: number
  avgParticipants: number
  happinessAvg: number
  totalComments: number
  positiveRate: number
  totalActions: number
  doneActions: number
  lastSessionDate: string | null
}

export function useTeamStats() {
  const user = useAuthStore((s) => s.user)
  const { teams, loading: teamsLoading } = useTeams()
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])
  const [noTeamStats, setNoTeamStats] = useState<NoTeamStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    if (!user || teamsLoading) return

    // Get all sessions the user participated in
    const { data: participations } = await supabase
      .from('session_participants')
      .select('session_id')
      .eq('user_id', user.id)

    if (!participations?.length) {
      setTeamStats([])
      setNoTeamStats(null)
      setLoading(false)
      return
    }

    const allSessionIds = participations.map((p) => p.session_id)

    // Fetch all sessions with their team_id
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, title, team_id, created_at')
      .in('id', allSessionIds)
      .order('created_at')

    if (!sessions?.length) {
      setTeamStats([])
      setNoTeamStats(null)
      setLoading(false)
      return
    }

    // Fetch all related data in parallel
    const [moodsRes, sectionsRes, allParticipantsRes, actionsRes] = await Promise.all([
      supabase.from('mood_votes').select('*').in('session_id', allSessionIds),
      supabase.from('sections').select('id, session_id').in('session_id', allSessionIds),
      supabase.from('session_participants').select('session_id, user_id').in('session_id', allSessionIds),
      supabase.from('actions').select('session_id, status').in('session_id', allSessionIds),
    ])

    const moods = moodsRes.data || []
    const sections = sectionsRes.data || []
    const allParticipants = allParticipantsRes.data || []
    const actions = actionsRes.data || []

    // Fetch comments
    const sectionIdList = sections.map((s) => s.id)
    let comments: { section_id: string; sentiment: string | null }[] = []
    if (sectionIdList.length) {
      const { data } = await supabase
        .from('comments')
        .select('section_id, sentiment')
        .in('section_id', sectionIdList)
      comments = data || []
    }

    // Build section -> sessionId map
    const sectionToSession = new Map<string, string>()
    for (const s of sections) {
      sectionToSession.set(s.id, s.session_id)
    }

    // Group sessions by team_id
    const sessionsByTeam = new Map<string | null, typeof sessions>()
    for (const session of sessions) {
      const key = session.team_id
      if (!sessionsByTeam.has(key)) sessionsByTeam.set(key, [])
      sessionsByTeam.get(key)!.push(session)
    }

    // Helper to compute stats for a set of sessions
    const computeStats = (teamSessions: typeof sessions) => {
      const sessionIds = teamSessions.map((s) => s.id)
      const sessionIdSet = new Set(sessionIds)

      // Participants per session
      const participantsBySession = new Map<string, Set<string>>()
      for (const p of allParticipants) {
        if (!sessionIdSet.has(p.session_id)) continue
        if (!participantsBySession.has(p.session_id)) participantsBySession.set(p.session_id, new Set())
        participantsBySession.get(p.session_id)!.add(p.user_id)
      }
      const totalParticipants = Array.from(participantsBySession.values()).reduce((sum, s) => sum + s.size, 0)
      const avgParticipants = teamSessions.length ? Math.round((totalParticipants / teamSessions.length) * 10) / 10 : 0

      // Happiness per session
      const sessionScores: number[] = []
      for (const session of teamSessions) {
        const sessionMoods = moods.filter((m) => m.session_id === session.id)
        if (sessionMoods.length) {
          const avg = sessionMoods.reduce((sum, m) => sum + (MOOD_SCORES[m.mood] ?? 2), 0) / sessionMoods.length
          sessionScores.push(avg)
        }
      }
      const happinessAvg = sessionScores.length
        ? Math.round((sessionScores.reduce((a, b) => a + b, 0) / sessionScores.length) * 100) / 100
        : 0

      // Trend: compare last 2 sessions
      let happinessTrend: 'up' | 'down' | 'stable' = 'stable'
      if (sessionScores.length >= 2) {
        const last = sessionScores[sessionScores.length - 1]
        const prev = sessionScores[sessionScores.length - 2]
        happinessTrend = last > prev ? 'up' : last < prev ? 'down' : 'stable'
      }

      // Comments
      const teamComments = comments.filter((c) => {
        const sid = sectionToSession.get(c.section_id)
        return sid && sessionIdSet.has(sid)
      })
      const totalComments = teamComments.length
      const positiveComments = teamComments.filter((c) => c.sentiment === 'positive').length
      const positiveRate = totalComments ? Math.round((positiveComments / totalComments) * 100) : 0

      // Actions
      const teamActions = actions.filter((a) => sessionIdSet.has(a.session_id))
      const totalActions = teamActions.length
      const doneActions = teamActions.filter((a) => a.status === 'done').length

      // Last session date
      const lastSessionDate = teamSessions.length
        ? teamSessions[teamSessions.length - 1].created_at
        : null

      return {
        retroCount: teamSessions.length,
        avgParticipants,
        happinessAvg,
        happinessTrend,
        totalComments,
        positiveRate,
        totalActions,
        doneActions,
        lastSessionDate,
      }
    }

    // Build team stats
    const stats: TeamStats[] = []
    for (const team of teams) {
      const teamSessions = sessionsByTeam.get(team.id) || []
      const computed = computeStats(teamSessions)
      stats.push({
        team,
        memberCount: team.member_count,
        ...computed,
      })
    }
    setTeamStats(stats)

    // "Senza team" stats
    const noTeamSessions = sessionsByTeam.get(null) || []
    if (noTeamSessions.length) {
      setNoTeamStats(computeStats(noTeamSessions))
    } else {
      setNoTeamStats(null)
    }

    setLoading(false)
  }, [user, teams, teamsLoading])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { teamStats, noTeamStats, loading: loading || teamsLoading }
}
