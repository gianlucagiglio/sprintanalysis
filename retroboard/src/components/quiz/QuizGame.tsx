import { useQuiz } from '@/hooks/useQuiz'
import { useSession } from '@/hooks/useSession'
import { QuizQuestion } from './QuizQuestion'
import { QuizLeaderboard } from './QuizLeaderboard'
import { Button } from '@/components/ui/Button'
import { ChevronRight, PartyPopper, Loader2, Zap, HelpCircle, Play } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuizGameProps {
  sessionId: string
}

export function QuizGame({ sessionId }: QuizGameProps) {
  const { session, isOrganizer, advanceQuiz } = useSession(sessionId)
  const {
    questions,
    loading,
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="animate-spin text-retro-primary" size={32} />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-16 text-retro-text-secondary">
        <p>Nessuna domanda quiz configurata</p>
      </div>
    )
  }

  // Start screen — quiz not yet started
  if (currentIndex < 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center space-y-6 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        >
          <Zap size={48} className="text-retro-primary mx-auto" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-retro-text mb-2">Quiz time!</h2>
          <p className="text-sm text-retro-text-secondary">Preparatevi a rispondere alle domande</p>
        </div>
        <div className="flex items-center justify-center gap-6 text-sm text-retro-text-secondary">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={14} />
            <span>{questions.length} domande</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={14} />
            <span>10s per risposta</span>
          </div>
        </div>
        <div className="bg-retro-surface rounded-2xl p-4 text-xs text-retro-text-secondary space-y-1.5">
          <p>Rispondi correttamente e velocemente per ottenere il punteggio massimo.</p>
          <p>Punti: <strong>1000</strong> base + bonus velocita fino a <strong>1000</strong>.</p>
        </div>
        {isOrganizer ? (
          <Button onClick={advanceQuiz} className="mx-auto">
            <Play size={16} /> Inizia quiz
          </Button>
        ) : (
          <p className="text-sm text-retro-text-secondary italic">
            In attesa che l'host avvii il quiz...
          </p>
        )}
      </motion.div>
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
            <PartyPopper size={48} className="text-retro-sad mx-auto mb-3 md:mb-4" />
          </motion.div>
          <h2 className="text-xl md:text-2xl font-bold text-retro-text mb-1">Quiz completato!</h2>
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
