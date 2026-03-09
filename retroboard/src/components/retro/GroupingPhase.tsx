import { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { CommentCard } from './CommentCard'
import { useSessionStore } from '@/stores/sessionStore'

interface GroupingPhaseProps {
  sessionId: string
}

const sectionPills = [
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

export function GroupingPhase({ sessionId }: GroupingPhaseProps) {
  const sections = useSessionStore((s) => s.sections)
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections])
  const { comments, updateGroup } = useComments(sessionId, sectionIds)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount } = useVotes(commentIds, sessionId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const parentComments = comments.filter((c) => !c.group_id)
  const getGrouped = (parentId: string) => comments.filter((c) => c.group_id === parentId)

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const draggedComment = comments.find((c) => c.id === active.id)
    const targetComment = comments.find((c) => c.id === over.id)
    if (!draggedComment || !targetComment) return

    // Group dragged into target (target becomes parent)
    if (!targetComment.group_id) {
      await updateGroup(draggedComment.id, targetComment.id)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-retro-text mb-2">Raggruppa i commenti</h2>
        <p className="text-sm text-retro-text-secondary">
          Trascina un commento su un altro per raggrupparli
        </p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {sections.map((section, idx) => {
          const sectionParents = parentComments.filter((c) => c.section_id === section.id)
          if (!sectionParents.length) return null
          return (
            <div key={section.id}>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-3 ${sectionPills[idx % sectionPills.length]}`}>
                {section.name}
              </span>
              <SortableContext
                items={sectionParents.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sectionParents.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      isDraggable
                      voteCount={getVoteCount(comment.id)}
                      grouped={getGrouped(comment.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )
        })}
      </DndContext>
    </div>
  )
}
