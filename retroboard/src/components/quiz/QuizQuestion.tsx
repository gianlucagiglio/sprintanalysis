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

  const choices: string[] = typeof question.choices === 'string'
    ? JSON.parse(question.choices)
    : question.choices

  useEffect(() => {
    startTime.current = Date.now()
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
          if (selected === null) {
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
    if (showResult || hasAnswered) return
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
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-retro-sidebar rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${timeLeft > 3 ? 'bg-gradient-to-r from-retro-primary to-violet-500' : 'bg-retro-mad'}`}
            animate={{ width: `${timerPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className={`flex items-center gap-1 text-sm font-semibold ${timeLeft <= 3 ? 'text-retro-mad' : 'text-retro-text-secondary'}`}>
          <Timer size={14} />
          {timeLeft}s
        </div>
      </div>

      <h2 className="text-lg font-semibold text-retro-text text-center">{question.question}</h2>

      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice, idx) => {
          let bgClass = 'bg-white border-retro-border hover:border-retro-primary/50 hover:shadow-soft'
          if (showResult) {
            if (isCorrect(idx)) bgClass = 'bg-emerald-50 border-2 border-emerald-400 animate-pop'
            else if (selected === idx) bgClass = 'bg-red-50 border-2 border-retro-mad animate-shake'
            else bgClass = 'bg-white border-retro-border opacity-40'
          }

          return (
            <motion.button
              key={idx}
              whileHover={!showResult ? { scale: 1.01 } : undefined}
              whileTap={!showResult ? { scale: 0.99 } : undefined}
              onClick={() => handleSelect(idx)}
              disabled={showResult || hasAnswered}
              className={`p-3 md:p-5 rounded-2xl border-2 text-left transition-all duration-200 ${bgClass}
                disabled:cursor-default`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <span className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${letterColors[idx % letterColors.length]} flex items-center justify-center text-xs md:text-sm font-bold shrink-0`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-xs md:text-sm text-retro-text flex-1">{choice}</span>
                {showResult && isCorrect(idx) && <CheckCircle2 size={20} className="text-retro-glad" />}
                {showResult && selected === idx && !isCorrect(idx) && <XCircle size={20} className="text-retro-mad" />}
              </div>
            </motion.button>
          )
        })}
      </div>

      {showResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-center text-sm font-medium p-4 rounded-2xl ${
            selected === question.correct_choice
              ? 'bg-emerald-50 text-retro-glad'
              : 'bg-red-50 text-retro-mad'
          }`}
        >
          {selected === question.correct_choice ? 'Risposta corretta!' : 'Risposta sbagliata!'}
        </motion.div>
      )}
    </div>
  )
}
