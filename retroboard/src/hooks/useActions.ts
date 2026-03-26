import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Action } from '@/types/database'

export function useActions(sessionId: string | undefined) {
  const [actions, setActions] = useState<Action[]>([])

  const fetchActions = useCallback(async () => {
    if (!sessionId) return
    const { data } = await supabase
      .from('actions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at')
    if (data) setActions(data)
  }, [sessionId])

  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`actions-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'actions', filter: `session_id=eq.${sessionId}` },
        () => fetchActions()
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('actions channel error:', err)
      })
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, fetchActions])

  // Polling fallback
  useEffect(() => {
    if (!sessionId) return
    const interval = setInterval(fetchActions, 3000)
    return () => clearInterval(interval)
  }, [sessionId, fetchActions])

  const addAction = async (text: string, assignedTo?: string, deadline?: string) => {
    if (!sessionId) return
    const { error } = await supabase.from('actions').insert({
      session_id: sessionId,
      text,
      assigned_to: assignedTo || null,
      deadline: deadline || null,
    })
    if (error) console.error('addAction failed:', error)
    else await fetchActions()
  }

  const updateActionStatus = async (actionId: string, status: Action['status']) => {
    const { error } = await supabase.from('actions').update({ status }).eq('id', actionId)
    if (error) console.error('updateActionStatus failed:', error)
    else await fetchActions()
  }

  const updateAction = async (actionId: string, updates: Partial<Action>) => {
    const { error } = await supabase.from('actions').update(updates).eq('id', actionId)
    if (error) console.error('updateAction failed:', error)
    else await fetchActions()
  }

  const deleteAction = async (actionId: string) => {
    const { error } = await supabase.from('actions').delete().eq('id', actionId)
    if (error) console.error('deleteAction failed:', error)
    else await fetchActions()
  }

  return { actions, addAction, updateActionStatus, updateAction, deleteAction }
}
