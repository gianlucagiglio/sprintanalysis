import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Action } from '@/types/database'

type OverdueAction = Action & {
  session: {
    id: string
    title: string
  }
}

export function useOverdueActions() {
  const [overdueActions, setOverdueActions] = useState<OverdueAction[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchOverdueActions = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    const now = new Date().toISOString()

    // Cerca azioni con deadline scaduta, non completate, assegnate all'utente
    const { data, error } = await supabase
      .from('actions')
      .select('*, session:sessions(id, title)')
      .lt('deadline', now)
      .neq('status', 'done')
      .or(`assigned_to.eq.${user.id},assigned_to_multi.cs.{${user.id}}`)
      .order('deadline', { ascending: true })

    if (error) {
      console.error('fetchOverdueActions failed:', error)
      setLoading(false)
      return
    }

    setOverdueActions(data || [])
    setLoading(false)
  }

  const dismissAction = (actionId: string) => {
    setOverdueActions((prev) => prev.filter((a) => a.id !== actionId))
  }

  const dismissAll = () => {
    setOverdueActions([])
  }

  useEffect(() => {
    // Delay fetch to avoid thundering herd at login
    const timer = setTimeout(() => {
      fetchOverdueActions()
    }, 1000)

    return () => clearTimeout(timer)
  }, [user])

  return {
    overdueActions,
    loading,
    hasOverdue: overdueActions.length > 0,
    dismissAction,
    dismissAll,
  }
}
