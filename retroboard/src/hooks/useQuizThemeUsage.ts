import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Session } from '@/types/database'

export type SessionWithTheme = Pick<Session, 'id' | 'title' | 'created_at' | 'quiz_theme_id'>

export type QuizThemeUsage = {
  [themeId: string]: SessionWithTheme[]
}

export function useQuizThemeUsage(teamId?: string | null) {
  const [usage, setUsage] = useState<QuizThemeUsage>({})
  const [loading, setLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) return

      try {
        // Get user's teams
        const { data: memberships } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id)

        const teamIds = memberships?.map(m => m.team_id) || []

        if (teamIds.length === 0) {
          setUsage({})
          setLoading(false)
          return
        }

        // Filter by specific team if provided
        const filteredTeamIds = teamId ? teamIds.filter(id => id === teamId) : teamIds

        if (filteredTeamIds.length === 0) {
          setUsage({})
          setLoading(false)
          return
        }

        // Fetch sessions filtered by team
        const { data, error } = await supabase
          .from('sessions')
          .select('id, title, created_at, quiz_theme_id')
          .in('team_id', filteredTeamIds)
          .not('quiz_theme_id', 'is', null)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Group sessions by theme
        const grouped: QuizThemeUsage = {}
        data?.forEach((session) => {
          const themeId = session.quiz_theme_id
          if (themeId) {
            if (!grouped[themeId]) {
              grouped[themeId] = []
            }
            grouped[themeId].push(session)
          }
        })

        setUsage(grouped)
      } catch (err) {
        console.error('Error fetching quiz theme usage:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()

    // Subscribe to changes
    const channel = supabase
      .channel('quiz_theme_usage')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        () => {
          fetchUsage()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
      supabase.removeChannel(channel)
    }
  }, [user, teamId])

  return { usage, loading }
}
