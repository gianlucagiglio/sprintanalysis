import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export type QuizLeague = {
  id: string
  name: string
  description: string | null
  start_date: string
  end_date: string | null
  status: 'active' | 'closed'
  created_at: string
  created_by: string | null
  team_id: string
}

export type LeagueRanking = {
  id: string
  league_id: string
  user_id: string
  user_name: string
  total_points: number
  games_played: number
  rank: number
  snapshot_at: string
}

export type ActiveLeagueRanking = {
  user_id: string
  user_name: string
  total_points: number
  games_played: number
  rank: number
}

export function useLeagues(teamId?: string | null) {
  const [leagues, setLeagues] = useState<QuizLeague[]>([])
  const [activeLeague, setActiveLeague] = useState<QuizLeague | null>(null)
  const [loading, setLoading] = useState(true)
  const user = useAuthStore((s) => s.user)

  const fetchLeagues = useCallback(async () => {
    try {
      // Get user's teams first
      const { data: memberships } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user?.id || '')

      const userTeamIds = memberships?.map(m => m.team_id) || []

      if (userTeamIds.length === 0) {
        setLeagues([])
        setActiveLeague(null)
        setLoading(false)
        return
      }

      // Filter by specific team if provided, otherwise get all user's teams
      const filteredTeamIds = teamId ? userTeamIds.filter(id => id === teamId) : userTeamIds

      if (filteredTeamIds.length === 0) {
        setLeagues([])
        setActiveLeague(null)
        setLoading(false)
        return
      }

      // Fetch league filtrate per team
      const { data, error } = await supabase
        .from('quiz_leagues')
        .select('*')
        .in('team_id', filteredTeamIds)
        .order('created_at', { ascending: false })

      if (error) throw error

      setLeagues(data || [])

      // Trova la league attiva (per il team selezionato)
      const active = data?.find((l) => l.status === 'active') || null
      setActiveLeague(active)
    } catch (error) {
      console.error('Error fetching leagues:', error)
    } finally {
      setLoading(false)
    }
  }, [user, teamId])

  useEffect(() => {
    fetchLeagues()
  }, [fetchLeagues])

  // Realtime subscription per aggiornamenti league
  useEffect(() => {
    const channel = supabase
      .channel('quiz-leagues-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_leagues' },
        () => {
          fetchLeagues()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Crea una nuova league (solo super admin)
   * @param name Nome della league
   * @param teamId ID del team per cui creare la league
   * @param description Descrizione opzionale
   */
  const createLeague = useCallback(
    async (name: string, teamId: string, description?: string) => {
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('quiz_leagues')
        .insert({
          name,
          description: description || null,
          status: 'active',
          created_by: user.id,
          team_id: teamId,
        })
        .select()
        .single()

      if (error) throw error

      await fetchLeagues()
      return data
    },
    [user, fetchLeagues]
  )

  /**
   * Preview chiusura league (dry-run senza modificare dati)
   */
  const previewCloseLeague = useCallback(async (leagueId: string) => {
    const { data, error } = await supabase.rpc('preview_close_quiz_league', {
      p_league_id: leagueId,
    })

    if (error) throw error

    if (!data || !data.success) {
      throw new Error(data?.error || 'Errore durante la preview')
    }

    return {
      leagueId: data.league_id,
      leagueName: data.league_name,
      currentStatus: data.current_status,
      expectedRankings: data.expected_rankings_to_save,
      warning: data.warning,
    }
  }, [])

  /**
   * Chiude la league corrente e opzionalmente apre una nuova
   */
  const closeLeagueAndOpenNew = useCallback(
    async (
      leagueId: string,
      newLeagueName?: string,
      newLeagueDescription?: string
    ) => {
      const { data, error } = await supabase.rpc('close_quiz_league', {
        p_league_id: leagueId,
        p_new_league_name: newLeagueName || null,
        p_new_league_description: newLeagueDescription || null,
      })

      if (error) throw error

      // Verifica se l'operazione è riuscita
      if (!data || !data.success) {
        throw new Error(data?.error || 'Errore durante la chiusura della league')
      }

      await fetchLeagues()

      return {
        closedLeagueId: data.closed_league_id,
        rankingsSaved: data.rankings_saved,
        newLeagueId: data.new_league_id,
      }
    },
    [fetchLeagues]
  )

  return {
    leagues,
    activeLeague,
    loading,
    createLeague,
    previewCloseLeague,
    closeLeagueAndOpenNew,
    refreshLeagues: fetchLeagues,
  }
}

/**
 * Hook per ottenere la classifica della league attiva in real-time
 */
export function useActiveLeagueRankings() {
  const [rankings, setRankings] = useState<ActiveLeagueRanking[]>([])
  const [loading, setLoading] = useState(true)
  const { activeLeague } = useLeagues()

  const fetchRankings = useCallback(async () => {
    if (!activeLeague) {
      setRankings([])
      setLoading(false)
      return
    }

    try {
      // Usa la RPC function per ottenere la classifica calcolata
      const { data, error } = await supabase.rpc('get_active_league_rankings')

      if (error) throw error

      setRankings(data || [])
    } catch (error) {
      console.error('Error fetching active league rankings:', error)
      setRankings([])
    } finally {
      setLoading(false)
    }
  }, [activeLeague])

  useEffect(() => {
    fetchRankings()
  }, [fetchRankings])

  // Realtime updates quando cambiano le risposte quiz
  useEffect(() => {
    if (!activeLeague) return

    const channel = supabase
      .channel('league-rankings-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'quiz_answers' },
        () => {
          fetchRankings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLeague?.id])

  return { rankings, loading, refresh: fetchRankings }
}

/**
 * Hook per ottenere lo storico di una league chiusa
 */
export function useLeagueHistory(leagueId: string | null) {
  const [rankings, setRankings] = useState<LeagueRanking[]>([])
  const [league, setLeague] = useState<QuizLeague | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!leagueId) {
      setRankings([])
      setLeague(null)
      setLoading(false)
      return
    }

    const fetchHistory = async () => {
      try {
        // Fetch league info e rankings in parallelo
        const [leagueRes, rankingsRes] = await Promise.all([
          supabase.from('quiz_leagues').select('*').eq('id', leagueId).single(),
          supabase
            .from('league_rankings')
            .select(
              `
              *,
              profiles!league_rankings_user_id_fkey(name)
            `
            )
            .eq('league_id', leagueId)
            .order('rank', { ascending: true }),
        ])

        if (leagueRes.error) throw leagueRes.error
        if (rankingsRes.error) throw rankingsRes.error

        setLeague(leagueRes.data)

        // Map rankings con user_name
        const mappedRankings: LeagueRanking[] =
          rankingsRes.data?.map((r: any) => ({
            id: r.id,
            league_id: r.league_id,
            user_id: r.user_id,
            user_name: r.profiles?.name || 'Utente',
            total_points: r.total_points,
            games_played: r.games_played,
            rank: r.rank,
            snapshot_at: r.snapshot_at,
          })) || []

        setRankings(mappedRankings)
      } catch (error) {
        console.error('Error fetching league history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [leagueId])

  return { league, rankings, loading }
}
