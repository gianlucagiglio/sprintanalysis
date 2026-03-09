import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { QuizQuestion, QuizAnswer } from '@/types/database'

export function useQuiz(sessionId: string | undefined) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const user = useAuthStore((s) => s.user)

  const fetchQuestions = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order')
    if (error) {
      console.error('fetchQuestions failed:', error)
      return
    }
    if (data) setQuestions(data)
  }, [sessionId])

  const fetchAnswers = useCallback(async () => {
    if (!sessionId || !questions.length) return
    const qIds = questions.map((q) => q.id)
    const { data, error } = await supabase
      .from('quiz_answers')
      .select('*')
      .in('question_id', qIds)
    if (error) {
      console.error('fetchAnswers failed:', error)
      return
    }
    if (data) setAnswers(data)
  }, [sessionId, questions])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    fetchAnswers()
  }, [fetchAnswers])

  // Realtime
  useEffect(() => {
    if (!sessionId) return
    const channel = supabase
      .channel(`quiz-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_answers' },
        () => fetchAnswers()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, fetchAnswers])

  // Polling fallback: questions + answers every 3s
  useEffect(() => {
    if (!sessionId) return
    const interval = setInterval(() => {
      fetchQuestions()
      fetchAnswers()
    }, 3000)
    return () => clearInterval(interval)
  }, [sessionId, fetchQuestions, fetchAnswers])

  const submitAnswer = async (questionId: string, choice: number, timeTaken: number) => {
    if (!user) return
    const question = questions.find((q) => q.id === questionId)
    if (!question) return
    const isCorrect = choice === question.correct_choice
    const timeBonus = Math.max(0, Math.round((10 - timeTaken) * 100))
    const points = isCorrect ? 1000 + timeBonus : 0

    const { error } = await supabase.from('quiz_answers').insert({
      question_id: questionId,
      user_id: user.id,
      choice,
      time_taken: timeTaken,
      points,
    })
    if (error) {
      console.error('submitAnswer failed:', error)
    } else {
      await fetchAnswers()
    }
  }

  const getLeaderboard = () => {
    const scores: Record<string, number> = {}
    answers.forEach((a) => {
      scores[a.user_id] = (scores[a.user_id] || 0) + a.points
    })
    return Object.entries(scores)
      .map(([userId, totalPoints]) => ({ userId, totalPoints }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
  }

  const hasAnswered = (questionId: string) =>
    answers.some((a) => a.question_id === questionId && a.user_id === user?.id)

  return {
    questions,
    answers,
    submitAnswer,
    getLeaderboard,
    hasAnswered,
    fetchQuestions,
  }
}
