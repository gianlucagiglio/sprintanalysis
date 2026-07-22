import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import { useSessionStore } from '@/stores/sessionStore'
import { useGamification } from './useGamification'
import type { Comment, Section } from '@/types/database'

function sentimentFromSortOrder(sortOrder: number): Comment['sentiment'] {
  if (sortOrder === 0) return 'positive'
  if (sortOrder === 1) return 'negative'
  return 'neutral'
}

export function useComments(sessionId: string | undefined, sections: Section[]) {
  const [comments, setComments] = useState<Comment[]>([])
  const user = useAuthStore((s) => s.user)
  const session = useSessionStore((s) => s.session)
  const { awardPoints } = useGamification(session?.team_id)

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections])

  const fetchComments = useCallback(async () => {
    if (!sectionIds.length) return
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .in('section_id', sectionIds)
      .order('created_at')
    if (error) {
      console.error('fetchComments failed:', error)
      return
    }
    if (data) setComments(data)
  }, [sectionIds])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  useEffect(() => {
    if (!sectionIds.length) return
    const channel = supabase
      .channel(`comments-${sessionId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments' },
        () => fetchComments()
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') console.error('comments channel error:', err)
      })
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, sectionIds, fetchComments])

  // Realtime subscription provides updates - polling removed to reduce DB load

  const addComment = async (sectionId: string, text: string) => {
    if (!user) return
    const section = sections.find((s) => s.id === sectionId)
    const sentiment = section ? sentimentFromSortOrder(section.sort_order) : null
    const { error } = await supabase.from('comments').insert({
      section_id: sectionId,
      user_id: user.id,
      text,
      group_id: null,
      sentiment,
    })
    if (error) console.error('addComment failed:', error)
    else {
      await fetchComments()
      // Award points for adding comment
      if (sessionId) {
        await awardPoints('comment', sessionId)
      }
    }
  }

  const addReply = async (parentComment: Comment, text: string) => {
    if (!user) return
    const section = sections.find((s) => s.id === parentComment.section_id)
    const sentiment = section ? sentimentFromSortOrder(section.sort_order) : null
    const { error } = await supabase.from('comments').insert({
      section_id: parentComment.section_id,
      user_id: user.id,
      text,
      group_id: parentComment.id,
      sentiment,
    })
    if (error) console.error('addReply failed:', error)
    else await fetchComments()
  }

  const toggleResolved = async (commentId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_resolved: !currentValue })
      .eq('id', commentId)
    if (error) console.error('toggleResolved failed:', error)
    else await fetchComments()
  }

  const updateDiscussionStatus = async (commentId: string, status: Comment['discussion_status']) => {
    const is_resolved = status === 'discussed'
    const { error } = await supabase
      .from('comments')
      .update({ discussion_status: status, is_resolved })
      .eq('id', commentId)
    if (error) console.error('updateDiscussionStatus failed:', error)
    else await fetchComments()
  }

  const updateGroup = async (commentId: string, groupId: string | null) => {
    const { error } = await supabase.from('comments').update({ group_id: groupId }).eq('id', commentId)
    if (error) console.error('updateGroup failed:', error)
    else await fetchComments()
  }

  const editComment = async (commentId: string, newText: string) => {
    const { error } = await supabase.from('comments').update({ text: newText }).eq('id', commentId)
    if (error) console.error('editComment failed:', error)
    else await fetchComments()
  }

  const deleteComment = async (commentId: string) => {
    // Unlink children first (set group_id = null for comments grouped under this one)
    const { error: unlinkError } = await supabase
      .from('comments')
      .update({ group_id: null })
      .eq('group_id', commentId)
    if (unlinkError) {
      console.error('unlinkChildren failed:', unlinkError)
      return
    }
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) console.error('deleteComment failed:', error)
    else await fetchComments()
  }

  return { comments, addComment, addReply, toggleResolved, updateDiscussionStatus, updateGroup, editComment, deleteComment, fetchComments }
}
