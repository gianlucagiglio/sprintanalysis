import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'
import type { Comment, Section } from '@/types/database'

function sentimentFromSortOrder(sortOrder: number): Comment['sentiment'] {
  if (sortOrder === 0) return 'positive'
  if (sortOrder === 1) return 'negative'
  return 'neutral'
}

export function useComments(sessionId: string | undefined, sections: Section[]) {
  const [comments, setComments] = useState<Comment[]>([])
  const user = useAuthStore((s) => s.user)

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
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [sessionId, sectionIds, fetchComments])

  // Polling fallback
  useEffect(() => {
    if (!sectionIds.length) return
    const interval = setInterval(fetchComments, 3000)
    return () => clearInterval(interval)
  }, [sectionIds, fetchComments])

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
    else await fetchComments()
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

  const updateGroup = async (commentId: string, groupId: string | null) => {
    await supabase.from('comments').update({ group_id: groupId }).eq('id', commentId)
  }

  return { comments, addComment, addReply, toggleResolved, updateGroup, fetchComments }
}
