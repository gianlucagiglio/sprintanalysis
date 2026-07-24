import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import type { HappinessDataPoint } from '@/hooks/useMetrics'

interface HappinessTrendLineProps {
  data: HappinessDataPoint[]
}

export function HappinessTrendLine({ data }: HappinessTrendLineProps) {
  if (!data.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
          <TrendingUp size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-retro-text mb-2">Trend Felicità</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </div>
    )
  }

  const avg = data.reduce((sum, d) => sum + d.score, 0) / data.length
  const lastTwo = data.slice(-2)
  const trendPositive = lastTwo.length < 2 || lastTwo[1].score >= lastTwo[0].score

  const chartData = data.map((d) => ({
    name: d.sessionTitle.length > 15 ? d.sessionTitle.slice(0, 15) + '...' : d.sessionTitle,
    score: d.score,
  }))

  const TrendIcon = trendPositive ? TrendingUp : TrendingDown
  const trendColor = trendPositive ? 'text-emerald-500' : 'text-rose-500'
  const gradientId = trendPositive ? 'gradientPositive' : 'gradientNegative'

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <h3 className="text-lg font-bold text-retro-text">Trend Felicità</h3>
          </div>
          <p className="text-sm text-retro-text-secondary">
            Evoluzione del sentiment nel tempo
          </p>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-right"
        >
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-br ${trendPositive ? 'from-emerald-50 to-teal-50' : 'from-rose-50 to-orange-50'}`}>
            <TrendIcon size={18} className={trendColor} />
            <div>
              <p className="text-xs text-retro-text-secondary">Media</p>
              <p className={`text-xl font-bold ${trendColor}`}>
                {avg.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradientPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradientNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#64748B', fontSize: 12 }}
            angle={-20}
            textAnchor="end"
            height={70}
            stroke="#CBD5E1"
          />
          <YAxis
            domain={[0, 3]}
            ticks={[0, 1, 2, 3]}
            tick={{ fill: '#64748B', fontSize: 12 }}
            stroke="#CBD5E1"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '2px solid #E2E8F0',
              borderRadius: '16px',
              boxShadow: '0 12px 32px 0 rgb(0 0 0 / 0.15)',
              padding: '12px 16px',
            }}
            formatter={(value: number) => [value.toFixed(2), 'Score']}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
          />
          <ReferenceLine
            y={avg}
            stroke="#94A3B8"
            strokeDasharray="8 4"
            strokeWidth={2}
            label={{
              value: `Media: ${avg.toFixed(2)}`,
              fill: '#64748B',
              fontSize: 12,
              fontWeight: 600,
              position: 'insideTopRight',
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke={trendPositive ? '#10B981' : '#EF4444'}
            strokeWidth={3}
            fill={`url(#${gradientId})`}
            dot={{
              fill: trendPositive ? '#10B981' : '#EF4444',
              r: 5,
              strokeWidth: 2,
              stroke: '#FFFFFF',
            }}
            activeDot={{
              r: 7,
              strokeWidth: 3,
              stroke: '#FFFFFF',
              fill: trendPositive ? '#10B981' : '#EF4444',
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
