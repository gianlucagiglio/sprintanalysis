import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'

interface TeamHealthScoreProps {
  score: number // 0-100
  trend: 'up' | 'down' | 'stable'
  details: {
    sentiment: number // 0-100
    engagement: number // 0-100
    actionCompletion: number // 0-100
  }
}

export function TeamHealthScore({ score, trend, details }: TeamHealthScoreProps) {
  // Determina colore in base allo score
  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', label: 'Ottimo' }
    if (score >= 60) return { text: 'text-amber-600', label: 'Buono' }
    if (score >= 40) return { text: 'text-orange-600', label: 'Attenzione' }
    return { text: 'text-red-600', label: 'Critico' }
  }

  const { text, label } = getScoreColor(score)

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'

  // Calcola circonferenza per SVG circle
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <Card className="!p-6 !rounded-2xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-retro-text mb-1">
            Team Health Score
          </h3>
          <p className="text-sm text-retro-text-secondary">
            Metrica composita di salute del team
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50`}>
          <TrendIcon size={14} className={trendColor} />
          <span className={`text-xs font-semibold ${trendColor}`}>
            {trend === 'up' ? '+5%' : trend === 'down' ? '-3%' : '0%'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {/* Gauge Chart */}
        <div className="relative">
          <svg width="180" height="180" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="#e2e8f0"
              strokeWidth="12"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="90"
              cy="90"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444' }} />
                <stop offset="100%" style={{ stopColor: score >= 80 ? '#14b8a6' : score >= 60 ? '#f97316' : score >= 40 ? '#ef4444' : '#f43f5e' }} />
              </linearGradient>
            </defs>
          </svg>
          {/* Score in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-4xl font-bold ${text}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              {score}
            </motion.span>
            <span className="text-xs text-retro-text-secondary font-medium mt-1">
              {label}
            </span>
          </div>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-retro-text">Sentiment</span>
              <span className="text-sm font-bold text-retro-text">{details.sentiment}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${details.sentiment}%` }}
                transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-retro-text">Engagement</span>
              <span className="text-sm font-bold text-retro-text">{details.engagement}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${details.engagement}%` }}
                transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-retro-text">Completamento Azioni</span>
              <span className="text-sm font-bold text-retro-text">{details.actionCompletion}%</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${details.actionCompletion}%` }}
                transition={{ delay: 0.6, duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
