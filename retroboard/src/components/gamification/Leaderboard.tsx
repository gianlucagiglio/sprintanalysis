import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'
import { Trophy, Medal, Crown } from 'lucide-react'
import type { UserPoints, Profile } from '@/types/database'

type LeaderboardEntry = UserPoints & {
  profile: Profile
}

interface LeaderboardProps {
  teamId?: string | null
  limit?: number
}

export function Leaderboard({ teamId, limit = 10 }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [teamId])

  const fetchLeaderboard = async () => {
    let query = supabase
      .from('user_points')
      .select(`
        *,
        profile:profiles(*)
      `)
      .order('points', { ascending: false })
      .limit(limit)

    if (teamId) {
      query = query.eq('team_id', teamId)
    } else {
      query = query.is('team_id', null)
    }

    const { data, error } = await query

    if (error) {
      console.error('fetchLeaderboard failed:', error)
      setLoading(false)
      return
    }

    if (data) {
      setEntries(
        data.map((entry) => ({
          ...entry,
          profile: entry.profile as unknown as Profile,
        }))
      )
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <Card className="!p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-10 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-200 rounded" />
          <div className="h-10 bg-slate-200 rounded" />
        </div>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card className="!p-5 !rounded-2xl">
        <h3 className="text-sm font-semibold text-retro-text mb-3 flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" />
          Classifica
        </h3>
        <p className="text-sm text-retro-text-secondary text-center py-6">
          Nessun dato disponibile
        </p>
      </Card>
    )
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-500" />
    if (rank === 2) return <Medal size={18} className="text-gray-400" />
    if (rank === 3) return <Medal size={18} className="text-amber-600" />
    return <span className="text-sm font-bold font-mono text-retro-text-secondary">{rank}</span>
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-50 to-amber-50 border-yellow-300'
    if (rank === 2) return 'from-gray-50 to-slate-50 border-gray-300'
    if (rank === 3) return 'from-amber-50 to-orange-50 border-amber-300'
    return 'from-slate-50 to-gray-50 border-slate-200'
  }

  return (
    <Card className="!p-5 !rounded-2xl">
      <h3 className="text-sm font-semibold text-retro-text mb-4 flex items-center gap-2">
        <Trophy size={16} className="text-yellow-500" />
        Classifica
      </h3>

      <div className="space-y-2">
        {entries.map((entry, index) => {
          const rank = index + 1
          const isTopThree = rank <= 3

          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                isTopThree
                  ? `bg-gradient-to-r ${getRankColor(rank)} shadow-md`
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-white border-2 border-current flex items-center justify-center shrink-0">
                {getRankIcon(rank)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-retro-text truncate">
                  {entry.profile?.name || 'Utente'}
                </p>
                <p className="text-xs text-retro-text-secondary">
                  Livello <span className="font-mono">{entry.level}</span>
                </p>
              </div>

              <Badge
                variant={isTopThree ? 'primary' : 'default'}
                className={`${isTopThree ? '!bg-white !text-retro-text !border-current' : ''} !font-mono`}
              >
                <Trophy size={12} className="mr-1" />
                {entry.points.toLocaleString()}
              </Badge>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
