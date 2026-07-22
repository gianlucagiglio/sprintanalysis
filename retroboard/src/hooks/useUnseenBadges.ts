import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { BadgeDefinition } from '@/types/gamification'

type UnseenBadge = {
  id: string
  badge_code: string
  unlocked_at: string
  badge: BadgeDefinition
}

export function useUnseenBadges() {
  const [unseenBadges, setUnseenBadges] = useState<UnseenBadge[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  // Check and unlock badges on login
  const checkBadges = async () => {
    if (!user) return

    const { error } = await supabase.rpc('check_and_unlock_badges', {
      p_user_id: user.id,
    })

    if (error) {
      console.error('checkBadges failed:', error)
    }
  }

  const fetchUnseenBadges = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badge:badge_definitions(*)')
      .eq('user_id', user.id)
      .eq('seen', false)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('fetchUnseenBadges failed:', error)
      setLoading(false)
      return
    }

    setUnseenBadges(data || [])
    setLoading(false)
  }

  const markAsSeen = async (badgeId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('user_badges')
      .update({ seen: true })
      .eq('id', badgeId)

    if (error) {
      console.error('markAsSeen failed:', error)
      return
    }

    // Remove from local state
    setUnseenBadges((prev) => prev.filter((b) => b.id !== badgeId))
  }

  const markAllAsSeen = async () => {
    if (!user || unseenBadges.length === 0) return

    const { error } = await supabase
      .from('user_badges')
      .update({ seen: true })
      .eq('user_id', user.id)
      .eq('seen', false)

    if (error) {
      console.error('markAllAsSeen failed:', error)
      return
    }

    setUnseenBadges([])
  }

  useEffect(() => {
    if (!user) return

    const initializeBadges = async () => {
      // Wait 3 seconds after login to let everything load
      await new Promise(resolve => setTimeout(resolve, 3000))

      console.log('[Badges] Checking for new badges...')
      // Check for new badges in background
      await checkBadges()

      // Fetch unseen badges to show modal
      await fetchUnseenBadges()
      console.log('[Badges] Badge check complete')
    }

    initializeBadges()
  }, [user])

  // Realtime subscription for new badges
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`badges-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_badges',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchUnseenBadges()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  return {
    unseenBadges,
    loading,
    markAsSeen,
    markAllAsSeen,
    hasUnseen: unseenBadges.length > 0,
  }
}
