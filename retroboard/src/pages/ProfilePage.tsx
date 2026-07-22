import { AppLayout } from '@/components/layout/AppLayout'
import { PointsWidget } from '@/components/gamification/PointsWidget'
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { useGamification } from '@/hooks/useGamification'
import { useBadges } from '@/hooks/useBadges'
import { Card } from '@/components/ui/Card'
import { User, TrendingUp, MessageSquare, CheckCircle2, Zap } from 'lucide-react'

export function ProfilePage() {
  const { userPoints, recentTransactions } = useGamification()
  const { userBadges } = useBadges()

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-retro-text flex items-center gap-2">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <User size={20} className="text-white" />
            </span>
            Il Mio Profilo
          </h1>
          <p className="text-sm text-retro-text-secondary mt-1">
            Progressi, badge e statistiche personali
          </p>
        </div>

        {/* Points & Level */}
        <PointsWidget />

        {/* Badges */}
        <BadgeShowcase />

        {/* Stats & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="!p-5 !rounded-2xl">
            <h3 className="text-sm font-semibold text-retro-text mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              Attività Recente
            </h3>

            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.slice(0, 8).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      {getActionIcon(transaction.action_type)}
                      <div>
                        <p className="text-xs font-medium text-retro-text">
                          {transaction.description}
                        </p>
                        <p className="text-[10px] text-retro-text-secondary">
                          {new Date(transaction.created_at).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-600">
                      +{transaction.points}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-retro-text-secondary text-center py-6">
                Nessuna attività recente
              </p>
            )}
          </Card>

          {/* Leaderboard */}
          <Leaderboard limit={8} />
        </div>

        {/* Quick Stats */}
        <Card className="!p-5 !rounded-2xl">
          <h3 className="text-sm font-semibold text-retro-text mb-4">
            Statistiche Veloci
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<User size={20} className="text-indigo-500" />}
              label="Punti Totali"
              value={userPoints?.points.toLocaleString() || '0'}
              color="bg-indigo-50"
            />
            <StatCard
              icon={<TrendingUp size={20} className="text-emerald-500" />}
              label="Livello"
              value={userPoints?.level.toString() || '1'}
              color="bg-emerald-50"
            />
            <StatCard
              icon={<Zap size={20} className="text-amber-500" />}
              label="Badge"
              value={userBadges.length.toString()}
              color="bg-amber-50"
            />
            <StatCard
              icon={<CheckCircle2 size={20} className="text-rose-500" />}
              label="Attività"
              value={recentTransactions.length.toString()}
              color="bg-rose-50"
            />
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className={`p-4 rounded-xl ${color}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs text-retro-text-secondary font-medium">{label}</p>
      </div>
      <p className="text-2xl font-bold text-retro-text">{value}</p>
    </div>
  )
}

function getActionIcon(actionType: string) {
  const icons: Record<string, React.ReactNode> = {
    participate: <User size={14} className="text-indigo-500" />,
    comment: <MessageSquare size={14} className="text-emerald-500" />,
    vote: <TrendingUp size={14} className="text-rose-500" />,
    action_complete: <CheckCircle2 size={14} className="text-amber-500" />,
    quiz_win: <Zap size={14} className="text-purple-500" />,
  }
  return icons[actionType] || <Zap size={14} className="text-slate-500" />
}
