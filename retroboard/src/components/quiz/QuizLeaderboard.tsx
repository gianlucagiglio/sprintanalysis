import { Card } from '@/components/ui/Card'
import { Trophy, Medal } from 'lucide-react'
import { useSessionStore } from '@/stores/sessionStore'
import { motion } from 'framer-motion'

interface LeaderboardEntry {
  userId: string
  totalPoints: number
}

interface QuizLeaderboardProps {
  leaderboard: LeaderboardEntry[]
}

const podiumStyles = [
  'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
  'bg-gradient-to-r from-slate-50 to-gray-50 border-gray-200',
  'bg-gradient-to-r from-orange-50 to-amber-50 border-amber-200',
]

export function QuizLeaderboard({ leaderboard }: QuizLeaderboardProps) {
  const participants = useSessionStore((s) => s.participants)

  const getName = (userId: string) =>
    participants.find((p) => p.user_id === userId)?.profiles?.name || 'Utente'

  const podiumColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

  return (
    <Card className="max-w-md mx-auto !p-4 md:!p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-yellow-500" />
        <h3 className="font-semibold text-retro-text">Classifica</h3>
      </div>
      {leaderboard.length === 0 ? (
        <p className="text-sm text-retro-text-secondary text-center py-4">
          Nessuna risposta ancora
        </p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                i < 3 ? `${podiumStyles[i]} border` : 'hover:bg-retro-sidebar'
              }`}
            >
              <div className="w-8 h-8 flex items-center justify-center">
                {i < 3 ? (
                  <Medal size={22} className={podiumColors[i]} />
                ) : (
                  <span className="text-sm text-retro-text-secondary font-medium">{i + 1}</span>
                )}
              </div>
              <span className="text-sm text-retro-text flex-1 font-medium">{getName(entry.userId)}</span>
              <span className="font-mono font-bold text-retro-primary">{entry.totalPoints} pt</span>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
