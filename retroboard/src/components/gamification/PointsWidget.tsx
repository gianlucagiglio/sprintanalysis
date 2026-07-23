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
    <Card
      className="!p-8 !rounded-3xl bg-glass-vibrant-yellow border-4 border-white vibrant-block"
      style={{ boxShadow: 'var(--block-shadow)' }}
    >
      <div className="flex items-start justify-between mb-8" style={{ gap: 'var(--block-gap)' }}>
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border-4 border-white">
              <Trophy size={28} className="text-glass-vibrant-yellow" />
            </div>
            <div>
              <p className="text-4xl font-display font-bold text-white tracking-tight">
                Livello {userPoints.level}
              </p>
              <p className="text-sm font-heading font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                <span className={`font-mono ${showGlow ? 'vibrant-bounce' : ''}`}>
                  {userPoints.points.toLocaleString()}
                </span> punti
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            aria-label="Ricarica punti"
            className="p-3 rounded-xl bg-white/30 hover:bg-white/50 text-white transition-all hover:scale-105 border-2 border-white/40 min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            title="Ricarica punti"
            style={{ transition: 'var(--transition-vibrant)' }}
          >
            <RefreshCw size={18} />
          </button>
          <Badge
            variant="default"
            className="!bg-white !text-glass-vibrant-yellow !border-4 !border-white/50 !font-mono !px-4 !py-2 !text-sm font-bold shadow-lg"
          >
            <TrendingUp size={14} className="mr-1" />
            {pointsToNext} per Lv{userPoints.level + 1}
          </Badge>
        </div>
      </div>

      {/* Progress Bar - Vibrant Style */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-heading font-semibold text-sm">
            Progresso livello
          </span>
          <span className="text-white font-display font-bold text-lg">{progress}%</span>
        </div>
        <div className="h-4 bg-white/30 rounded-2xl overflow-hidden shadow-inner border-2 border-white/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            className="h-full bg-white rounded-2xl shadow-lg"
          />
        </div>
      </div>
    </Card>
  )
}
