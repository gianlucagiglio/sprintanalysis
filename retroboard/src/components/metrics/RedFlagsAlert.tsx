import { Card } from '@/components/ui/Card'
import { AlertTriangle, TrendingDown, Users, Clock, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export interface RedFlag {
  id: string
  type: 'sentiment_drop' | 'low_participation' | 'stagnant_actions' | 'team_at_risk'
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  teamName?: string
  value?: string
}

interface RedFlagsAlertProps {
  flags: RedFlag[]
}

export function RedFlagsAlert({ flags }: RedFlagsAlertProps) {
  if (flags.length === 0) {
    return (
      <Card className="!p-6 !rounded-2xl border-2 border-emerald-200 bg-emerald-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900">
              Tutto OK!
            </h3>
            <p className="text-sm text-emerald-700">
              Nessun problema rilevato nei tuoi team
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const getIcon = (type: RedFlag['type']) => {
    switch (type) {
      case 'sentiment_drop': return TrendingDown
      case 'low_participation': return Users
      case 'stagnant_actions': return Clock
      case 'team_at_risk': return XCircle
      default: return AlertTriangle
    }
  }

  const getSeverityStyle = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50/50',
          iconBg: 'bg-red-500',
          textColor: 'text-red-900',
          descColor: 'text-red-700',
        }
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: 'bg-amber-50/50',
          iconBg: 'bg-amber-500',
          textColor: 'text-amber-900',
          descColor: 'text-amber-700',
        }
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50/50',
          iconBg: 'bg-blue-500',
          textColor: 'text-blue-900',
          descColor: 'text-blue-700',
        }
    }
  }

  // Raggruppa per severity
  const criticalFlags = flags.filter(f => f.severity === 'critical')
  const warningFlags = flags.filter(f => f.severity === 'warning')

  return (
    <div className="space-y-4">
      {/* Header con conteggio */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
            <AlertTriangle size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-retro-text">
              Segnalazioni ({flags.length})
            </h3>
            <p className="text-sm text-retro-text-secondary">
              Situazioni che richiedono attenzione
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalFlags.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              {criticalFlags.length} Critici
            </span>
          )}
          {warningFlags.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">
              {warningFlags.length} Warning
            </span>
          )}
        </div>
      </div>

      {/* Lista flags */}
      <div className="space-y-3">
        {flags.map((flag, idx) => {
          const Icon = getIcon(flag.type)
          const style = getSeverityStyle(flag.severity)

          return (
            <motion.div
              key={flag.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
            >
              <Card className={`!p-4 !rounded-xl border-2 ${style.border} ${style.bg} hover:shadow-lg transition-shadow duration-200 cursor-pointer group`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${style.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className={`font-bold ${style.textColor} text-sm`}>
                        {flag.title}
                      </h4>
                      {flag.value && (
                        <span className={`font-mono text-sm font-bold ${style.textColor} flex-shrink-0`}>
                          {flag.value}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${style.descColor}`}>
                      {flag.description}
                    </p>
                    {flag.teamName && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/50 text-xs font-medium text-retro-text">
                          <Users size={12} />
                          {flag.teamName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
