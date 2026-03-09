import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export type SessionWinner = {
  sessionId: string
  sessionTitle: string
  sessionDate: string
  winnerUserId: string
  winnerName: string
  winnerPoints: number
  participantCount: number
}

export type GlobalLeaderboardEntry = {
  userId: string
  name: string
  totalPoints: number
  sessionsPlayed: number
}

export function useGlobalQuizStats() {
  const [globalLeaderboard, setGlobalLeaderboard] = useState<GlobalLeaderboardEntry[]>([])
  const [sessionWinners, setSessionWinners] = useState<SessionWinner[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchStats = useCallback(async () => {
    if (!user) return

    // 1. Get all sessions the user participated in
    const { data: participations, error: partError } = await supabase
      .from('session_participants')
      .select('session_id')
      .eq('user_id', user.id)

    if (partError || !participations?.length) {
      setLoading(false)
      return
    }

    const sessionIds = participations.map((p) => p.session_id)

    // 2. Fetch sessions and quiz_questions in parallel
    const [sessionsRes, questionsRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, title, created_at')
        .in('id', sessionIds)
        .order('created_at', { ascending: false }),
      supabase
        .from('quiz_questions')
        .select('id, session_id')
        .in('session_id', sessionIds),
    ])

    const sessions = sessionsRes.data || []
    const questions = questionsRes.data || []

    if (!questions.length) {
      setLoading(false)
      return
    }

    // Fetch answers for all questions
    const questionIds = questions.map((q) => q.id)
    const { data: answers } = await supabase
      .from('quiz_answers')
      .select('id, question_id, user_id, points')
      .in('question_id', questionIds)

    const allAnswers = answers || []

    // Build question -> session map
    const questionToSession: Record<string, string> = {}
    questions.forEach((q) => {
      questionToSession[q.id] = q.session_id
    })

    // Sessions that have quiz questions
    const sessionsWithQuiz = new Set(questions.map((q) => q.session_id))

    // 3. Calculate per-session scores
    const sessionScores: Record<string, Record<string, number>> = {}
    allAnswers.forEach((a) => {
      const sid = questionToSession[a.question_id]
      if (!sid) return
      if (!sessionScores[sid]) sessionScores[sid] = {}
      sessionScores[sid][a.user_id] = (sessionScores[sid][a.user_id] || 0) + a.points
    })

    // 4. Collect all user IDs that participated in quizzes
    const allUserIds = new Set<string>()
    allAnswers.forEach((a) => allUserIds.add(a.user_id))

    // 5. Fetch profiles for names
    const profilesMap: Record<string, string> = {}
    if (allUserIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', Array.from(allUserIds))
      profiles?.forEach((p) => {
        profilesMap[p.id] = p.name
      })
    }

    // 6. Build session winners
    const winners: SessionWinner[] = []
    sessions.forEach((session) => {
      if (!sessionsWithQuiz.has(session.id)) return
      const scores = sessionScores[session.id]
      if (!scores || Object.keys(scores).length === 0) return

      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
      const [winnerUserId, winnerPoints] = sorted[0]

      winners.push({
        sessionId: session.id,
        sessionTitle: session.title,
        sessionDate: session.created_at,
        winnerUserId,
        winnerName: profilesMap[winnerUserId] || 'Utente',
        winnerPoints,
        participantCount: Object.keys(scores).length,
      })
    })

    // 7. Build global leaderboard
    const globalScores: Record<string, { totalPoints: number; sessions: Set<string> }> = {}
    allAnswers.forEach((a) => {
      const sid = questionToSession[a.question_id]
      if (!sid) return
      if (!globalScores[a.user_id]) {
        globalScores[a.user_id] = { totalPoints: 0, sessions: new Set() }
      }
      globalScores[a.user_id].totalPoints += a.points
      globalScores[a.user_id].sessions.add(sid)
    })

    const leaderboard: GlobalLeaderboardEntry[] = Object.entries(globalScores)
      .map(([userId, data]) => ({
        userId,
        name: profilesMap[userId] || 'Utente',
        totalPoints: data.totalPoints,
        sessionsPlayed: data.sessions.size,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)

    setSessionWinners(winners)
    setGlobalLeaderboard(leaderboard)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { globalLeaderboard, sessionWinners, loading }
}
