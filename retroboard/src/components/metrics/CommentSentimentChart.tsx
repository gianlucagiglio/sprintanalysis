import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MessageSquare } from 'lucide-react'
import type { CommentSentimentData } from '@/hooks/useMetrics'

interface CommentSentimentChartProps {
  data: CommentSentimentData[]
}

export function CommentSentimentChart({ data }: CommentSentimentChartProps) {
  if (!data.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
          <MessageSquare size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-retro-text mb-2">Sentiment Commenti</h3>
        <p className="text-sm text-retro-text-secondary">Nessun dato disponibile</p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.sessionTitle.length > 15 ? d.sessionTitle.slice(0, 15) + '...' : d.sessionTitle,
    Positivi: d.positive,
    Negativi: d.negative,
    Neutri: d.neutral,
  }))

  const totals = data.map(d => d.positive + d.negative + d.neutral)
  const totalPositive = data.reduce((sum, d) => sum + d.positive, 0)
  const totalNegative = data.reduce((sum, d) => sum + d.negative, 0)
  const totalNeutral = data.reduce((sum, d) => sum + d.neutral, 0)
  const total = totalPositive + totalNegative + totalNeutral

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <MessageSquare size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-retro-text">Sentiment Commenti</h3>
        </div>
        <p className="text-sm text-retro-text-secondary">
          Analisi del tono dei commenti per sessione
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
          <p className="text-xs text-retro-text-secondary mb-1">Positivi</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-emerald-600">{totalPositive}</p>
            <p className="text-xs text-emerald-600 font-semibold">
              {total > 0 ? Math.round((totalPositive / total) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-3 border border-rose-100">
          <p className="text-xs text-retro-text-secondary mb-1">Negativi</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-rose-600">{totalNegative}</p>
            <p className="text-xs text-rose-600 font-semibold">
              {total > 0 ? Math.round((totalNegative / total) * 100) : 0}%
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
          <p className="text-xs text-retro-text-secondary mb-1">Neutri</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-indigo-600">{totalNeutral}</p>
            <p className="text-xs text-indigo-600 font-semibold">
              {total > 0 ? Math.round((totalNeutral / total) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorPositivi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorNegativi" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorNeutri" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0.2} />
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
            allowDecimals={false}
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
            labelStyle={{ fontWeight: 600, marginBottom: '8px' }}
          />
          <Area
            type="monotone"
            dataKey="Positivi"
            stackId="1"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorPositivi)"
          />
          <Area
            type="monotone"
            dataKey="Negativi"
            stackId="1"
            stroke="#EF4444"
            strokeWidth={2}
            fill="url(#colorNegativi)"
          />
          <Area
            type="monotone"
            dataKey="Neutri"
            stackId="1"
            stroke="#6366F1"
            strokeWidth={2}
            fill="url(#colorNeutri)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
