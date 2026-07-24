import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingDown } from 'lucide-react'

interface ActionFunnelProps {
  data: {
    totalComments: number
    votedComments: number
    discussedComments: number
    actionsCreated: number
    actionsCompleted: number
  }
}

export function ActionFunnel({ data }: ActionFunnelProps) {
  // Empty state se non ci sono dati
  if (data.totalComments === 0) {
    return (
      <Card className="!p-6 !rounded-2xl">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-retro-text mb-1">
            Funnel di Conversione
          </h3>
          <p className="text-sm text-retro-text-secondary">
            Da commenti a azioni completate
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <TrendingDown size={32} className="text-retro-text-secondary" />
          </div>
          <p className="text-sm text-retro-text-secondary">
            Nessun dato disponibile
          </p>
        </div>
      </Card>
    )
  }

  const stages = [
    {
      label: 'Commenti Scritti',
      value: data.totalComments,
      color: 'from-slate-500 to-slate-600',
      icon: '💬'
    },
    {
      label: 'Votati dal Team',
      value: data.votedComments,
      color: 'from-indigo-500 to-indigo-600',
      icon: '👍'
    },
    {
      label: 'Discussi',
      value: data.discussedComments,
      color: 'from-blue-500 to-blue-600',
      icon: '💭'
    },
    {
      label: 'Azioni Create',
      value: data.actionsCreated,
      color: 'from-emerald-500 to-emerald-600',
      icon: '✓'
    },
    {
      label: 'Completate',
      value: data.actionsCompleted,
      color: 'from-green-600 to-green-700',
      icon: '✓✓'
    },
  ]

  const maxValue = data.totalComments

  // Calcola conversion rates
  const conversionRates = [
    null,
    data.totalComments > 0 ? ((data.votedComments / data.totalComments) * 100).toFixed(0) : '0',
    data.votedComments > 0 ? ((data.discussedComments / data.votedComments) * 100).toFixed(0) : '0',
    data.discussedComments > 0 ? ((data.actionsCreated / data.discussedComments) * 100).toFixed(0) : '0',
    data.actionsCreated > 0 ? ((data.actionsCompleted / data.actionsCreated) * 100).toFixed(0) : '0',
  ]

  return (
    <Card className="!p-6 !rounded-2xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-retro-text mb-1">
          Funnel di Conversione
        </h3>
        <p className="text-sm text-retro-text-secondary">
          Da commenti a azioni completate
        </p>
      </div>

      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const percentage = (stage.value / maxValue) * 100
          const displayWidth = Math.max(percentage, 15) // Minimo 15% per visibilità

          return (
            <div key={stage.label} className="space-y-1.5">
              {/* Label + Conversion Rate */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{stage.icon}</span>
                  <span className="text-sm font-medium text-retro-text">
                    {stage.label}
                  </span>
                </div>
                {idx > 0 && (
                  <div className="flex items-center gap-1.5">
                    <ArrowRight size={14} className="text-retro-text-secondary" />
                    <span className="text-xs font-semibold text-retro-primary">
                      {conversionRates[idx]}%
                    </span>
                  </div>
                )}
              </div>

              {/* Barra */}
              <div className="relative h-14 bg-slate-100 rounded-xl overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayWidth}%` }}
                  transition={{ delay: idx * 0.1, duration: 0.8, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 bg-gradient-to-r ${stage.color} rounded-xl`}
                />

                {/* Contenuto barra */}
                <div className="relative h-full flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-retro-text">
                      {stage.value}
                    </span>
                    <span className="text-xs text-retro-text-secondary">
                      {percentage.toFixed(0)}% del totale
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Overall conversion rate */}
      <div className="mt-8 pt-6 border-t-2 border-slate-200">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-retro-text-secondary mb-1">
                Conversione Totale
              </p>
              <p className="text-xs text-retro-text-secondary">
                Da primo commento a azione completata
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {data.totalComments > 0
                    ? ((data.actionsCompleted / data.totalComments) * 100).toFixed(1)
                    : '0.0'
                  }%
                </span>
              </div>
              <p className="text-xs text-retro-text-secondary mt-1">
                {data.actionsCompleted} su {data.totalComments} commenti
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
