import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@/types/database'

export type SessionWithTheme = Pick<Session, 'id' | 'title' | 'created_at' | 'quiz_theme_id'>

export type QuizThemeUsage = {
  [themeId: string]: SessionWithTheme[]
}

export function useQuizThemeUsage() {
  const [usage, setUsage] = useState<QuizThemeUsage>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, title, created_at, quiz_theme_id')
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
    }
  }, [])

  return { usage, loading }
}
