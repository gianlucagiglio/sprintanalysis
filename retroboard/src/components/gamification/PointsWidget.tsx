import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Trophy, TrendingUp, RefreshCw } from 'lucide-react'
import { useGamification } from '@/hooks/useGamification'
import { getLevelProgress, getNextLevelPoints } from '@/types/gamification'
import { motion } from 'framer-motion'

interface PointsWidgetProps {
  teamId?: string | null
  compact?: boolean
}

export function PointsWidget({ teamId, compact = false }: PointsWidgetProps) {
  const { userPoints, loading, refetch } = useGamification(teamId)
  const [showGlow, setShowGlow] = useState(false)

  // Flash glow when points increase
  useEffect(() => {
    if (userPoints && userPoints.points > 0) {
      setShowGlow(true)
      const timer = setTimeout(() => setShowGlow(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [userPoints?.points])

  if (loading) {
    return (
      <Card className="!p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-8 bg-slate-200 rounded" />
        </div>
      </Card>
    )
  }

  if (!userPoints) return null

  const progress = getLevelProgress(userPoints.points)
  const nextLevelPoints = getNextLevelPoints(userPoints.points)
  const pointsToNext = nextLevelPoints - userPoints.points

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full border border-amber-200">
        <Trophy size={14} className="text-amber-600" />
        <span className="text-xs font-bold font-mono text-amber-900">
          Lv{userPoints.level}
        </span>
        <span className="text-xs text-amber-600">•</span>
        <span className={`text-xs font-semibold font-mono text-amber-700 ${showGlow ? 'animate-pulse-glow' : ''}`}>
          {userPoints.points} pt
        </span>
      </div>
    )
  }

  return (
    <Card className="!p-5 !rounded-2xl bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-amber-900">
                Livello {userPoints.level}
              </p>
              <p className="text-xs text-amber-600">
                <span className={`font-mono ${showGlow ? 'animate-pulse-glow' : ''}`}>
                  {userPoints.points.toLocaleString()}
                </span> punti
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
            title="Ricarica punti"
          >
            <RefreshCw size={16} />
          </button>
          <Badge variant="default" className="!bg-amber-100 !text-amber-700 !border-amber-300 !font-mono">
            <TrendingUp size={12} className="mr-1" />
            {pointsToNext} per Lv{userPoints.level + 1}
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-amber-600 font-medium">
            Progresso livello
          </span>
          <span className="text-amber-900 font-bold font-mono">{progress}%</span>
        </div>
        <div className="h-3 bg-amber-100 rounded-full overflow-hidden shadow-inner">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 rounded-full shadow-lg"
          />
        </div>
      </div>
    </Card>
  )
}
