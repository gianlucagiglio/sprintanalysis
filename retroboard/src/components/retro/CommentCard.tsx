import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/Card'
import { GripVertical, Heart, X } from 'lucide-react'
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
}: CommentCardProps) {
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className={`!p-3 !rounded-2xl transition-all duration-200
        ${isDragging ? 'shadow-float rotate-1' : 'shadow-card'}
        ${isOver ? 'ring-2 ring-retro-primary/40 bg-retro-primary/5' : ''}
        ${hasChildren ? 'border-l-[3px] border-l-retro-primary' : ''}
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
            <div className="flex items-center gap-2">
              <p className="text-sm text-retro-text flex-1">{comment.text}</p>
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
            <div className="relative group/vote">
              <motion.button
                whileTap={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400 }}
                onClick={onToggleVote}
                disabled={!hasVoted && !canVote}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl text-sm transition-all duration-200
                  ${hasVoted
                    ? 'bg-rose-50 text-rose-500'
                    : canVote
                      ? 'text-retro-text-secondary hover:bg-rose-50 hover:text-rose-400'
                      : 'text-retro-border cursor-not-allowed'
                  }`}
              >
                <Heart size={14} className={hasVoted ? 'fill-rose-500' : ''} />
                {(voteCount ?? 0) > 0 && <span className="font-medium">{voteCount}</span>}
              </motion.button>
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
