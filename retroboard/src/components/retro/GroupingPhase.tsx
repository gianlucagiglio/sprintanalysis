import { useMemo, useState } from 'react'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { CommentCard } from './CommentCard'
import { useSessionStore } from '@/stores/sessionStore'
import { Card } from '@/components/ui/Card'
import { Unlink } from 'lucide-react'

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
  const { comments, updateGroup } = useComments(sessionId, sections)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount } = useVotes(commentIds, sessionId)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const parentComments = comments.filter((c) => !c.group_id)
  const getGrouped = (parentId: string) => comments.filter((c) => c.group_id === parentId)

  const activeComment = activeId ? comments.find((c) => c.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event
    setOverId(over ? String(over.id) : null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setOverId(null)

    if (!over || active.id === over.id) return

    const draggedComment = comments.find((c) => c.id === active.id)
    const targetComment = comments.find((c) => c.id === over.id)
    if (!draggedComment || !targetComment) return

    // Group dragged into target (target becomes parent)
    if (!targetComment.group_id) {
      await updateGroup(draggedComment.id, targetComment.id)
    }
  }

  const handleUngroup = async (commentId: string) => {
    await updateGroup(commentId, null)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="!p-6 !rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-retro-text">Raggruppa Commenti Simili</h2>
          </div>

          <div className="space-y-2">
            <p className="text-base text-retro-text font-medium">
              🎯 <strong>Trascina</strong> un commento su un altro per raggrupparli insieme
            </p>
            <p className="text-sm text-retro-text-secondary">
              💡 Chiunque nel team può raggruppare i commenti
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-retro-text-secondary bg-white/60 rounded-lg px-4 py-2 mt-2">
              <Unlink size={14} className="text-rose-500" />
              <span>
                Sbagliato? Passa il mouse su un commento raggruppato e clicca la <strong className="text-rose-600">X rossa</strong> per sgrupparlo
              </span>
            </div>
          </div>
        </div>
      </Card>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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
                      groupCount={getGrouped(comment.id).length}
                      isOver={overId === comment.id && activeId !== comment.id}
                      onUngroup={handleUngroup}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          )
        })}

        <DragOverlay>
          {activeComment ? (
            <div className="opacity-80 rotate-2 scale-105">
              <Card className="!p-3 !rounded-2xl shadow-float">
                <p className="text-sm text-retro-text">{activeComment.text}</p>
              </Card>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
