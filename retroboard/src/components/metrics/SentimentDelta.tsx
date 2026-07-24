import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { SentimentDeltaPoint } from '@/hooks/useMetrics'

interface SentimentDeltaProps {
  data: SentimentDeltaPoint[]
}

export function SentimentDelta({ data }: SentimentDeltaProps) {
  if (!data.length) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/80 flex items-center justify-center">
          <TrendingUp size={32} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-bold text-retro-text mb-2">Variazione tra Sessioni</h3>
        <p className="text-sm text-retro-text-secondary">
          Servono almeno 2 sessioni per calcolare le variazioni
        </p>
      </div>
    )
  }

  const chartData = data.map((d) => ({
    name: d.sessionTitle.length > 15 ? d.sessionTitle.slice(0, 15) + '...' : d.sessionTitle,
    delta: d.delta,
  }))

  const positiveCount = data.filter(d => d.delta > 0).length
  const negativeCount = data.filter(d => d.delta < 0).length
  const totalDelta = data.reduce((sum, d) => sum + d.delta, 0)
  const avgDelta = totalDelta / data.length

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            {avgDelta >= 0 ? (
              <TrendingUp size={20} className="text-white" />
            ) : (
              <TrendingDown size={20} className="text-white" />
            )}
          </div>
          <h3 className="text-lg font-bold text-retro-text">Variazione tra Sessioni</h3>
        </div>
        <p className="text-sm text-retro-text-secondary">
          Evoluzione del sentiment rispetto alla sessione precedente
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={14} className="text-emerald-600" />
            <p className="text-xs text-retro-text-secondary font-semibold">Miglioramenti</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{positiveCount}</p>
        </div>
        <div className="bg-gradient-to-br from-rose-50 to-orange-50 rounded-xl p-3 border border-rose-100">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={14} className="text-rose-600" />
            <p className="text-xs text-retro-text-secondary font-semibold">Peggioramenti</p>
          </div>
          <p className="text-2xl font-bold text-rose-600">{negativeCount}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
          <p className="text-xs text-retro-text-secondary mb-1 font-semibold">Delta Medio</p>
          <p className={`text-2xl font-bold ${avgDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {avgDelta > 0 ? '+' : ''}{avgDelta.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="gradientPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={1} />
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.9} />
            </linearGradient>
            <linearGradient id="gradientNegative" x1="0" y1="1" x2="0" y2="0">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={1} />
              <stop offset="95%" stopColor="#F97316" stopOpacity={0.9} />
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
            formatter={(value: number) => [value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2), 'Delta']}
            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
          />
          <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={2} />
          <Bar dataKey="delta" radius={[8, 8, 8, 8]}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.delta >= 0 ? 'url(#gradientPositive)' : 'url(#gradientNegative)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
