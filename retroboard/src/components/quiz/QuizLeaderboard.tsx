import { Card } from '@/components/ui/Card'
import { Trophy } from 'lucide-react'
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
  'bg-gradient-to-br from-amber-100 via-yellow-100 to-amber-50 border-2 border-amber-300 shadow-lg',
  'bg-gradient-to-br from-slate-200 via-gray-200 to-slate-100 border-2 border-slate-300 shadow-md',
  'bg-gradient-to-br from-orange-100 via-amber-100 to-orange-50 border-2 border-orange-300 shadow-md',
]

export function QuizLeaderboard({ leaderboard }: QuizLeaderboardProps) {
  const participants = useSessionStore((s) => s.participants)

  const getName = (userId: string) =>
    participants.find((p) => p.user_id === userId)?.profiles?.name || 'Utente'

  const podiumIcons = ['🥇', '🥈', '🥉']

  return (
    <Card className="max-w-md mx-auto !p-5 md:!p-7 glass-card border-2 border-white/40 shadow-float">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-5"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md"
        >
          <Trophy size={20} className="text-white" strokeWidth={2.5} />
        </motion.div>
        <h3 className="font-heading font-bold text-lg text-slate-800">Classifica</h3>
      </motion.div>
      {leaderboard.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-3 shadow-sm">
            <Trophy size={28} className="text-slate-400" />
          </div>
          <p className="text-sm text-slate-600 font-medium">Nessuna risposta ancora</p>
          <p className="text-xs text-slate-500 mt-1">Sii il primo a rispondere!</p>
        </motion.div>
      ) : (
        <div className="space-y-2.5">
          {leaderboard.map((entry, i) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -30, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                delay: i * 0.12,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1]
              }}
              whileHover={i < 3 ? { scale: 1.03, y: -2 } : { scale: 1.01 }}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                i < 3 ? podiumStyles[i] : 'bg-white/60 hover:bg-white/80 border border-slate-200 shadow-sm'
              }`}
            >
              <motion.div
                animate={i === 0 ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="w-10 h-10 flex items-center justify-center shrink-0"
              >
                {i < 3 ? (
                  <span className="text-2xl">{podiumIcons[i]}</span>
                ) : (
                  <span className="text-sm text-slate-600 font-bold bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center">
                    {i + 1}
                  </span>
                )}
              </motion.div>
              <span className={`text-sm md:text-base flex-1 ${i < 3 ? 'font-bold' : 'font-medium'} text-slate-800`}>
                {getName(entry.userId)}
              </span>
              <motion.span
                animate={i === 0 ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 1.5 }}
                className={`font-mono font-bold px-3 py-1.5 rounded-lg ${
                  i === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white shadow-md'
                  : i === 1 ? 'bg-gradient-to-r from-slate-400 to-gray-500 text-white shadow-sm'
                  : i === 2 ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-sm'
                  : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {entry.totalPoints} pt
              </motion.span>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  )
}
