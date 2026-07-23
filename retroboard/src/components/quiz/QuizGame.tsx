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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="text-indigo-600" size={40} strokeWidth={2.5} />
        </motion.div>
        <p className="text-sm text-slate-600 font-medium">Caricamento quiz...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto text-center py-16 px-4"
      >
        <div className="glass-card !p-8 rounded-2xl border-2 border-white/40 shadow-float">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <HelpCircle size={32} className="text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-700 mb-2">Nessuna domanda quiz configurata</p>
          <p className="text-sm text-slate-500">Chiedi all'organizzatore di aggiungere delle domande</p>
        </div>
      </motion.div>
    )
  }

  // Start screen — quiz not yet started
  if (currentIndex < 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="max-w-md mx-auto text-center space-y-6 py-8 px-4"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
          className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-lg"
        >
          <Zap size={40} className="text-white" strokeWidth={2.5} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-heading font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Quiz time!
          </h2>
          <p className="text-base text-slate-600 font-medium">Preparatevi a rispondere alle domande</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-card !p-5 rounded-2xl border-2 border-white/40 shadow-float"
        >
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <HelpCircle size={24} className="text-indigo-600" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-slate-700">{questions.length} domande</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center">
                <Zap size={24} className="text-amber-600" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-bold text-slate-700">10s ciascuna</span>
            </div>
          </div>

          <div className="text-sm text-slate-700 space-y-2 border-t border-white/60 pt-4">
            <p className="font-medium">Rispondi correttamente e velocemente per ottenere il punteggio massimo!</p>
            <div className="flex items-center justify-center gap-2 text-xs">
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg font-bold">1000 pt base</span>
              <span className="text-slate-500">+</span>
              <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg font-bold">fino a 1000 pt velocità</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {isOrganizer ? (
            <Button
              onClick={advanceQuiz}
              size="lg"
              className="!bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !shadow-lg hover:!shadow-xl !border-0 !text-white"
            >
              <Play size={18} strokeWidth={2.5} />
              Inizia quiz
            </Button>
          ) : (
            <div className="glass-card !p-4 rounded-xl border border-white/40">
              <p className="text-sm text-slate-600 font-medium italic">
                ⏳ In attesa che l'host avvii il quiz...
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    )
  }

  if (isFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="space-y-6 max-w-lg mx-auto px-4 relative"
      >
        {/* Confetti particles */}
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: -20, x: `${Math.random() * 100}%` }}
              animate={{
                opacity: [1, 1, 0],
                y: ['0%', '120%'],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{ duration: 2.5 + Math.random() * 1.5, delay: Math.random() * 0.5, repeat: Infinity, repeatDelay: 3 }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#FCD34D', '#34D399', '#60A5FA', '#F472B6', '#A78BFA', '#FFFFFF'][Math.floor(Math.random() * 6)],
              }}
            />
          ))}
        </div>

        <div className="text-center relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl"
          >
            <PartyPopper size={48} className="text-white" strokeWidth={2.5} />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
          >
            Quiz completato!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base text-slate-600 font-medium mb-6"
          >
            🎉 Complimenti a tutti i partecipanti! 🎉
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="glass-card !p-4 rounded-xl border-2 border-white/40 inline-block mb-6"
          >
            <p className="text-sm text-slate-700 font-semibold">Ecco i risultati finali</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="relative z-10"
        >
          <QuizLeaderboard leaderboard={leaderboard} />
        </motion.div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6 px-4">
      {/* Visual progress bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto glass-card !p-4 rounded-2xl border-2 border-white/40 shadow-float"
      >
        <div className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
          <span>Domanda {currentIndex + 1} di {questions.length}</span>
          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-md text-xs">
            {Math.round(((currentIndex) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-sm"
            animate={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </div>
      </motion.div>

      {currentQuestion && (
        <QuizQuestion
          question={currentQuestion}
          onAnswer={handleAnswer}
          hasAnswered={hasAnswered(currentQuestion.id)}
        />
      )}

      {isOrganizer && currentQuestion && hasAnswered(currentQuestion.id) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <Button
            onClick={advanceQuiz}
            size="lg"
            className="!bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-700 hover:!to-purple-700 !shadow-lg hover:!shadow-xl !border-0 !text-white"
          >
            {currentIndex < questions.length - 1 ? (
              <>Prossima domanda <ChevronRight size={18} strokeWidth={2.5} /></>
            ) : (
              <>Vedi risultati <ChevronRight size={18} strokeWidth={2.5} /></>
            )}
          </Button>
        </motion.div>
      )}

      {!isOrganizer && currentQuestion && hasAnswered(currentQuestion.id) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="glass-card inline-block !px-5 !py-3 rounded-xl border border-white/40">
            <p className="text-sm text-slate-600 font-medium italic">
              ⏳ In attesa che l'host avanzi alla prossima domanda...
            </p>
          </div>
        </motion.div>
      )}

      {leaderboard.length > 0 && !isFinished && (
        <QuizLeaderboard leaderboard={leaderboard} />
      )}
    </div>
  )
}
