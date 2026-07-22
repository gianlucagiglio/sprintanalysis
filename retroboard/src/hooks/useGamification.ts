import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { UserPoints, PointTransaction, ActionType } from '@/types/gamification'
import { POINTS_CONFIG } from '@/types/gamification'

export function useGamification(teamId?: string | null) {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<PointTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  // Fetch user points
  const fetchUserPoints = useCallback(async () => {
    if (!user) return

    let query = supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)

    // Handle NULL team_id correctly
    if (teamId !== undefined && teamId !== null) {
      query = query.eq('team_id', teamId)
    } else {
      query = query.is('team_id', null)
    }

    const { data, error } = await query.maybeSingle()

    if (error) {
      console.error('fetchUserPoints failed:', error)
      setLoading(false)
      return
    }

    if (data) {
      setUserPoints(data)
    } else {
      // Initialize with 0 points (display only, not saved to DB)
      setUserPoints({
        id: '',
        user_id: user.id,
        team_id: teamId || null,
        points: 0,
        level: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    setLoading(false)
  }, [user, teamId])

  // Fetch recent transactions
  const fetchRecentTransactions = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error('fetchRecentTransactions failed:', error)
      return
    }

    if (data) setRecentTransactions(data)
  }, [user])

  useEffect(() => {
    fetchUserPoints()
    fetchRecentTransactions()
  }, [fetchUserPoints, fetchRecentTransactions])

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`gamification-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchUserPoints()
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'point_transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchRecentTransactions()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchUserPoints, fetchRecentTransactions])

  // Award points for an action
  const awardPoints = async (
    actionType: ActionType,
    sessionId?: string,
    actionId?: string,
    metadata?: Record<string, any>
  ) => {
    if (!user) return

    const points = POINTS_CONFIG[actionType]
    if (points === 0 && actionType !== 'streak_bonus' && actionType !== 'early_bird') return

    // Call stored procedure
    const { error } = await supabase.rpc('add_user_points', {
      p_user_id: user.id,
      p_team_id: teamId || null,
      p_session_id: sessionId || null,
      p_action_id: actionId || null,
      p_action_type: actionType,
      p_points: points,
      p_description: getActionDescription(actionType),
      p_metadata: metadata || {},
    })

    if (error) {
      console.error('awardPoints failed:', error)
    } else {
      // Refresh data
      await fetchUserPoints()
      await fetchRecentTransactions()
    }
  }

  return {
    userPoints,
    recentTransactions,
    loading,
    awardPoints,
    refetch: () => {
      fetchUserPoints()
      fetchRecentTransactions()
    },
  }
}

function getActionDescription(actionType: ActionType): string {
  const descriptions: Record<ActionType, string> = {
    participate: 'Partecipazione retrospettiva',
    comment: 'Commento aggiunto',
    vote: 'Voto espresso',
    action_create: 'Azione creata',
    action_complete: 'Azione completata',
    mood_vote: 'Mood votato',
    quiz_correct: 'Risposta quiz corretta',
    quiz_win: 'Quiz vinto',
    streak_bonus: 'Bonus streak',
    early_bird: 'Bonus early bird',
  }
  return descriptions[actionType] || 'Azione completata'
}
