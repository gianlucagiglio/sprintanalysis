import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/Card'
import { GripVertical, Heart } from 'lucide-react'
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
  grouped?: Comment[]
}

export function CommentCard({
  comment,
  isDraggable,
  votingMode,
  hasVoted,
  voteCount,
  canVote,
  onToggleVote,
  grouped,
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

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <Card className={`!p-3 !rounded-2xl ${isDragging ? 'shadow-float rotate-1' : 'shadow-card'}`}>
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
            <p className="text-sm text-retro-text">{comment.text}</p>
            {grouped && grouped.length > 0 && (
              <div className="mt-2 pl-3 border-l-2 border-retro-border space-y-1">
                {grouped.map((g) => (
                  <div key={g.id} className="flex items-start gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-retro-text-secondary mt-1.5 shrink-0" />
                    <p className="text-xs text-retro-text-secondary">{g.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {votingMode && onToggleVote && (
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
          )}
          {!votingMode && voteCount !== undefined && voteCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-retro-text-secondary whitespace-nowrap">
              {voteCount} <Heart size={10} className="inline fill-rose-300 text-rose-300" />
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  )
}
