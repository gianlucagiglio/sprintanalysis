import {
  DndContext,
  closestCorners,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useActions } from '@/hooks/useActions'
import { KanbanColumn } from './KanbanColumn'
import type { Action } from '@/types/database'

const columns: { id: Action['status']; title: string; color: string }[] = [
  { id: 'todo', title: 'Da fare', color: 'bg-retro-text-secondary' },
  { id: 'in_progress', title: 'In corso', color: 'bg-retro-primary' },
  { id: 'done', title: 'Completato', color: 'bg-retro-glad' },
]

interface KanbanBoardProps {
  sessionId: string
}

export function KanbanBoard({ sessionId }: KanbanBoardProps) {
  const { actions, updateActionStatus } = useActions(sessionId)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const actionId = active.id as string
    const action = actions.find((a) => a.id === actionId)
    if (!action) return

    // Check if dropped on a column
    const targetColumn = columns.find((c) => c.id === over.id)
    if (targetColumn && targetColumn.id !== action.status) {
      await updateActionStatus(actionId, targetColumn.id)
      return
    }

    // Check if dropped on another card - get that card's status
    const targetAction = actions.find((a) => a.id === over.id)
    if (targetAction && targetAction.status !== action.status) {
      await updateActionStatus(actionId, targetAction.status)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-retro-text mb-2">Kanban Board</h2>
        <p className="text-sm text-retro-text-secondary">Gestisci le azioni del team</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              actions={actions.filter((a) => a.status === col.id)}
              color={col.color}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
