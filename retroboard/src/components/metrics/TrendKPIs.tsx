import { Card } from '@/components/ui/Card'
import { TrendingUp, TrendingDown, Minus, Users, BarChart3, CheckCircle2 } from 'lucide-react'
import type { TrendKPIs as TrendKPIsType } from '@/hooks/useMetrics'

interface TrendKPIsProps {
  kpis: TrendKPIsType
}

export function TrendKPIs({ kpis }: TrendKPIsProps) {
  const trendIcon =
    kpis.trend === 'up' ? <TrendingUp size={16} className="text-emerald-500" /> :
    kpis.trend === 'down' ? <TrendingDown size={16} className="text-rose-500" /> :
    <Minus size={16} className="text-retro-text-secondary" />

  const trendColor =
    kpis.trend === 'up' ? 'text-emerald-500' :
    kpis.trend === 'down' ? 'text-rose-500' :
    'text-retro-text-secondary'

  const cards = [
    {
      label: 'Felicita\u0300 media',
      value: kpis.averageScore.toFixed(1),
      subtitle: (
        <span className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          {trendIcon}
          {kpis.deltaPercent > 0 ? '+' : ''}{kpis.deltaPercent}%
        </span>
      ),
      icon: <TrendingUp size={18} className="text-retro-primary" />,
    },
    {
      label: 'Sessioni totali',
      value: kpis.totalSessions,
      subtitle: null,
      icon: <BarChart3 size={18} className="text-retro-primary" />,
    },
    {
      label: 'Partecipanti unici',
      value: kpis.uniqueParticipants,
      subtitle: null,
      icon: <Users size={18} className="text-retro-primary" />,
    },
    {
      label: 'Tasso risoluzioni',
      value: `${kpis.resolutionRate}%`,
      subtitle: null,
      icon: <CheckCircle2 size={18} className="text-retro-primary" />,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="!p-4 !rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-retro-text-secondary">{card.label}</span>
            <div className="w-8 h-8 rounded-xl bg-retro-primary/10 flex items-center justify-center">
              {card.icon}
            </div>
          </div>
          <p className="text-2xl font-bold text-retro-text">{card.value}</p>
          {card.subtitle && <div className="mt-1">{card.subtitle}</div>}
        </Card>
      ))}
    </div>
  )
}
