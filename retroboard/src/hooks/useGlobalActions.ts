import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Action } from '@/types/database'

export type ActionWithSession = Action & {
  sessionTitle: string
  assigneeName: string | null
  assigneeNames: string[]
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

    // 3. Fetch assignee profiles from assigned_to_multi
    const allAssigneeIds = [...new Set(rawActions.flatMap((a) => a.assigned_to_multi || []))]
    let profileMap = new Map<string, string>()
    if (allAssigneeIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', allAssigneeIds)
      if (profiles) {
        profileMap = new Map(profiles.map((p) => [p.id, p.name]))
      }
    }

    const sessionMap = new Map(sessions.map((s) => [s.id, s.title]))

    const enriched: ActionWithSession[] = rawActions.map((action) => {
      const multi = action.assigned_to_multi || []
      const names = multi.map((id: string) => profileMap.get(id)).filter(Boolean) as string[]
      return {
        ...action,
        sessionTitle: sessionMap.get(action.session_id) || 'Sessione sconosciuta',
        assigneeName: names[0] || null,
        assigneeNames: names,
      }
    })

    setActions(enriched)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchGlobalActions()
  }, [fetchGlobalActions])

  // Realtime provides updates - polling removed to reduce DB load

  const updateActionStatus = async (actionId: string, status: Action['status']) => {
    await supabase.from('actions').update({ status }).eq('id', actionId)
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status } : a))
    )
  }

  const updateAction = async (actionId: string, updates: Partial<Action>) => {
    const { error } = await supabase.from('actions').update(updates).eq('id', actionId)
    if (error) console.error('updateAction failed:', error)
    else await fetchGlobalActions()
  }

  const deleteAction = async (actionId: string) => {
    const { error } = await supabase.from('actions').delete().eq('id', actionId)
    if (error) console.error('deleteAction failed:', error)
    else await fetchGlobalActions()
  }

  return { actions, loading, updateActionStatus, updateAction, deleteAction, refetch: fetchGlobalActions }
}
