import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { MoodVote, TeamMoodVote } from '@/types/database'

export type SessionMoodData = {
  sessionId: string
  sessionTitle: string
  sessionDate: string
  glad: number
  sad: number
  mad: number
  custom: number
  total: number
  dominant: 'glad' | 'sad' | 'mad' | 'custom'
}

export type SessionTeamMoodData = {
  sessionId: string
  sessionTitle: string
  sessionDate: string
  ottima: number
  buona: number
  sufficiente: number
  scarsa: number
  total: number
  dominant: 'ottima' | 'buona' | 'sufficiente' | 'scarsa'
}

export function useGlobalMoods(teamId?: string) {
  const [sessionMoods, setSessionMoods] = useState<SessionMoodData[]>([])
  const [sessionTeamMoods, setSessionTeamMoods] = useState<SessionTeamMoodData[]>([])
  const [allMoodVotes, setAllMoodVotes] = useState<MoodVote[]>([])
  const [allTeamMoodVotes, setAllTeamMoodVotes] = useState<TeamMoodVote[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchGlobalMoods = useCallback(async () => {
    if (!user) return

    setLoading(true)

    // Get all teams the user is a member of
    const { data: memberships } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)

    const teamIds = memberships?.map(m => m.team_id) || []

    if (teamIds.length === 0) {
      setLoading(false)
      return
    }

    // Filter by specific team if provided, otherwise get all user's teams
    const filteredTeamIds = teamId ? teamIds.filter(id => id === teamId) : teamIds

    if (filteredTeamIds.length === 0) {
      setLoading(false)
      return
    }

    // Get all sessions from user's teams
    const { data: teamSessions } = await supabase
      .from('sessions')
      .select('id')
      .in('team_id', filteredTeamIds)

    if (!teamSessions?.length) {
      setLoading(false)
      return
    }

    const sessionIds = teamSessions.map(s => s.id)

    const [sessionsRes, moodsRes, teamMoodsRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, title, created_at')
        .in('id', sessionIds)
        .order('created_at'),
      supabase
        .from('mood_votes')
        .select('*')
        .in('session_id', sessionIds),
      supabase
        .from('team_mood_votes')
        .select('*')
        .in('session_id', sessionIds),
    ])

    const sessions = sessionsRes.data || []
    const moods = moodsRes.data || []
    const teamMoods = teamMoodsRes.data || []
    setAllMoodVotes(moods)
    setAllTeamMoodVotes(teamMoods)

    const grouped = sessions.map((session) => {
      const sessionMoods = moods.filter((m) => m.session_id === session.id)
      const counts = {
        glad: sessionMoods.filter((m) => m.mood === 'glad').length,
        sad: sessionMoods.filter((m) => m.mood === 'sad').length,
        mad: sessionMoods.filter((m) => m.mood === 'mad').length,
        custom: sessionMoods.filter((m) => m.mood === 'custom').length,
      }
      const total = sessionMoods.length
      const dominant = (Object.entries(counts) as [SessionMoodData['dominant'], number][])
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'glad'
      return { sessionId: session.id, sessionTitle: session.title, sessionDate: session.created_at, ...counts, total, dominant }
    })

    const groupedTeam = sessions.map((session) => {
      const sessionTeamMoods = teamMoods.filter((m) => m.session_id === session.id)
      const counts = {
        ottima: sessionTeamMoods.filter((m) => m.mood === 'ottima').length,
        buona: sessionTeamMoods.filter((m) => m.mood === 'buona').length,
        sufficiente: sessionTeamMoods.filter((m) => m.mood === 'sufficiente').length,
        scarsa: sessionTeamMoods.filter((m) => m.mood === 'scarsa').length,
      }
      const total = sessionTeamMoods.length
      const dominant = (Object.entries(counts) as [SessionTeamMoodData['dominant'], number][])
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'ottima'
      return { sessionId: session.id, sessionTitle: session.title, sessionDate: session.created_at, ...counts, total, dominant }
    })

    setSessionMoods(grouped)
    setSessionTeamMoods(groupedTeam)
    setLoading(false)
  }, [user, teamId])

  // Reset state when teamId changes (before fetch completes)
  useEffect(() => {
    setSessionMoods([])
    setSessionTeamMoods([])
    setAllMoodVotes([])
    setAllTeamMoodVotes([])
    setLoading(true)
  }, [teamId])

  useEffect(() => { fetchGlobalMoods() }, [fetchGlobalMoods])

  const globalCounts = {
    glad: allMoodVotes.filter((m) => m.mood === 'glad').length,
    sad: allMoodVotes.filter((m) => m.mood === 'sad').length,
    mad: allMoodVotes.filter((m) => m.mood === 'mad').length,
    custom: allMoodVotes.filter((m) => m.mood === 'custom').length,
  }

  const globalTeamMoodCounts = {
    ottima: allTeamMoodVotes.filter((m) => m.mood === 'ottima').length,
    buona: allTeamMoodVotes.filter((m) => m.mood === 'buona').length,
    sufficiente: allTeamMoodVotes.filter((m) => m.mood === 'sufficiente').length,
    scarsa: allTeamMoodVotes.filter((m) => m.mood === 'scarsa').length,
  }

  return { sessionMoods, sessionTeamMoods, allMoodVotes, allTeamMoodVotes, globalCounts, globalTeamMoodCounts, loading }
}
