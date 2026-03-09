import { useQuiz } from '@/hooks/useQuiz'
import { useSession } from '@/hooks/useSession'
import { QuizQuestion } from './QuizQuestion'
import { QuizLeaderboard } from './QuizLeaderboard'
import { Button } from '@/components/ui/Button'
import { ChevronRight, PartyPopper } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuizGameProps {
  sessionId: string
}

export function QuizGame({ sessionId }: QuizGameProps) {
  const { session, isOrganizer, advanceQuiz } = useSession(sessionId)
  const {
    questions,
    submitAnswer,
    getLeaderboard,
    hasAnswered,
  } = useQuiz(sessionId)

  const currentIndex = session?.quiz_current_index ?? 0
  const currentQuestion = questions[currentIndex] || null
  const leaderboard = getLeaderboard()
  const isFinished = currentIndex >= questions.length && questions.length > 0

  const handleAnswer = async (choice: number, timeTaken: number) => {
    if (!currentQuestion) return
    await submitAnswer(currentQuestion.id, choice, timeTaken)
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 text-retro-text-secondary">
        <p>Nessuna domanda quiz configurata</p>
      </div>
    )
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6 max-w-lg mx-auto"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <PartyPopper size={64} className="text-retro-sad mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold text-retro-text mb-1">Quiz completato!</h2>
          <p className="text-sm text-retro-text-secondary">Ecco i risultati finali</p>
        </div>
        <QuizLeaderboard leaderboard={leaderboard} />
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Visual progress bar instead of just text */}
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between text-xs text-retro-text-secondary mb-1.5">
          <span>Domanda {currentIndex + 1} di {questions.length}</span>
          <span>{Math.round(((currentIndex) / questions.length) * 100)}%</span>
        </div>
        <div className="h-2 bg-retro-sidebar rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-retro-primary to-violet-500 rounded-full"
            animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {currentQuestion && (
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          hasAnswered={hasAnswered(currentQuestion.id)}
        />
      )}

      {isOrganizer && currentQuestion && hasAnswered(currentQuestion.id) && (
        <div className="text-center">
          <Button onClick={advanceQuiz}>
            {currentIndex < questions.length - 1 ? (
              <>Prossima domanda <ChevronRight size={16} /></>
            ) : (
              <>Vedi risultati <ChevronRight size={16} /></>
            )}
          </Button>
        </div>
      )}

      {!isOrganizer && currentQuestion && hasAnswered(currentQuestion.id) && (
        <div className="text-center text-sm text-retro-text-secondary italic">
          In attesa che l'host avanzi alla prossima domanda...
        </div>
      )}

      {leaderboard.length > 0 && !isFinished && (
        <QuizLeaderboard leaderboard={leaderboard} />
      )}
    </div>
  )
}
