import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export type CommentSentimentData = {
  sessionId: string
  sessionTitle: string
  positive: number
  negative: number
  neutral: number
}

export type HappinessDataPoint = {
  sessionId: string
  sessionTitle: string
  sessionDate: string
  score: number // 0-3
}

export type TrendKPIs = {
  currentScore: number
  averageScore: number
  trend: 'up' | 'down' | 'stable'
  deltaPercent: number
  totalSessions: number
  uniqueParticipants: number
  resolutionRate: number
}

export type SentimentDeltaPoint = {
  sessionTitle: string
  delta: number
}

const MOOD_SCORES: Record<string, number> = {
  glad: 3,
  custom: 2,
  sad: 1,
  mad: 0,
}

export function useMetrics(teamId?: string) {
  const [commentSentiments, setCommentSentiments] = useState<CommentSentimentData[]>([])
  const [happinessData, setHappinessData] = useState<HappinessDataPoint[]>([])
  const [trendKPIs, setTrendKPIs] = useState<TrendKPIs>({
    currentScore: 0,
    averageScore: 0,
    trend: 'stable',
    deltaPercent: 0,
    totalSessions: 0,
    uniqueParticipants: 0,
    resolutionRate: 0,
  })
  const [sentimentDeltas, setSentimentDeltas] = useState<SentimentDeltaPoint[]>([])
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchMetrics = useCallback(async () => {
    if (!user) return

    // 1. Get session IDs
    let sessionIds: string[]

    if (teamId) {
      const { data: teamSessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('team_id', teamId)
      if (!teamSessions?.length) { setLoading(false); return }
      sessionIds = teamSessions.map((s) => s.id)
    } else {
      const { data: participations, error: partError } = await supabase
        .from('session_participants')
        .select('session_id, user_id')
        .eq('user_id', user.id)
      if (partError || !participations?.length) { setLoading(false); return }
      sessionIds = participations.map((p) => p.session_id)
    }

    // 2. Parallel fetch: sessions, mood_votes, sections, all participants
    const [sessionsRes, moodsRes, sectionsRes, allParticipantsRes] = await Promise.all([
      supabase
        .from('sessions')
        .select('id, title, created_at')
        .in('id', sessionIds)
        .order('created_at'),
      supabase
        .from('mood_votes')
        .select('*')
        .in('session_id', sessionIds),
      supabase
        .from('sections')
        .select('*')
        .in('session_id', sessionIds),
      supabase
        .from('session_participants')
        .select('user_id')
        .in('session_id', sessionIds),
    ])

    const sessions = sessionsRes.data || []
    const moods = moodsRes.data || []
    const sections = sectionsRes.data || []
    const allParticipants = allParticipantsRes.data || []

    // 3. Fetch comments via sectionIds
    const sectionIds = sections.map((s) => s.id)
    let comments: { section_id: string; sentiment: string | null; is_resolved: boolean }[] = []
    if (sectionIds.length) {
      const { data } = await supabase
        .from('comments')
        .select('section_id, sentiment, is_resolved')
        .in('section_id', sectionIds)
      comments = data || []
    }

    // Build section -> sessionId map
    const sectionToSession = new Map<string, string>()
    for (const s of sections) {
      sectionToSession.set(s.id, s.session_id)
    }

    // --- Comment Sentiments per session ---
    const sentimentsBySession = new Map<string, { positive: number; negative: number; neutral: number }>()
    for (const session of sessions) {
      sentimentsBySession.set(session.id, { positive: 0, negative: 0, neutral: 0 })
    }
    for (const c of comments) {
      const sid = sectionToSession.get(c.section_id)
      if (!sid) continue
      const entry = sentimentsBySession.get(sid)
      if (!entry) continue
      if (c.sentiment === 'positive') entry.positive++
      else if (c.sentiment === 'negative') entry.negative++
      else entry.neutral++
    }
    const commentSentimentData: CommentSentimentData[] = sessions.map((s) => ({
      sessionId: s.id,
      sessionTitle: s.title,
      ...(sentimentsBySession.get(s.id) || { positive: 0, negative: 0, neutral: 0 }),
    }))
    setCommentSentiments(commentSentimentData)

    // --- Happiness score per session (from mood_votes) ---
    const happinessPoints: HappinessDataPoint[] = sessions.map((session) => {
      const sessionMoods = moods.filter((m) => m.session_id === session.id)
      const avg = sessionMoods.length
        ? sessionMoods.reduce((sum, m) => sum + (MOOD_SCORES[m.mood] ?? 2), 0) / sessionMoods.length
        : 0
      return {
        sessionId: session.id,
        sessionTitle: session.title,
        sessionDate: session.created_at,
        score: Math.round(avg * 100) / 100,
      }
    })
    setHappinessData(happinessPoints)

    // --- Sentiment Deltas ---
    const deltas: SentimentDeltaPoint[] = []
    for (let i = 1; i < happinessPoints.length; i++) {
      deltas.push({
        sessionTitle: happinessPoints[i].sessionTitle,
        delta: Math.round((happinessPoints[i].score - happinessPoints[i - 1].score) * 100) / 100,
      })
    }
    setSentimentDeltas(deltas)

    // --- Trend KPIs ---
    const scores = happinessPoints.map((h) => h.score)
    const currentScore = scores.length ? scores[scores.length - 1] : 0
    const averageScore = scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
      : 0
    const prevScore = scores.length >= 2 ? scores[scores.length - 2] : currentScore
    const deltaPercent = prevScore !== 0
      ? Math.round(((currentScore - prevScore) / prevScore) * 10000) / 100
      : 0
    const trend: TrendKPIs['trend'] =
      currentScore > prevScore ? 'up' : currentScore < prevScore ? 'down' : 'stable'

    const uniqueParticipants = new Set(allParticipants.map((p) => p.user_id)).size

    const totalComments = comments.length
    const resolvedComments = comments.filter((c) => c.is_resolved).length
    const resolutionRate = totalComments
      ? Math.round((resolvedComments / totalComments) * 10000) / 100
      : 0

    setTrendKPIs({
      currentScore,
      averageScore,
      trend,
      deltaPercent,
      totalSessions: sessions.length,
      uniqueParticipants,
      resolutionRate,
    })

    setLoading(false)
  }, [user, teamId])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  return { commentSentiments, happinessData, trendKPIs, sentimentDeltas, loading }
}
