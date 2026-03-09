import { useMemo, useState } from 'react'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { useSessionStore } from '@/stores/sessionStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Heart, CheckCircle2, MessageSquare, Send } from 'lucide-react'
import { motion } from 'framer-motion'

interface BrainstormingPhaseProps {
  sessionId: string
}

export function BrainstormingPhase({ sessionId }: BrainstormingPhaseProps) {
  const sections = useSessionStore((s) => s.sections)
  const participants = useSessionStore((s) => s.participants)
  const { comments, addReply, toggleResolved } = useComments(sessionId, sections)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount } = useVotes(commentIds, sessionId)

  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const parentComments = comments.filter((c) => !c.group_id)
  const getChildren = (parentId: string) => comments.filter((c) => c.group_id === parentId)

  // Sort by vote count descending
  const sortedComments = [...parentComments].sort(
    (a, b) => getVoteCount(b.id) - getVoteCount(a.id)
  )

  const getAuthorName = (userId: string) =>
    participants.find((p) => p.user_id === userId)?.profiles?.name || 'Utente'

  const getSectionName = (sectionId: string) =>
    sections.find((s) => s.id === sectionId)?.name || ''

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return
    const parent = comments.find((c) => c.id === parentId)
    if (!parent) return
    await addReply(parent, replyText.trim())
    setReplyText('')
    setReplyingTo(null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-retro-text mb-2">Discutiamo i risultati</h2>
        <p className="text-sm text-retro-text-secondary">
          Discutete i commenti più votati. Aggiungete note e segnate quelli smarcati.
        </p>
      </div>

      <div className="space-y-4">
        {sortedComments.map((comment, i) => {
          const children = getChildren(comment.id)
          const votes = getVoteCount(comment.id)

          return (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`!p-5 !rounded-2xl ${comment.is_resolved ? 'opacity-50 bg-emerald-50/50' : ''}`}>
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-retro-primary font-medium">
                        {getSectionName(comment.section_id)}
                      </span>
                      <span className="text-xs text-retro-text-secondary">
                        — {getAuthorName(comment.user_id)}
                      </span>
                    </div>
                    <p className={`text-retro-text ${comment.is_resolved ? 'line-through' : ''}`}>
                      {comment.text}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {votes > 0 && (
                      <span className="flex items-center gap-1 text-sm text-rose-500 font-medium">
                        <Heart size={14} className="fill-rose-500" />
                        {votes}
                      </span>
                    )}
                    <button
                      onClick={() => toggleResolved(comment.id, comment.is_resolved)}
                      className={`p-1.5 rounded-xl transition-all duration-200 ${
                        comment.is_resolved
                          ? 'bg-retro-glad/10 text-retro-glad'
                          : 'text-retro-border hover:text-retro-glad hover:bg-retro-glad/10'
                      }`}
                      title={comment.is_resolved ? 'Riapri' : 'Segna come smarcato'}
                    >
                      <CheckCircle2 size={18} className={comment.is_resolved ? 'fill-retro-glad' : ''} />
                    </button>
                  </div>
                </div>

                {/* Grouped children */}
                {children.length > 0 && (
                  <div className="mt-3 pl-4 border-l-2 border-retro-border space-y-2">
                    {children.map((child) => (
                      <div key={child.id} className="text-sm">
                        <span className="text-retro-text-secondary text-xs font-medium">
                          {getAuthorName(child.user_id)}:
                        </span>{' '}
                        <span className="text-retro-text">{child.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply section */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  {replyingTo === comment.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Aggiungi una nota..."
                        autoFocus
                        className="!rounded-2xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleReply(comment.id)
                          }
                          if (e.key === 'Escape') {
                            setReplyingTo(null)
                            setReplyText('')
                          }
                        }}
                      />
                      <Button size="sm" onClick={() => handleReply(comment.id)} disabled={!replyText.trim()}>
                        <Send size={14} />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(comment.id)}
                      className="flex items-center gap-1.5 text-xs text-retro-text-secondary hover:text-retro-primary transition-colors"
                    >
                      <MessageSquare size={12} />
                      Aggiungi nota
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
