import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'

export function QuizThemeDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      try {
        // 1. Check if column exists by trying to select it
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('id, title, quiz_theme_id, created_at')
          .order('created_at', { ascending: false })
          .limit(10)

        // 2. Count sessions with theme
        const { count: withTheme } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .not('quiz_theme_id', 'is', null)

        // 3. Count total sessions
        const { count: total } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })

        setDebugInfo({
          columnExists: !sessionsError,
          error: sessionsError?.message,
          totalSessions: total || 0,
          sessionsWithTheme: withTheme || 0,
          recentSessions: sessions || [],
        })
      } catch (err: any) {
        setDebugInfo({
          columnExists: false,
          error: err.message,
        })
      } finally {
        setLoading(false)
      }
    }

    checkDatabase()
  }, [])

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-sm text-retro-text-secondary">Loading debug info...</div>
      </Card>
    )
  }

  return (
    <Card className="p-4 bg-amber-50 border-amber-200">
      <h3 className="font-bold text-retro-text mb-3">🔍 Quiz Theme Debug</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Column exists:</strong>{' '}
          {debugInfo?.columnExists ? (
            <span className="text-emerald-600">✓ Yes</span>
          ) : (
            <span className="text-red-600">✗ No - Run migration!</span>
          )}
        </div>
        {debugInfo?.error && (
          <div className="text-red-600">
            <strong>Error:</strong> {debugInfo.error}
          </div>
        )}
        <div>
          <strong>Total sessions:</strong> {debugInfo?.totalSessions}
        </div>
        <div>
          <strong>Sessions with theme:</strong> {debugInfo?.sessionsWithTheme}
        </div>
        {debugInfo?.recentSessions && debugInfo.recentSessions.length > 0 && (
          <div className="mt-3">
            <strong>Recent sessions:</strong>
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {debugInfo.recentSessions.map((s: any) => (
                <div key={s.id} className="text-xs bg-white rounded p-2">
                  <div className="font-medium truncate">{s.title}</div>
                  <div className="text-retro-text-secondary">
                    Theme: {s.quiz_theme_id || '(none)'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
