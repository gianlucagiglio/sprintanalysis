import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { QuizQuestion, QuizAnswer } from '@/types/database'

export function useQuiz(sessionId: string | undefined) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)
  const questionIdsRef = useRef<string[]>([])

  const fetchQuestions = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order')
    if (error) {
      console.error('fetchQuestions failed:', error)
      setLoading(false)
      return
    }
    if (data) {
      setQuestions(data)
      questionIdsRef.current = data.map((q) => q.id)
    }
    setLoading(false)
  }, [sessionId])

  const fetchAnswers = useCallback(async () => {
    if (!sessionId || !questionIdsRef.current.length) return
    const { data, error } = await supabase
      .from('quiz_answers')
      .select('*')
      .in('question_id', questionIdsRef.current)
    if (error) {
      console.error('fetchAnswers failed:', error)
      return
    }
    if (data) setAnswers(data)
  }, [sessionId])

  useEffect(() => {
    const init = async () => {
      await fetchQuestions()
      await fetchAnswers()
    }
    init()
  }, [fetchQuestions]) // fetchAnswers runs after questions are loaded

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
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('quiz channel error:', err)
      })
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
    // Guard: prevent double submit (DB has UNIQUE constraint too)
    if (answers.some((a) => a.question_id === questionId && a.user_id === user.id)) return

    const { error } = await supabase.from('quiz_answers').insert({
      question_id: questionId,
      user_id: user.id,
      choice,
      time_taken: timeTaken,
    } as any) // points computed server-side by trigger
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
    loading,
    submitAnswer,
    getLeaderboard,
    hasAnswered,
    fetchQuestions,
  }
}
