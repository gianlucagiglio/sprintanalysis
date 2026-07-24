import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { RedFlag } from '@/components/metrics/RedFlagsAlert'

interface TeamHealthData {
  score: number
  trend: 'up' | 'down' | 'stable'
  details: {
    sentiment: number
    engagement: number
    actionCompletion: number
  }
}

interface EngagementData {
  participationRate: number
  commentsPerPerson: number
  avgSessionDuration: number
  silentParticipants: number
}

interface ActionFunnelData {
  totalComments: number
  votedComments: number
  discussedComments: number
  actionsCreated: number
  actionsCompleted: number
}

export function useAdvancedMetrics() {
  const [loading, setLoading] = useState(true)
  const [teamHealth, setTeamHealth] = useState<TeamHealthData | null>(null)
  const [engagement, setEngagement] = useState<EngagementData | null>(null)
  const [actionFunnel, setActionFunnel] = useState<ActionFunnelData | null>(null)
  const [redFlags, setRedFlags] = useState<RedFlag[]>([])
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) return

    const fetchMetrics = async () => {
      setLoading(true)

      try {
        // Fetch sessions per l'utente
        const { data: participations } = await supabase
          .from('session_participants')
          .select('session_id')
          .eq('user_id', user.id)

        const sessionIds = participations?.map(p => p.session_id) || []

        if (sessionIds.length === 0) {
          // Imposta dati a zero invece di return
          setTeamHealth({
            score: 0,
            trend: 'stable',
            details: { sentiment: 0, engagement: 0, actionCompletion: 0 }
          })
          setEngagement({
            participationRate: 0,
            commentsPerPerson: 0,
            avgSessionDuration: 0,
            silentParticipants: 0,
          })
          setActionFunnel({
            totalComments: 0,
            votedComments: 0,
            discussedComments: 0,
            actionsCreated: 0,
            actionsCompleted: 0,
          })
          setRedFlags([])
          setLoading(false)
          return
        }

        // Limita a max 20 sessioni e usa approccio batch
        const limitedSessionIds = sessionIds.slice(0, 20)

        // Fetch sessions
        const { data: sessions, error: sessError } = await supabase
          .from('sessions')
          .select('*')
          .in('id', limitedSessionIds)

        if (sessError) {
          console.error('Error fetching sessions:', sessError)
        }

        // Fetch sections per ottenere section_ids
        const { data: sections, error: sectError } = await supabase
          .from('sections')
          .select('id')
          .in('session_id', limitedSessionIds)

        if (sectError) {
          console.error('Error fetching sections:', sectError)
        }

        const sectionIds = sections?.map(s => s.id) || []

        // Fetch commenti usando section_id (la colonna corretta)
        let allComments: any[] = []
        if (sectionIds.length > 0) {
          for (let i = 0; i < sectionIds.length; i += 10) {
            const batch = sectionIds.slice(i, i + 10)
            const { data: batchComments, error: commError } = await supabase
              .from('comments')
              .select('*')
              .in('section_id', batch)

            if (commError) {
              console.error('Error fetching comments batch:', commError)
            } else if (batchComments) {
              allComments = [...allComments, ...batchComments]
            }
          }
        }
        const comments = allComments

        // Fetch azioni in batch
        let allActions: any[] = []
        for (let i = 0; i < limitedSessionIds.length; i += 5) {
          const batch = limitedSessionIds.slice(i, i + 5)
          const { data: batchActions, error: actError } = await supabase
            .from('actions')
            .select('*')
            .in('session_id', batch)

          if (actError) {
            console.error('Error fetching actions batch:', actError)
          } else if (batchActions) {
            allActions = [...allActions, ...batchActions]
          }
        }
        const actions = allActions

        // Calcola metriche
        const totalSessions = sessions?.length || 0
        const totalComments = comments?.length || 0
        const totalActions = actions?.length || 0
        const completedActions = actions?.filter(a => a.status === 'done').length || 0

        // 1. Team Health Score
        const gladCount = comments?.filter(c => c.category === 'glad').length || 0
        const sadCount = comments?.filter(c => c.category === 'sad').length || 0
        const madCount = comments?.filter(c => c.category === 'mad').length || 0
        const sentimentScore = totalComments > 0
          ? ((gladCount - (sadCount + madCount)) / totalComments + 1) * 50
          : 50

        const participantsPerSession = sessions?.map(s => {
          return participations?.filter(p => p.session_id === s.id).length || 0
        }) || []
        const avgParticipants = participantsPerSession.length > 0
          ? participantsPerSession.reduce((a, b) => a + b, 0) / participantsPerSession.length
          : 0
        const engagementScore = totalSessions > 0 && avgParticipants > 0
          ? Math.min((totalComments / totalSessions / avgParticipants) * 30, 100)
          : 0

        const actionCompletionScore = totalActions > 0
          ? (completedActions / totalActions) * 100
          : 0

        const healthScore = Math.round(
          (sentimentScore * 0.4) + (engagementScore * 0.3) + (actionCompletionScore * 0.3)
        )

        setTeamHealth({
          score: healthScore,
          trend: healthScore >= 70 ? 'up' : healthScore >= 50 ? 'stable' : 'down',
          details: {
            sentiment: Math.round(sentimentScore),
            engagement: Math.round(engagementScore),
            actionCompletion: Math.round(actionCompletionScore),
          }
        })

        // 2. Engagement Metrics
        const totalParticipants = new Set(participations?.map(p => p.session_id)).size * avgParticipants
        const participationRate = totalParticipants > 0
          ? Math.min((totalComments / totalParticipants) * 100, 100)
          : 0

        const commentsPerPerson = totalParticipants > 0
          ? totalComments / totalParticipants
          : 0

        const avgSessionDuration = 45 // Mock - andrebbero calcolati i timestamp

        const silentParticipants = 30 // Mock - serve query per partecipanti senza commenti

        setEngagement({
          participationRate: Math.round(participationRate),
          commentsPerPerson: Number(commentsPerPerson.toFixed(1)),
          avgSessionDuration,
          silentParticipants,
        })

        // 3. Action Funnel
        // Fetch votes per determinare commenti votati (solo se ci sono commenti)
        let votedComments = 0
        if (comments && comments.length > 0) {
          const { data: votes, error: votesError } = await supabase
            .from('votes')
            .select('comment_id')
            .in('comment_id', comments.map(c => c.id))

          if (votesError) {
            console.error('Error fetching votes:', votesError)
          }

          const votedCommentIds = new Set(votes?.map(v => v.comment_id) || [])
          votedComments = comments.filter(c => votedCommentIds.has(c.id)).length
        }

        const discussedComments = Math.round(votedComments * 0.7) // Mock - serve campo "discussed"

        setActionFunnel({
          totalComments,
          votedComments,
          discussedComments,
          actionsCreated: totalActions,
          actionsCompleted: completedActions,
        })

        // 4. Red Flags
        const flags: RedFlag[] = []

        // Sentiment drop
        if (sentimentScore < 40) {
          flags.push({
            id: 'sentiment-low',
            type: 'sentiment_drop',
            severity: 'critical',
            title: 'Sentiment Negativo',
            description: 'Il sentiment generale è sotto la soglia critica',
            value: `${Math.round(sentimentScore)}%`,
          })
        }

        // Low participation
        if (participationRate < 50) {
          flags.push({
            id: 'participation-low',
            type: 'low_participation',
            severity: 'warning',
            title: 'Partecipazione Bassa',
            description: 'Meno della metà dei partecipanti contribuisce attivamente',
            value: `${Math.round(participationRate)}%`,
          })
        }

        // Stagnant actions
        const openActions = totalActions - completedActions
        if (openActions > 10) {
          flags.push({
            id: 'actions-stagnant',
            type: 'stagnant_actions',
            severity: 'warning',
            title: 'Azioni Accumulate',
            description: 'Molte azioni aperte potrebbero indicare problemi di follow-up',
            value: `${openActions} aperte`,
          })
        }

        // Action completion rate too low
        if (actionCompletionScore < 40 && totalActions > 5) {
          flags.push({
            id: 'completion-low',
            type: 'team_at_risk',
            severity: 'critical',
            title: 'Basso Tasso di Completamento',
            description: 'Poche azioni vengono completate, possibile mancanza di follow-through',
            value: `${Math.round(actionCompletionScore)}%`,
          })
        }

        setRedFlags(flags)

      } catch (error) {
        console.error('Error fetching advanced metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [user])

  return {
    loading,
    teamHealth,
    engagement,
    actionFunnel,
    redFlags,
  }
}
