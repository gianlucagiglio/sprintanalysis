import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { BadgeDefinition, UserBadge } from '@/types/database'

export type UserBadgeWithDefinition = UserBadge & {
  badge: BadgeDefinition
}

export function useBadges() {
  const [allBadges, setAllBadges] = useState<BadgeDefinition[]>([])
  const [userBadges, setUserBadges] = useState<UserBadgeWithDefinition[]>([])
  const [unseenBadges, setUnseenBadges] = useState<UserBadgeWithDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  // Fetch all badge definitions
  const fetchAllBadges = useCallback(async () => {
    const { data, error } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('sort_order')

    if (error) {
      console.error('fetchAllBadges failed:', error)
      return
    }

    if (data) setAllBadges(data)
  }, [])

  // Fetch user's unlocked badges
  const fetchUserBadges = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badge_definitions(*)
      `)
      .eq('user_id', user.id)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('fetchUserBadges failed:', error)
      return
    }

    if (data) {
      const badges = data.map((ub) => ({
        ...ub,
        badge: ub.badge as unknown as BadgeDefinition,
      })) as UserBadgeWithDefinition[]

      setUserBadges(badges)
      setUnseenBadges(badges.filter((b) => !b.seen))
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    // Delay fetch to avoid thundering herd at login
    const timer = setTimeout(() => {
      fetchUserBadges()
      // Fetch all badges only if needed (lazy)
      if (allBadges.length === 0) {
        fetchAllBadges()
      }
    }, 500)

    return () => clearTimeout(timer)
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
        () => fetchUserBadges()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchUserBadges])

  // Mark badge as seen
  const markBadgeSeen = async (badgeId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('user_badges')
      .update({ seen: true })
      .eq('id', badgeId)
      .eq('user_id', user.id)

    if (error) {
      console.error('markBadgeSeen failed:', error)
    } else {
      await fetchUserBadges()
    }
  }

  // Mark all badges as seen
  const markAllBadgesSeen = async () => {
    if (!user) return

    const { error } = await supabase
      .from('user_badges')
      .update({ seen: true })
      .eq('user_id', user.id)
      .eq('seen', false)

    if (error) {
      console.error('markAllBadgesSeen failed:', error)
    } else {
      await fetchUserBadges()
    }
  }

  // Get locked badges (not yet unlocked)
  const lockedBadges = allBadges.filter(
    (badge) => !userBadges.find((ub) => ub.badge_code === badge.code)
  )

  // Check if user has a specific badge
  const hasBadge = (badgeCode: string) => {
    return userBadges.some((ub) => ub.badge_code === badgeCode)
  }

  return {
    allBadges,
    userBadges,
    lockedBadges,
    unseenBadges,
    loading,
    hasBadge,
    markBadgeSeen,
    markAllBadgesSeen,
    refetch: () => {
      fetchAllBadges()
      fetchUserBadges()
    },
  }
}
