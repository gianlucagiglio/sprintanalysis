import { useState } from 'react'
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useActions } from '@/hooks/useActions'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'
import { KanbanColumn } from './KanbanColumn'
import { ActionEditModal } from './ActionEditModal'
import type { Action } from '@/types/database'
import { PageHeader } from '@/components/ui/PageHeader'

const columns: { id: Action['status']; title: string; color: string }[] = [
  { id: 'todo', title: 'Da fare', color: 'bg-retro-text-secondary' },
  { id: 'in_progress', title: 'In corso', color: 'bg-retro-primary' },
  { id: 'done', title: 'Completato', color: 'bg-retro-glad' },
]

interface KanbanBoardProps {
  sessionId: string
}

export function KanbanBoard({ sessionId }: KanbanBoardProps) {
  const { actions, updateActionStatus, updateAction, deleteAction } = useActions(sessionId)
  const session = useSessionStore((s) => s.session)
  const participants = useSessionStore((s) => s.participants)
  const user = useAuthStore((s) => s.user)
  const [editingAction, setEditingAction] = useState<Action | null>(null)

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const actionId = active.id as string
    const action = actions.find((a) => a.id === actionId)
    if (!action) return

    const targetColumn = columns.find((c) => c.id === over.id)
    if (targetColumn && targetColumn.id !== action.status) {
      await updateActionStatus(actionId, targetColumn.id)
      return
    }

    const targetAction = actions.find((a) => a.id === over.id)
    if (targetAction && targetAction.status !== action.status) {
      await updateActionStatus(actionId, targetAction.status)
    }
  }

  const modalParticipants = participants.map((p) => ({
    user_id: p.user_id,
    name: p.profiles?.name || 'Utente',
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        variant="centered"
        title="Kanban Board"
        description="Gestisci le azioni del team"
        gradient="primary"
      />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              actions={actions.filter((a) => a.status === col.id)}
              color={col.color}
              onEditAction={(action) => canEditAction(action) && setEditingAction(action)}
              canEditAction={canEditAction}
            />
          ))}
        </div>
      </DndContext>

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
    </div>
  )
}
