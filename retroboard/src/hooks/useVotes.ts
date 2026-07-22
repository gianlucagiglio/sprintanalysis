import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useGamification } from './useGamification'
import type { Vote } from '@/types/database'

export function useVotes(commentIds: string[], sessionId: string | undefined, maxVotes: number = 3) {
  const [votes, setVotes] = useState<Vote[]>([])
  const [voterProfiles, setVoterProfiles] = useState<Map<string, string>>(new Map())
  const user = useAuthStore((s) => s.user)
  const session = useSessionStore((s) => s.session)
  const { awardPoints } = useGamification(session?.team_id)

  const fetchVotes = useCallback(async () => {
    if (!commentIds.length) return
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .in('comment_id', commentIds)
    if (error) {
      console.error('fetchVotes failed:', error)
      return
    }
    if (data) {
      setVotes(data)

      // Fetch profiles for all voters
      const userIds = [...new Set(data.map((v) => v.user_id))]
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name')
          .in('id', userIds)
        if (profiles) {
          setVoterProfiles(new Map(profiles.map((p) => [p.id, p.name])))
        }
      }
    }
  }, [commentIds])

  useEffect(() => {
    fetchVotes()
  }, [fetchVotes])

  useEffect(() => {
    if (!commentIds.length) return
    const channel = supabase
      .channel(`votes-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'votes' },
        () => fetchVotes()
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('votes channel error:', err)
      })
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, commentIds, fetchVotes])

  // Realtime subscription provides updates - polling removed

  const userVotes = votes.filter((v) => v.user_id === user?.id)
  const userVoteCount = userVotes.length
  const remainingVotes = maxVotes - userVoteCount

  const toggleVote = async (commentId: string) => {
    if (!user || maxVotes === 0) return
    const existing = votes.find((v) => v.comment_id === commentId && v.user_id === user.id)
    if (existing) {
      // Remove vote
      const { error } = await supabase.from('votes').delete().eq('id', existing.id)
      if (error) {
        console.error('removeVote failed:', error)
      } else {
        await fetchVotes()
      }
    } else {
      // Add vote (if under limit)
      if (userVoteCount >= maxVotes) return
      const { error } = await supabase.from('votes').insert({
        comment_id: commentId,
        user_id: user.id,
        value: 1,
      })
      if (error) {
        console.error('castVote failed:', error)
      } else {
        await fetchVotes()
        // Award points for voting
        if (sessionId) {
          await awardPoints('vote', sessionId)
        }
      }
    }
  }

  const getVoteCount = (commentId: string) => {
    return votes.filter((v) => v.comment_id === commentId).length
  }

  const hasUserVoted = (commentId: string) => {
    return votes.some((v) => v.comment_id === commentId && v.user_id === user?.id)
  }

  const getVoterNames = (commentId: string): string[] => {
    return votes
      .filter((v) => v.comment_id === commentId)
      .map((v) => voterProfiles.get(v.user_id) || 'Utente')
  }

  return { votes, toggleVote, getVoteCount, hasUserVoted, getVoterNames, userVoteCount, remainingVotes }
}
