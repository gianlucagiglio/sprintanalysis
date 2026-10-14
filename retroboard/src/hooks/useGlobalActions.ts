import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Action } from '@/types/database'

export type ActionWithSession = Action & {
  sessionTitle: string
  assigneeName: string | null
  assigneeNames: string[]
}

export function useGlobalActions(teamId?: string | null) {
  const [actions, setActions] = useState<ActionWithSession[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchGlobalActions = useCallback(async () => {
    if (!user) return

    // 1. Get all teams the user is a member of
    const { data: memberships, error: membershipsError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id)

    if (membershipsError) {
      setLoading(false)
      return
    }

    const teamIds = memberships?.map(m => m.team_id) || []

    if (teamIds.length === 0) {
      setActions([])
      setLoading(false)
      return
    }

    // Filter by specific team if provided
    const filteredTeamIds = teamId ? teamIds.filter(id => id === teamId) : teamIds

    if (filteredTeamIds.length === 0) {
      setActions([])
      setLoading(false)
      return
    }

    // 2. Fetch all sessions from user's teams
    const { data: teamSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('id, title')
      .in('team_id', filteredTeamIds)
      .order('created_at', { ascending: false })

    if (sessionsError || !teamSessions?.length) {
      setActions([])
      setLoading(false)
      return
    }

    const sessionIds = teamSessions.map(s => s.id)

    // 3. Fetch actions for these sessions
    const [sessionsRes, actionsRes] = await Promise.all([
      Promise.resolve({ data: teamSessions }),
      supabase
        .from('actions')
        .select('*')
        .in('session_id', sessionIds)
        .order('created_at'),
    ])

    const sessions = sessionsRes.data || []
    const allActions = actionsRes.data || []

    // Filter actions to only include those from filtered sessions
    const filteredSessionIds = new Set(sessions.map(s => s.id))
    const rawActions = allActions.filter(a => filteredSessionIds.has(a.session_id))

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
  }, [user, teamId])

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
