import { useMemo, useState } from 'react'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { useActions } from '@/hooks/useActions'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'
import { GroupingPhase } from './GroupingPhase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { ActionEditModal } from '@/components/kanban/ActionEditModal'
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
  Zap,
  User,
  Calendar,
  Layers,
  X,
  Edit,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Comment, Action } from '@/types/database'

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
  const session = useSessionStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const { comments, addReply, updateDiscussionStatus } = useComments(sessionId, sections)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount, getVoterNames } = useVotes(commentIds, sessionId)
  const { actions, addAction, updateAction, deleteAction } = useActions(sessionId)

  const [clusteringView, setClusteringView] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [collapsedColumns, setCollapsedColumns] = useState<Set<DiscussionStatus>>(new Set())

  // Modal state for creating action
  const [modalComment, setModalComment] = useState<Comment | null>(null)
  const [actionText, setActionText] = useState('')
  const [actionAssignees, setActionAssignees] = useState<string[]>([])
  const [actionDeadline, setActionDeadline] = useState('')

  // Modal state for editing action
  const [editingAction, setEditingAction] = useState<Action | null>(null)

  const parentComments = comments.filter((c) => !c.group_id)
  const getChildren = (parentId: string) => comments.filter((c) => c.group_id === parentId)

  const getAuthorName = (userId: string) =>
    participants.find((p) => p.user_id === userId)?.profiles?.name || 'Utente'

  const getSectionName = (sectionId: string) =>
    sections.find((s) => s.id === sectionId)?.name || ''

  // Get actions linked to a comment
  const getCommentActions = (commentId: string) =>
    actions.filter((a) => a.comment_id === commentId)

  const modalParticipants = participants.map((p) => ({
    user_id: p.user_id,
    name: p.profiles?.name || 'Utente',
  }))

  const isOrganizer = session?.organizer_id === user?.id

  const canEditAction = (action: Action) => {
    if (isOrganizer) return true
    if (user && (action.assigned_to_multi || []).includes(user.id)) return true
    return false
  }

  const canDeleteAction = (_action: Action) => {
    if (isOrganizer) return true
    return false
  }

  const handleReply = async (parentId: string) => {
    if (!replyText.trim()) return
    const parent = comments.find((c) => c.id === parentId)
    if (!parent) return
    await addReply(parent, replyText.trim())
    setReplyText('')
    setReplyingTo(null)
  }

  const openActionModal = (comment: Comment) => {
    setModalComment(comment)
    setActionText('')
    setActionAssignees([])
    setActionDeadline('')
  }

  const closeActionModal = () => {
    setModalComment(null)
    setActionText('')
    setActionAssignees([])
    setActionDeadline('')
  }

  const handleCreateAction = async () => {
    if (!actionText.trim() || !modalComment) return
    await addAction(actionText.trim(), actionAssignees, actionDeadline || undefined, modalComment.id)
    closeActionModal()
  }

  const toggleActionAssignee = (userId: string) => {
    setActionAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
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
    const commentActions = getCommentActions(comment.id)

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
              <div className="relative group/vote shrink-0">
                <span className="flex items-center gap-1 text-sm text-rose-500 font-medium cursor-default">
                  <Heart size={14} className="fill-rose-500" />
                  {votes}
                </span>
                {getVoterNames(comment.id).length > 0 && (
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover/vote:block z-50 pointer-events-none">
                    <div className="bg-retro-text text-white text-xs rounded-xl px-3 py-2 shadow-float whitespace-nowrap">
                      <p className="font-semibold text-white/60 mb-1">Votato da</p>
                      {getVoterNames(comment.id).map((name, i) => (
                        <p key={i} className="flex items-center gap-1.5">
                          <Heart size={8} className="fill-rose-400 text-rose-400 shrink-0" />
                          {name}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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

          {/* Existing actions */}
          {commentActions.length > 0 && (
            <div className="mt-3 space-y-2">
              {commentActions.map((action) => {
                const assignedNames = (action.assigned_to_multi || [])
                  .map((id) => getAuthorName(id))
                  .join(', ')
                return (
                  <button
                    key={action.id}
                    onClick={() => setEditingAction(action)}
                    className="w-full text-left bg-amber-50 border border-amber-200 rounded-lg p-2.5 hover:bg-amber-100 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <Zap size={14} className="text-amber-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-retro-text font-medium">{action.text}</p>
                        {assignedNames && (
                          <p className="text-xs text-retro-text-secondary mt-1">
                            👤 {assignedNames}
                          </p>
                        )}
                        {action.deadline && (
                          <p className="text-xs text-retro-text-secondary mt-0.5">
                            📅 {new Date(action.deadline).toLocaleDateString('it-IT')}
                          </p>
                        )}
                      </div>
                      <Edit size={12} className="text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </button>
                )
              })}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="flex items-center gap-1.5 text-xs text-retro-text-secondary hover:text-retro-primary transition-colors"
                >
                  <MessageSquare size={12} />
                  Nota
                </button>
                <button
                  onClick={() => openActionModal(comment)}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Zap size={12} />
                  Crea azione
                  {commentActions.length > 0 && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {commentActions.length}
                    </span>
                  )}
                </button>
              </div>
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

  if (clusteringView) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex items-center bg-retro-sidebar rounded-xl p-1 gap-1">
            <button
              onClick={() => setClusteringView(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-retro-text-secondary hover:text-retro-text"
            >
              Discussione
            </button>
            <button
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white text-retro-text shadow-sm flex items-center gap-1.5"
            >
              <Layers size={12} />
              Clustering
            </button>
          </div>
        </div>
        <GroupingPhase sessionId={sessionId} />
      </div>
    )
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <div>
            <h2 className="text-xl font-bold text-retro-text mb-2">Discutiamo i risultati</h2>
            <p className="text-sm text-retro-text-secondary">
              Spostate i commenti tra le colonne e create le azioni necessarie.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="inline-flex items-center bg-retro-sidebar rounded-xl p-1 gap-1">
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white text-retro-text shadow-sm"
              >
                Discussione
              </button>
              <button
                onClick={() => setClusteringView(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-retro-text-secondary hover:text-retro-text flex items-center gap-1.5"
              >
                <Layers size={12} />
                Clustering
              </button>
            </div>
          </div>
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

      {/* Action creation modal */}
      <Modal open={!!modalComment} onClose={closeActionModal} title="Crea azione">
        {modalComment && (
          <div className="space-y-4">
            {/* Source comment preview */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <div className="text-xs text-retro-text-secondary mb-1">Dal commento:</div>
              <p className="text-sm text-retro-text">{modalComment.text}</p>
            </div>

            <div className="space-y-3">
              <Input
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="Descrivi l'azione da intraprendere..."
                autoFocus
                className="!rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleCreateAction()
                  }
                }}
              />
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-retro-text-secondary">
                    <User size={11} /> Assegnatari
                  </div>
                  {actionAssignees.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {actionAssignees.map((id) => {
                        const p = participants.find((pp) => pp.user_id === id)
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                          >
                            {p?.profiles?.name || 'Utente'}
                            <button onClick={() => toggleActionAssignee(id)} className="hover:text-indigo-900">
                              <X size={12} />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                  <select
                    value=""
                    onChange={(e) => { if (e.target.value) toggleActionAssignee(e.target.value) }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
                  >
                    <option value="">Aggiungi assegnatario...</option>
                    {participants.filter((p) => !actionAssignees.includes(p.user_id)).map((p) => (
                      <option key={p.user_id} value={p.user_id}>
                        {p.profiles?.name || 'Utente'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-xs font-medium text-retro-text-secondary">
                    <Calendar size={11} /> Scadenza
                  </div>
                  <input
                    type="date"
                    value={actionDeadline}
                    onChange={(e) => setActionDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
                  />
                </div>
              </div>
              <Button onClick={handleCreateAction} disabled={!actionText.trim()} className="w-full">
                <Zap size={16} /> Crea azione
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Action edit modal */}
      {editingAction && (
        <ActionEditModal
          action={editingAction}
          participants={modalParticipants}
          canEdit={canEditAction(editingAction)}
          canDelete={canDeleteAction(editingAction)}
          onSave={updateAction}
          onDelete={deleteAction}
          onClose={() => setEditingAction(null)}
        />
      )}
    </>
  )
}
