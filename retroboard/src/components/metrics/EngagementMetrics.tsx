import { Card } from '@/components/ui/Card'
import { Users, MessageSquare, Clock, Target } from 'lucide-react'
import { motion } from 'framer-motion'

interface EngagementMetricsProps {
  participationRate: number // 0-100
  commentsPerPerson: number
  avgSessionDuration: number // minuti
  silentParticipants: number // percentuale
}

export function EngagementMetrics({
  participationRate,
  commentsPerPerson,
  avgSessionDuration,
  silentParticipants
}: EngagementMetricsProps) {
  const metrics = [
    {
      label: 'Tasso Partecipazione',
      value: `${participationRate}%`,
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      status: participationRate >= 75 ? 'good' : participationRate >= 50 ? 'warning' : 'bad',
    },
    {
      label: 'Commenti per Persona',
      value: commentsPerPerson.toFixed(1),
      icon: MessageSquare,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      status: commentsPerPerson >= 3 ? 'good' : commentsPerPerson >= 1.5 ? 'warning' : 'bad',
    },
    {
      label: 'Durata Media Sessione',
      value: `${avgSessionDuration}min`,
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      status: avgSessionDuration <= 60 && avgSessionDuration >= 30 ? 'good' : 'warning',
    },
    {
      label: 'Partecipanti Silenziosi',
      value: `${silentParticipants}%`,
      icon: Target,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-600',
      status: silentParticipants <= 20 ? 'good' : silentParticipants <= 40 ? 'warning' : 'bad',
      inverted: true, // Lower is better
    },
  ]

  const getStatusBadge = (status: string) => {
    if (status === 'good') {
      return <div className="w-2 h-2 rounded-full bg-emerald-500" />
    }
    if (status === 'warning') {
      return <div className="w-2 h-2 rounded-full bg-amber-500" />
    }
    return <div className="w-2 h-2 rounded-full bg-red-500" />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
          >
            <Card className="!p-5 !rounded-2xl hover:scale-[1.02] transition-transform duration-200 cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${metric.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={20} className={metric.iconColor} />
                </div>
                {getStatusBadge(metric.status)}
              </div>
              <p className="text-sm text-retro-text-secondary font-medium mb-1">
                {metric.label}
              </p>
              <p className={`text-3xl font-bold font-display bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                {metric.value}
              </p>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
