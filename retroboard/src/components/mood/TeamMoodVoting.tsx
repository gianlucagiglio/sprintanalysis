import { useTeamMood } from '@/hooks/useTeamMood'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const teamMoods = [
  { value: 'ottima' as const, label: 'Ottima', emoji: '🤝💚', color: 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400' },
  { value: 'buona' as const, label: 'Buona', emoji: '🤝💙', color: 'bg-sky-50 border-sky-300 text-sky-600 hover:bg-sky-100 hover:border-sky-400' },
  { value: 'sufficiente' as const, label: 'Sufficiente', emoji: '🤝⚠️', color: 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 hover:border-amber-400' },
  { value: 'scarsa' as const, label: 'Scarsa', emoji: '🤝❌', color: 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400' },
]

interface TeamMoodVotingProps {
  sessionId: string
}

export function TeamMoodVoting({ sessionId }: TeamMoodVotingProps) {
  const { submitTeamMood, userTeamMood, teamMoodCounts } = useTeamMood(sessionId)

  const handleSelect = async (mood: 'ottima' | 'buona' | 'sufficiente' | 'scarsa') => {
    await submitTeamMood(mood)
  }

  const total = Object.values(teamMoodCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-retro-text mb-2">Come valuti la collaborazione nel team?</h2>
        <p className="text-sm text-retro-text-secondary">Valuta il livello di collaborazione di questo sprint</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {teamMoods.map((mood) => (
          <motion.button
            key={mood.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(mood.value)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 ${mood.color}
              ${userTeamMood?.mood === mood.value ? 'ring-2 ring-offset-2 ring-current' : ''}`}
          >
            <div className="text-4xl mb-2">{mood.emoji}</div>
            <div className="font-semibold text-sm">{mood.label}</div>
            {userTeamMood?.mood === mood.value && (
              <div className="mt-1">
                <Check size={16} className="mx-auto" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {userTeamMood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="inline-flex items-center gap-2 text-sm text-retro-glad font-medium">
            <Check size={16} />
            Voto registrato
          </Card>
        </motion.div>
      )}

      {total > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-retro-text mb-4">Risultati</h3>
          <div className="space-y-3">
            {[
              { label: 'Ottima', count: teamMoodCounts.ottima, color: 'bg-emerald-500' },
              { label: 'Buona', count: teamMoodCounts.buona, color: 'bg-sky-500' },
              { label: 'Sufficiente', count: teamMoodCounts.sufficiente, color: 'bg-amber-500' },
              { label: 'Scarsa', count: teamMoodCounts.scarsa, color: 'bg-red-500' },
            ].map((item) => {
              const percent = total > 0 ? Math.round((item.count / total) * 100) : 0
              return (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-retro-text-secondary w-20">{item.label}</span>
                  <div className="flex-1 h-6 bg-retro-sidebar rounded-xl overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className={`h-full ${item.color} rounded-xl flex items-center justify-end`}
                      transition={{ duration: 0.5 }}
                    >
                      {percent > 15 && (
                        <span className="text-[10px] font-bold text-white pr-2">{percent}%</span>
                      )}
                    </motion.div>
                  </div>
                  <span className="text-xs font-semibold text-retro-text w-6 text-right">{item.count}</span>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
