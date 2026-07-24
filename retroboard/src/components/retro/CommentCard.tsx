import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GripVertical, Heart, X, Pencil, Trash2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Comment } from '@/types/database'

interface CommentCardProps {
  comment: Comment
  isDraggable?: boolean
  votingMode?: boolean
  hasVoted?: boolean
  voteCount?: number
  canVote?: boolean
  onToggleVote?: () => void
  voterNames?: string[]
  grouped?: Comment[]
  onUngroup?: (commentId: string) => void
  isOver?: boolean
  groupCount?: number
  isOwn?: boolean
  onEdit?: (commentId: string, newText: string) => void
  onDelete?: (commentId: string) => void
}

export function CommentCard({
  comment,
  isDraggable,
  votingMode,
  hasVoted,
  voteCount,
  canVote,
  onToggleVote,
  voterNames,
  grouped,
  onUngroup,
  isOver,
  groupCount,
  isOwn,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  const handleEditSave = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== comment.text) {
      onEdit?.(comment.id, trimmed)
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditText(comment.text)
    setIsEditing(false)
  }

  const canEditDelete = isOwn && !isEditing && onEdit && onDelete

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: comment.id, disabled: !isDraggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const hasChildren = (groupCount ?? 0) > 0

  // Check if comment is new (created in last 60 seconds)
  const isNew = comment.created_at &&
    (Date.now() - new Date(comment.created_at).getTime()) < 60000

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card
        onClick={votingMode && onToggleVote && (hasVoted || canVote) ? onToggleVote : undefined}
        className={`!p-3 !rounded-2xl transition-all duration-300 group/card
        hover:scale-102 hover:shadow-card-hover hover:-translate-y-0.5
        ${votingMode && onToggleVote && (hasVoted || canVote) ? 'cursor-pointer' : 'cursor-default'}
        ${isDragging ? 'shadow-float rotate-1 scale-105' : 'shadow-card'}
        ${isOver ? 'ring-2 ring-indigo-400/50 bg-indigo-50/50 scale-102' : ''}
        ${hasChildren ? 'border-l-4 border-l-indigo-500 shadow-md' : ''}
        ${votingMode && hasVoted ? 'ring-2 ring-rose-400/30 bg-rose-50/30' : ''}
      `}>
        <div className="flex items-start gap-2">
          {isDraggable && (
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab text-retro-border hover:text-retro-text-secondary transition-colors"
            >
              <GripVertical size={14} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {isNew && !isEditing && (
                <Badge variant="primary" className="!text-[9px] !px-1.5 !py-0.5 !rounded-md animate-pulse">
                  <Sparkles size={8} className="mr-0.5" />
                  NUOVO
                </Badge>
              )}
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave()
                    if (e.key === 'Escape') handleEditCancel()
                  }}
                  onBlur={handleEditSave}
                  className="text-sm text-retro-text flex-1 bg-transparent border-b border-retro-primary outline-none py-0.5"
                />
              ) : (
                <p className="text-sm text-retro-text flex-1">{comment.text}</p>
              )}
              {canEditDelete && (
                <div className="flex items-center gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => { setEditText(comment.text); setIsEditing(true) }}
                    className="p-1 rounded text-retro-text-secondary hover:text-retro-primary hover:bg-retro-primary/10 transition-all"
                    title="Modifica commento"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => onDelete!(comment.id)}
                    className="p-1 rounded text-retro-text-secondary hover:text-rose-500 hover:bg-rose-50 transition-all"
                    title="Elimina commento"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
              {hasChildren && (
                <span className="bg-retro-primary/10 text-retro-primary text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                  +{groupCount}
                </span>
              )}
            </div>
            {grouped && grouped.length > 0 && (
              <div className="mt-2 pl-3 border-l-2 border-retro-border space-y-1">
                {grouped.map((g) => (
                  <div key={g.id} className="flex items-center gap-1.5 group/child">
                    <span className="w-1 h-1 rounded-full bg-retro-text-secondary mt-0.5 shrink-0" />
                    <p className="text-xs text-retro-text-secondary flex-1">{g.text}</p>
                    {onUngroup && (
                      <button
                        onClick={() => onUngroup(g.id)}
                        className="opacity-0 group-hover/child:opacity-100 p-0.5 rounded text-retro-text-secondary hover:text-rose-500 hover:bg-rose-50 transition-all shrink-0"
                        title="Sgruppa commento"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {votingMode && onToggleVote && (
            <div className="relative group/vote pointer-events-none">
              <motion.div
                animate={{ scale: hasVoted ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-sm transition-all duration-200
                  ${hasVoted
                    ? 'bg-rose-50 text-rose-500'
                    : canVote
                      ? 'text-retro-text-secondary'
                      : 'text-retro-border'
                  }`}
              >
                <Heart size={16} className={hasVoted ? 'fill-rose-500' : ''} strokeWidth={2} />
                {(voteCount ?? 0) > 0 && <span className="font-medium">{voteCount}</span>}
              </motion.div>
              {voterNames && voterNames.length > 0 && (
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/vote:block z-50">
                  <div className="bg-retro-text text-white text-xs rounded-xl px-3 py-2 shadow-float whitespace-nowrap">
                    <p className="font-semibold text-white/60 mb-1">Votato da</p>
                    {voterNames.map((name, i) => (
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
          {!votingMode && voteCount !== undefined && voteCount > 0 && (
            <div className="relative group/vote">
              <span className="flex items-center gap-1 text-xs text-retro-text-secondary whitespace-nowrap cursor-default">
                {voteCount} <Heart size={10} className="inline fill-rose-300 text-rose-300" />
              </span>
              {voterNames && voterNames.length > 0 && (
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover/vote:block z-50 pointer-events-none">
                  <div className="bg-retro-text text-white text-xs rounded-xl px-3 py-2 shadow-float whitespace-nowrap">
                    <p className="font-semibold text-white/60 mb-1">Votato da</p>
                    {voterNames.map((name, i) => (
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
      </Card>
    </motion.div>
  )
}
