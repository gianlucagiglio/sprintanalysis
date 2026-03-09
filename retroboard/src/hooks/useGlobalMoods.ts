import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { MoodVote } from '@/types/database'

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

export function useGlobalMoods() {
  const [sessionMoods, setSessionMoods] = useState<SessionMoodData[]>([])
  const [allMoodVotes, setAllMoodVotes] = useState<MoodVote[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchGlobalMoods = useCallback(async () => {
    if (!user) return

    // 1. Get all sessions the user participated in
    const { data: participations, error: partError } = await supabase
      .from('session_participants')
      .select('session_id')
      .eq('user_id', user.id)

    if (partError || !participations?.length) {
      setLoading(false)
      return
    }

    const sessionIds = participations.map((p) => p.session_id)

    // 2. Fetch sessions and mood_votes in parallel
    const [sessionsRes, moodsRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, title, created_at')
        .in('id', sessionIds)
        .order('created_at'),
      supabase
        .from('mood_votes')
        .select('*')
        .in('session_id', sessionIds),
    ])

    const sessions = sessionsRes.data || []
    const moods = moodsRes.data || []

    setAllMoodVotes(moods)

    // 3. Group moods by session
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

      return {
        sessionId: session.id,
        sessionTitle: session.title,
        sessionDate: session.created_at,
        ...counts,
        total,
        dominant,
      }
    })

    setSessionMoods(grouped)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchGlobalMoods()
  }, [fetchGlobalMoods])

  const globalCounts = {
    glad: allMoodVotes.filter((m) => m.mood === 'glad').length,
    sad: allMoodVotes.filter((m) => m.mood === 'sad').length,
    mad: allMoodVotes.filter((m) => m.mood === 'mad').length,
    custom: allMoodVotes.filter((m) => m.mood === 'custom').length,
  }

  return { sessionMoods, allMoodVotes, globalCounts, loading }
}
