import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useGamification } from './useGamification'
import type { TeamMoodVote } from '@/types/database'

export function useTeamMood(sessionId: string | undefined) {
  const [teamMoodVotes, setTeamMoodVotes] = useState<TeamMoodVote[]>([])
  const user = useAuthStore((s) => s.user)
  const session = useSessionStore((s) => s.session)
  const { awardPoints } = useGamification(session?.team_id)

  const fetchTeamMoodVotes = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('team_mood_votes')
      .select('*')
      .eq('session_id', sessionId)
    if (error) {
      console.error('fetchTeamMoodVotes failed:', error)
      return
    }
    if (data) setTeamMoodVotes(data)
  }, [sessionId])

  useEffect(() => {
    fetchTeamMoodVotes()
  }, [fetchTeamMoodVotes])

  // Realtime
  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`team-mood-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_mood_votes', filter: `session_id=eq.${sessionId}` },
        () => fetchTeamMoodVotes()
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('team mood channel error:', err)
      })
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, fetchTeamMoodVotes])

  // Polling fallback
  useEffect(() => {
    if (!sessionId) return
    const interval = setInterval(fetchTeamMoodVotes, 3000)
    return () => clearInterval(interval)
  }, [sessionId, fetchTeamMoodVotes])

  const submitTeamMood = async (mood: TeamMoodVote['mood']) => {
    if (!sessionId || !user) return

    // Check if already voted
    const alreadyVoted = teamMoodVotes.some((m) => m.user_id === user.id)

    const { error } = await supabase.from('team_mood_votes').upsert(
      {
        session_id: sessionId,
        user_id: user.id,
        mood,
      },
      { onConflict: 'session_id,user_id' }
    )
    if (error) {
      console.error('submitTeamMood failed:', error)
    } else {
      await fetchTeamMoodVotes()
      // Award points only for first vote (not for changing vote)
      if (!alreadyVoted) {
        await awardPoints('mood_vote', sessionId)
      }
    }
  }

  const userTeamMood = teamMoodVotes.find((m) => m.user_id === user?.id)

  const teamMoodCounts = {
    ottima: teamMoodVotes.filter((m) => m.mood === 'ottima').length,
    buona: teamMoodVotes.filter((m) => m.mood === 'buona').length,
    sufficiente: teamMoodVotes.filter((m) => m.mood === 'sufficiente').length,
    scarsa: teamMoodVotes.filter((m) => m.mood === 'scarsa').length,
  }

  return { teamMoodVotes, submitTeamMood, userTeamMood, teamMoodCounts }
}
