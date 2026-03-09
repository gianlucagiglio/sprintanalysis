import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { MoodVote } from '@/types/database'

export function useMood(sessionId: string | undefined) {
  const [moodVotes, setMoodVotes] = useState<MoodVote[]>([])
  const user = useAuthStore((s) => s.user)

  const fetchMoodVotes = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('mood_votes')
      .select('*')
      .eq('session_id', sessionId)
    if (error) {
      console.error('fetchMoodVotes failed:', error)
      return
    }
    if (data) setMoodVotes(data)
  }, [sessionId])

  useEffect(() => {
    fetchMoodVotes()
  }, [fetchMoodVotes])

  // Realtime
  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`mood-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mood_votes', filter: `session_id=eq.${sessionId}` },
        () => fetchMoodVotes()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, fetchMoodVotes])

  // Polling fallback
  useEffect(() => {
    if (!sessionId) return
    const interval = setInterval(fetchMoodVotes, 3000)
    return () => clearInterval(interval)
  }, [sessionId, fetchMoodVotes])

  const submitMood = async (mood: MoodVote['mood'], customLabel?: string) => {
    if (!sessionId || !user) return
    const { error } = await supabase.from('mood_votes').upsert(
      {
        session_id: sessionId,
        user_id: user.id,
        mood,
        custom_label: customLabel || null,
      },
      { onConflict: 'session_id,user_id' }
    )
    if (error) {
      console.error('submitMood failed:', error)
    } else {
      await fetchMoodVotes()
    }
  }

  const userMood = moodVotes.find((m) => m.user_id === user?.id)

  const moodCounts = {
    glad: moodVotes.filter((m) => m.mood === 'glad').length,
    sad: moodVotes.filter((m) => m.mood === 'sad').length,
    mad: moodVotes.filter((m) => m.mood === 'mad').length,
    custom: moodVotes.filter((m) => m.mood === 'custom').length,
  }

  return { moodVotes, submitMood, userMood, moodCounts }
}
