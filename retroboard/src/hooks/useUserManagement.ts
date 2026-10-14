import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export type AdminUser = {
  id: string
  name: string
  email: string
  is_super_admin: boolean
  can_create_sessions: boolean
  is_banned: boolean
  banned_at: string | null
  banned_by_name: string | null
  created_at: string
  teams_count: number
}

export function useUserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin())

  const fetchUsers = useCallback(async () => {
    if (!isSuperAdmin) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.rpc('get_all_users_admin')

      if (error) throw error

      setUsers(data || [])
    } catch (error) {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [isSuperAdmin])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Realtime updates quando cambiano i profiles
  useEffect(() => {
    if (!isSuperAdmin) return

    const channel = supabase
      .channel('admin-users-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          fetchUsers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin])

  /**
   * Ban/Unban utente
   */
  const banUser = useCallback(
    async (userId: string, ban: boolean = true) => {
      const { data, error } = await supabase.rpc('ban_user', {
        p_user_id: userId,
        p_ban: ban,
      })

      if (error) throw error

      if (!data || !data.success) {
        throw new Error(data?.error || 'Errore durante il ban/unban')
      }

      await fetchUsers()

      return {
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        isBanned: data.is_banned,
      }
    },
    [fetchUsers]
  )

  /**
   * Elimina utente
   */
  const deleteUser = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase.rpc('delete_user_account', {
        p_user_id: userId,
      })

      if (error) throw error

      if (!data || !data.success) {
        throw new Error(data?.error || 'Errore durante l\'eliminazione')
      }

      await fetchUsers()

      return {
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        note: data.note,
      }
    },
    [fetchUsers]
  )

  /**
   * Set/Unset Super Admin
   */
  const setSuperAdmin = useCallback(
    async (userId: string, isSuperAdmin: boolean) => {
      const { data, error } = await supabase.rpc('set_super_admin_status', {
        p_user_id: userId,
        p_is_super_admin: isSuperAdmin,
      })

      if (error) throw error

      if (!data || !data.success) {
        throw new Error(data?.error || 'Errore durante la modifica privilegi')
      }

      await fetchUsers()

      return {
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        isSuperAdmin: data.is_super_admin,
      }
    },
    [fetchUsers]
  )

  /**
   * Set/Unset permesso creazione sessioni (Owner)
   */
  const setCanCreateSessions = useCallback(
    async (userId: string, canCreate: boolean) => {
      const { data, error } = await supabase.rpc('set_can_create_sessions', {
        p_user_id: userId,
        p_can_create: canCreate,
      })

      if (error) throw error

      if (!data || !data.success) {
        throw new Error(data?.error || 'Errore durante la modifica permessi')
      }

      await fetchUsers()

      return {
        userId: data.user_id,
        userName: data.user_name,
        userEmail: data.user_email,
        canCreateSessions: data.can_create_sessions,
      }
    },
    [fetchUsers]
  )

  return {
    users,
    loading,
    banUser,
    deleteUser,
    setSuperAdmin,
    setCanCreateSessions,
    refreshUsers: fetchUsers,
  }
}
