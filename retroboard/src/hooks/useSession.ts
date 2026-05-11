import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'
import type { Session } from '@/types/database'

export function useSession(sessionId: string | undefined) {
  const { session, setSession, setParticipants, setSections, updateSession } = useSessionStore()
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const userId = user?.id
  const userRef = useRef(user)
  userRef.current = user
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const joinedRef = useRef(false)
  const [ready, setReady] = useState(false)

  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', sessionId)
      .single()
    if (data) setSession(data)
  }, [sessionId, setSession])

  const fetchParticipants = useCallback(async () => {
    if (!sessionId) return
    const { data } = await supabase
      .from('session_participants')
      .select('*, profiles(*)')
      .eq('session_id', sessionId)
    if (data) setParticipants(data as never)
  }, [sessionId, setParticipants])

  const fetchSections = useCallback(async () => {
    if (!sessionId) return
    const { data } = await supabase
      .from('sections')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order')
    if (data) setSections(data)
  }, [sessionId, setSections])

  // Auto-join + initial fetch: ensure user is a participant BEFORE fetching data
  // Uses userId (stable string) instead of user object to avoid re-init on reference changes
  useEffect(() => {
    if (!sessionId || !userId) return
    joinedRef.current = false
    setReady(false)

    const init = async () => {
      const currentUser = userRef.current
      if (!currentUser) return

      // Check if already a participant
      const { data: existing } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', currentUser.id)
        .maybeSingle()

      if (!existing) {
        const { error } = await supabase.from('session_participants').insert({
          session_id: sessionId,
          user_id: currentUser.id,
          role: 'participant',
        })
        if (error) {
          console.error('Failed to join session:', error)
          return
        }
      }

      joinedRef.current = true

      // Now fetch everything (RLS will pass since we're a participant)
      await Promise.all([fetchSession(), fetchParticipants(), fetchSections()])
      setReady(true)
    }

    init()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, userId, fetchSession, fetchParticipants, fetchSections])

  // Realtime subscription — waits for init to complete
  useEffect(() => {
    if (!sessionId || !ready) return

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'sessions', filter: `id=eq.${sessionId}` },
        (payload) => updateSession(payload.new as Partial<Session>)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_participants', filter: `session_id=eq.${sessionId}` },
        () => fetchParticipants()
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('session channel error:', err)
      })

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [sessionId, ready, updateSession, fetchParticipants])

  // Polling fallback: re-fetch session & participants every 3s — waits for init
  useEffect(() => {
    if (!sessionId || !ready) return
    const interval = setInterval(() => {
      fetchSession()
      fetchParticipants()
    }, 3000)
    return () => clearInterval(interval)
  }, [sessionId, ready, fetchSession, fetchParticipants])

  // Re-fetch everything when tab regains focus (e.g. after switching app)
  useEffect(() => {
    if (!sessionId || !ready) return
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchSession()
        fetchParticipants()
        fetchSections()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [sessionId, ready, fetchSession, fetchParticipants, fetchSections])

  // Helper: check if user can moderate (organizer or super admin)
  const canModerate = () => {
    const isOrg = session?.organizer_id === user?.id
    const isSuper = isSuperAdmin()
    console.log('[useSession] canModerate check:', { isOrg, isSuper, userId: user?.id, organizerId: session?.organizer_id })
    return isOrg || isSuper
  }

  const advanceStep = async () => {
    if (!session || !canModerate()) return
    const nextStep = Math.min(session.current_step + 1, 4)
    const prevStep = session.current_step
    const prevPhase = session.retro_phase
    updateSession({ current_step: nextStep, retro_phase: 'comments', retro_revealed: false, quiz_current_index: -1, phase_timer_duration: 0, phase_timer_started_at: null })
    const { error } = await supabase
      .from('sessions')
      .update({ current_step: nextStep, retro_phase: 'comments', retro_revealed: false, quiz_current_index: -1, phase_timer_duration: 0, phase_timer_started_at: null })
      .eq('id', session.id)
    if (error) {
      console.error('advanceStep failed:', error)
      updateSession({ current_step: prevStep, retro_phase: prevPhase })
    }
  }

  const setRetroPhase = async (phase: Session['retro_phase']) => {
    if (!session || !canModerate()) return
    const prevPhase = session.retro_phase
    const prevRevealed = session.retro_revealed
    const needsAnonymity = phase === 'comments'
    const revealed = needsAnonymity ? false : session.retro_revealed
    updateSession({ retro_phase: phase, retro_revealed: revealed, phase_timer_duration: 0, phase_timer_started_at: null })
    const { error } = await supabase
      .from('sessions')
      .update({ retro_phase: phase, retro_revealed: revealed, phase_timer_duration: 0, phase_timer_started_at: null })
      .eq('id', session.id)
    if (error) {
      console.error('setRetroPhase failed:', error)
      updateSession({ retro_phase: prevPhase, retro_revealed: prevRevealed })
    }
  }

  const revealRetro = async () => {
    if (!session || !canModerate()) return
    updateSession({ retro_revealed: true })
    const { error } = await supabase
      .from('sessions')
      .update({ retro_revealed: true })
      .eq('id', session.id)
    if (error) {
      console.error('revealRetro failed:', error)
      updateSession({ retro_revealed: false })
    }
  }

  const markDone = async () => {
    if (!session || !user) return
    const { error } = await supabase
      .from('session_participants')
      .update({ is_done: true })
      .eq('session_id', session.id)
      .eq('user_id', user.id)
    if (error) {
      console.error('markDone failed:', error)
    } else {
      await fetchParticipants()
    }
  }

  const resetDone = async () => {
    if (!session || !canModerate()) return
    const { error } = await supabase
      .from('session_participants')
      .update({ is_done: false })
      .eq('session_id', session.id)
    if (error) {
      console.error('resetDone failed:', error)
    } else {
      await fetchParticipants()
    }
  }

  const advanceQuiz = async () => {
    if (!session || !canModerate()) return
    const nextIndex = session.quiz_current_index + 1
    updateSession({ quiz_current_index: nextIndex })
    const { error } = await supabase
      .from('sessions')
      .update({ quiz_current_index: nextIndex })
      .eq('id', session.id)
    if (error) {
      console.error('advanceQuiz failed:', error)
      updateSession({ quiz_current_index: session.quiz_current_index })
    }
  }

  const resetQuizIndex = async () => {
    if (!session || !canModerate()) return
    updateSession({ quiz_current_index: -1 })
    await supabase
      .from('sessions')
      .update({ quiz_current_index: -1 })
      .eq('id', session.id)
  }

  const goToStep = async (step: number) => {
    if (!session || !canModerate()) return
    if (step < 1 || step > 4 || step >= session.current_step) return
    const prevStep = session.current_step
    updateSession({ current_step: step })
    const { error } = await supabase
      .from('sessions')
      .update({ current_step: step })
      .eq('id', session.id)
    if (error) {
      console.error('goToStep failed:', error)
      updateSession({ current_step: prevStep })
    }
  }

  const startPhaseTimer = async (durationSeconds: number) => {
    if (!session || !canModerate()) return
    const startedAt = new Date().toISOString()
    updateSession({ phase_timer_duration: durationSeconds, phase_timer_started_at: startedAt })
    const { error } = await supabase
      .from('sessions')
      .update({ phase_timer_duration: durationSeconds, phase_timer_started_at: startedAt })
      .eq('id', session.id)
    if (error) {
      console.error('startPhaseTimer failed:', error)
      updateSession({ phase_timer_duration: 0, phase_timer_started_at: null })
    }
  }

  const stopPhaseTimer = async () => {
    if (!session || !canModerate()) return
    updateSession({ phase_timer_duration: 0, phase_timer_started_at: null })
    const { error } = await supabase
      .from('sessions')
      .update({ phase_timer_duration: 0, phase_timer_started_at: null })
      .eq('id', session.id)
    if (error) {
      console.error('stopPhaseTimer failed:', error)
    }
  }

  const closeSession = async () => {
    if (!session || !canModerate()) return
    updateSession({ current_step: 5 })
    const { error } = await supabase
      .from('sessions')
      .update({ current_step: 5 })
      .eq('id', session.id)
    if (error) {
      console.error('closeSession failed:', error)
      updateSession({ current_step: session.current_step })
    }
  }

  const isOrganizer = session?.organizer_id === user?.id || isSuperAdmin()

  return {
    session,
    isOrganizer,
    advanceStep,
    goToStep,
    advanceQuiz,
    resetQuizIndex,
    setRetroPhase,
    revealRetro,
    markDone,
    resetDone,
    closeSession,
    startPhaseTimer,
    stopPhaseTimer,
    fetchSession,
    fetchParticipants,
  }
}
