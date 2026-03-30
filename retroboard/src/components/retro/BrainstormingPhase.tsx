import { useMemo, useState } from 'react'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { useSessionStore } from '@/stores/sessionStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Heart,
  MessageSquare,
  Send,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Comment } from '@/types/database'

interface BrainstormingPhaseProps {
  sessionId: string
}

type DiscussionStatus = Comment['discussion_status']

const COLUMNS: {
  status: DiscussionStatus
  title: string
  icon: typeof Clock
  accent: string
  bgCard: string
  border: string
  badge: string
}[] = [
  {
    status: 'pending',
    title: 'Da discutere',
    icon: Clock,
    accent: 'text-slate-500',
    bgCard: '',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-600',
  },
  {
    status: 'discussing',
    title: 'In discussione',
    icon: MessageCircle,
    accent: 'text-amber-500',
    bgCard: 'ring-1 ring-amber-200 bg-amber-50/30',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    status: 'discussed',
    title: 'Discusso',
    icon: CheckCircle2,
    accent: 'text-emerald-500',
    bgCard: 'bg-emerald-50/30',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
  },
]

export function BrainstormingPhase({ sessionId }: BrainstormingPhaseProps) {
  const sections = useSessionStore((s) => s.sections)
  const participants = useSessionStore((s) => s.participants)
  const { comments, addReply, updateDiscussionStatus } = useComments(sessionId, sections)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount } = useVotes(commentIds, sessionId)

  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [collapsedColumns, setCollapsedColumns] = useState<Set<DiscussionStatus>>(new Set())

  const parentComments = comments.filter((c) => !c.group_id)
  const getChildren = (parentId: string) => comments.filter((c) => c.group_id === parentId)

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

  const toggleColumn = (status: DiscussionStatus) => {
    setCollapsedColumns((prev) => {
      const next = new Set(prev)
      if (next.has(status)) next.delete(status)
      else next.add(status)
      return next
    })
  }

  const getColumnComments = (status: DiscussionStatus) =>
    parentComments
      .filter((c) => (c.discussion_status || 'pending') === status)
      .sort((a, b) => getVoteCount(b.id) - getVoteCount(a.id))

  const moveComment = (commentId: string, newStatus: DiscussionStatus) => {
    updateDiscussionStatus(commentId, newStatus)
  }

  const renderCard = (comment: Comment, colIndex: number) => {
    const children = getChildren(comment.id)
    const votes = getVoteCount(comment.id)
    const col = COLUMNS[colIndex]

    return (
      <motion.div
        key={comment.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card className={`!p-4 !rounded-2xl ${col.bgCard}`}>
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
              <p className={`text-sm text-retro-text ${colIndex === 2 ? 'line-through opacity-60' : ''}`}>
                {comment.text}
              </p>
            </div>

            {votes > 0 && (
              <span className="flex items-center gap-1 text-sm text-rose-500 font-medium shrink-0">
                <Heart size={14} className="fill-rose-500" />
                {votes}
              </span>
            )}
          </div>

          {/* Children */}
          {children.length > 0 && (
            <div className="mt-3 pl-3 border-l-2 border-retro-border space-y-1.5">
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

          {/* Actions bar */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            {/* Reply */}
            {replyingTo === comment.id ? (
              <div className="flex gap-2 flex-1">
                <Input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Aggiungi una nota..."
                  autoFocus
                  className="!rounded-2xl text-sm"
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
                Nota
              </button>
            )}

            {/* Move buttons */}
            {replyingTo !== comment.id && (
              <div className="flex items-center gap-1">
                {colIndex > 0 && (
                  <button
                    onClick={() => moveComment(comment.id, COLUMNS[colIndex - 1].status)}
                    className="p-1.5 rounded-lg text-retro-text-secondary hover:text-retro-text hover:bg-slate-100 transition-all"
                    title={`Sposta in "${COLUMNS[colIndex - 1].title}"`}
                  >
                    <ArrowLeft size={14} />
                  </button>
                )}
                {colIndex < 2 && colIndex !== 1 && (
                  <button
                    onClick={() => moveComment(comment.id, COLUMNS[colIndex + 1].status)}
                    className="p-1.5 rounded-lg text-retro-text-secondary hover:text-amber-500 hover:bg-amber-50 transition-all"
                    title={`Sposta in "${COLUMNS[colIndex + 1].title}"`}
                  >
                    <ArrowRight size={14} />
                  </button>
                )}
                {colIndex === 1 && (
                  <button
                    onClick={() => moveComment(comment.id, 'discussed')}
                    className="p-1.5 rounded-lg text-retro-text-secondary hover:text-emerald-500 hover:bg-emerald-50 transition-all"
                    title="Segna come discusso"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-retro-text mb-2">Discutiamo i risultati</h2>
        <p className="text-sm text-retro-text-secondary">
          Spostate i commenti tra le colonne per tracciare la discussione.
        </p>
      </div>

      {/* Kanban grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col, colIndex) => {
          const colComments = getColumnComments(col.status)
          const isCollapsed = collapsedColumns.has(col.status)
          const Icon = col.icon

          return (
            <div key={col.status} className="flex flex-col min-h-0">
              {/* Column header */}
              <button
                onClick={() => toggleColumn(col.status)}
                className={`flex items-center justify-between p-3 rounded-xl border-2 ${col.border} bg-white mb-3 transition-colors hover:bg-slate-50 md:cursor-default`}
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className={col.accent} />
                  <span className="text-sm font-semibold text-retro-text">{col.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${col.badge}`}>
                    {colComments.length}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-retro-text-secondary transition-transform md:hidden ${
                    isCollapsed ? '' : 'rotate-180'
                  }`}
                />
              </button>

              {/* Column body */}
              <div
                className={`space-y-3 flex-1 overflow-y-auto transition-all ${
                  isCollapsed ? 'hidden md:block' : ''
                }`}
              >
                <AnimatePresence mode="popLayout">
                  {colComments.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8 text-sm text-retro-text-secondary"
                    >
                      Nessun commento
                    </motion.div>
                  ) : (
                    colComments.map((comment) => renderCard(comment, colIndex))
                  )}
                </AnimatePresence>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
