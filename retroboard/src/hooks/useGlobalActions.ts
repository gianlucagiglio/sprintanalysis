import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Action } from '@/types/database'

export type ActionWithSession = Action & {
  sessionTitle: string
  assigneeName: string | null
}

export function useGlobalActions() {
  const [actions, setActions] = useState<ActionWithSession[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchGlobalActions = useCallback(async () => {
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

    // 2. Fetch sessions and actions in parallel
    const [sessionsRes, actionsRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, title')
        .in('id', sessionIds),
      supabase
        .from('actions')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at'),
    ])

    const sessions = sessionsRes.data || []
    const rawActions = actionsRes.data || []

    // 3. Fetch assignee profiles
    const assigneeIds = [...new Set(rawActions.map((a) => a.assigned_to).filter(Boolean))] as string[]
    let profileMap = new Map<string, string>()
    if (assigneeIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', assigneeIds)
      if (profiles) {
        profileMap = new Map(profiles.map((p) => [p.id, p.name]))
      }
    }

    const sessionMap = new Map(sessions.map((s) => [s.id, s.title]))

    const enriched: ActionWithSession[] = rawActions.map((action) => ({
      ...action,
      sessionTitle: sessionMap.get(action.session_id) || 'Sessione sconosciuta',
      assigneeName: (action.assigned_to && profileMap.get(action.assigned_to)) || null,
    }))

    setActions(enriched)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchGlobalActions()
  }, [fetchGlobalActions])

  // Polling to stay in sync with session-scoped changes
  useEffect(() => {
    if (!user) return
    const interval = setInterval(fetchGlobalActions, 3000)
    return () => clearInterval(interval)
  }, [user, fetchGlobalActions])

  const updateActionStatus = async (actionId: string, status: Action['status']) => {
    await supabase.from('actions').update({ status }).eq('id', actionId)
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status } : a))
    )
  }

  return { actions, loading, updateActionStatus, refetch: fetchGlobalActions }
}
