import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Timer, CheckCircle2, XCircle } from 'lucide-react'
import type { QuizQuestion as QuizQuestionType } from '@/types/database'

interface QuizQuestionProps {
  question: QuizQuestionType
  onAnswer: (choice: number, timeTaken: number) => void
  hasAnswered: boolean
}

export function QuizQuestion({ question, onAnswer, hasAnswered }: QuizQuestionProps) {
  const [timeLeft, setTimeLeft] = useState(10)
  const [selected, setSelected] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const startTime = useRef(Date.now())
  const answeredRef = useRef(false)

  const choices: string[] = typeof question.choices === 'string'
    ? JSON.parse(question.choices)
    : question.choices

  useEffect(() => {
    startTime.current = Date.now()
    answeredRef.current = false
    setTimeLeft(10)
    setSelected(null)
    setShowResult(false)
  }, [question.id])

  useEffect(() => {
    if (hasAnswered || showResult) return
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval)
          if (!answeredRef.current) {
            handleSelect(-1) // timeout
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [question.id, hasAnswered, showResult]) // eslint-disable-line

  const handleSelect = (choice: number) => {
    if (answeredRef.current || hasAnswered) return
    answeredRef.current = true
    const timeTaken = (Date.now() - startTime.current) / 1000
    setSelected(choice)
    setShowResult(true)
    onAnswer(choice, timeTaken)
  }

  const isCorrect = (idx: number) => idx === question.correct_choice
  const timerPercent = (timeLeft / 10) * 100

  const letterColors = [
    'bg-indigo-100 text-indigo-600',
    'bg-emerald-100 text-emerald-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
  ]

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Confetti particles when correct answer */}
      {showResult && selected === question.correct_choice && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: '50%', x: '50%', scale: 1 }}
              animate={{
                opacity: [1, 1, 0],
                y: `${Math.random() * 100}%`,
                x: `${Math.random() * 100}%`,
                rotate: Math.random() * 720 - 360,
                scale: [1, 1.5, 0.5],
              }}
              transition={{ duration: 1.5 + Math.random(), delay: i * 0.05 }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: ['#FCD34D', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'][Math.floor(Math.random() * 5)],
                left: '50%',
                top: '30%',
              }}
            />
          ))}
        </div>
      )}

      <div className="glass-card !p-4 rounded-2xl border-2 border-white/40 shadow-float">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className={`h-full rounded-full ${timeLeft > 3 ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500' : 'bg-gradient-to-r from-red-500 to-orange-500'}`}
              animate={{ width: `${timerPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <motion.div
            animate={timeLeft <= 3 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }}
            className={`flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${
              timeLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            <Timer size={16} strokeWidth={2.5} />
            <span className="font-mono">{timeLeft}s</span>
          </motion.div>
        </div>
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="text-lg md:text-xl font-heading font-bold text-slate-800 text-center px-4"
      >
        {question.question}
      </motion.h2>

      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice, idx) => {
          let bgClass = 'glass-card border-2 border-white/40 hover:border-indigo-400/60 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98]'
          let iconBg = letterColors[idx % letterColors.length]

          if (showResult) {
            if (isCorrect(idx)) {
              bgClass = 'bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 shadow-lg'
              iconBg = 'bg-emerald-500 text-white shadow-md'
            } else if (selected === idx) {
              bgClass = 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-400 animate-shake'
              iconBg = 'bg-red-500 text-white shadow-md'
            } else {
              bgClass = 'glass-card border-2 border-white/20 opacity-50'
            }
          }

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover={!showResult ? { scale: 1.02, y: -2 } : undefined}
              whileTap={!showResult ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(idx)}
              disabled={showResult || hasAnswered}
              className={`p-4 md:p-5 rounded-2xl text-left transition-all duration-200 min-h-[60px] ${bgClass}
                disabled:cursor-default`}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  animate={showResult && isCorrect(idx) ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${iconBg} flex items-center justify-center text-sm md:text-base font-bold shrink-0`}
                >
                  {String.fromCharCode(65 + idx)}
                </motion.span>
                <span className="text-sm md:text-base text-slate-800 font-medium flex-1">{choice}</span>
                {showResult && isCorrect(idx) && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 size={24} className="text-emerald-600" strokeWidth={2.5} />
                  </motion.div>
                )}
                {showResult && selected === idx && !isCorrect(idx) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <XCircle size={24} className="text-red-600" strokeWidth={2.5} />
                  </motion.div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`text-center font-bold p-5 rounded-2xl shadow-lg ${
            selected === question.correct_choice
              ? 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700 border-2 border-emerald-300'
              : 'bg-gradient-to-br from-red-100 to-rose-100 text-red-700 border-2 border-red-300'
          }`}
        >
          <motion.div
            animate={{ rotate: selected === question.correct_choice ? [0, 10, -10, 0] : [0, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
            className="text-3xl mb-2"
          >
            {selected === question.correct_choice ? '🎉' : '😅'}
          </motion.div>
          <p className="text-base md:text-lg">
            {selected === question.correct_choice ? 'Risposta corretta!' : 'Risposta sbagliata!'}
          </p>
        </motion.div>
      )}
    </div>
  )
}
