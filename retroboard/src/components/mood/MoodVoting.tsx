import { useState } from 'react'
import { useMood } from '@/hooks/useMood'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion } from 'framer-motion'
import { Smile, Frown, Angry, Sparkles, Check } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

const moods = [
  { value: 'glad' as const, label: 'Contento', icon: Smile, color: 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400' },
  { value: 'sad' as const, label: 'Triste', icon: Frown, color: 'bg-amber-50 border-amber-300 text-amber-600 hover:bg-amber-100 hover:border-amber-400' },
  { value: 'mad' as const, label: 'Arrabbiato', icon: Angry, color: 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400' },
  { value: 'custom' as const, label: 'Personalizzato', icon: Sparkles, color: 'bg-indigo-50 border-indigo-300 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-400' },
]

interface MoodVotingProps {
  sessionId: string
}

export function MoodVoting({ sessionId }: MoodVotingProps) {
  const { submitMood, userMood, moodCounts } = useMood(sessionId)
  const [customLabel, setCustomLabel] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  const handleSelect = async (mood: 'glad' | 'sad' | 'mad' | 'custom') => {
    if (mood === 'custom') {
      setShowCustom(true)
      return
    }
    await submitMood(mood)
  }

  const handleCustomSubmit = async () => {
    if (!customLabel.trim()) return
    await submitMood('custom', customLabel.trim())
    setShowCustom(false)
  }

  const total = Object.values(moodCounts).reduce((a, b) => a + b, 0)

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <PageHeader
        variant="centered"
        title="Come ti senti oggi?"
        description="Seleziona il tuo stato d'animo per questo sprint"
        gradient="primary"
      />

      <div className="grid grid-cols-2 gap-3">
        {moods.map((mood) => (
          <motion.button
            key={mood.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(mood.value)}
            className={`p-6 rounded-2xl border-2 transition-all duration-200 ${mood.color}
              ${userMood?.mood === mood.value ? 'ring-2 ring-offset-2 ring-current' : ''}`}
          >
            <mood.icon size={40} className="mx-auto mb-2" />
            <div className="font-semibold text-sm">{mood.label}</div>
            {userMood?.mood === mood.value && (
              <div className="mt-1">
                <Check size={16} className="mx-auto" />
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {showCustom && (
        <Card>
          <div className="flex gap-2">
            <Input
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Descrivi il tuo mood..."
              autoFocus
            />
            <Button onClick={handleCustomSubmit} disabled={!customLabel.trim()}>
              <Check size={16} />
            </Button>
          </div>
        </Card>
      )}

      {userMood && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className="inline-flex items-center gap-2 text-sm text-retro-glad font-medium">
            <Check size={16} />
            Voto registrato{userMood.custom_label ? `: ${userMood.custom_label}` : ''}
          </Card>
        </motion.div>
      )}

      {total > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-retro-text mb-4">Risultati</h3>
          <div className="space-y-3">
            {[
              { label: 'Contento', count: moodCounts.glad, color: 'bg-retro-glad' },
              { label: 'Triste', count: moodCounts.sad, color: 'bg-retro-sad' },
              { label: 'Arrabbiato', count: moodCounts.mad, color: 'bg-retro-mad' },
              { label: 'Altro', count: moodCounts.custom, color: 'bg-retro-primary' },
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
