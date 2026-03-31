import { useState } from 'react'
import {
  DndContext,
  closestCorners,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useGlobalActions, type ActionWithSession } from '@/hooks/useGlobalActions'
import { GripVertical, Calendar, FolderOpen, ListTodo, LayoutGrid, GanttChart, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GanttView } from '@/components/kanban/GanttChart'
import type { Action } from '@/types/database'

const columns: { id: Action['status']; title: string; color: string }[] = [
  { id: 'todo', title: 'Da fare', color: 'bg-retro-text-secondary' },
  { id: 'in_progress', title: 'In corso', color: 'bg-retro-primary' },
  { id: 'done', title: 'Completato', color: 'bg-retro-glad' },
]

function GlobalKanbanCard({ action }: { action: ActionWithSession }) {
  const navigate = useNavigate()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: action.id, data: { status: action.status } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className={`!p-3 !rounded-xl ${isDragging ? 'shadow-float rotate-1' : 'shadow-soft hover:shadow-card'} transition-all duration-200`}>
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab text-retro-border hover:text-retro-text-secondary transition-colors"
          >
            <GripVertical size={14} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-retro-text">{action.text}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(`/session/${action.session_id}`)
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-retro-primary/10 text-retro-primary hover:bg-retro-primary/20 transition-colors"
              >
                <FolderOpen size={10} />
                {action.sessionTitle}
              </button>
              {action.assigneeName && (
                <Badge variant="primary">
                  <User size={10} className="mr-1" />
                  {action.assigneeName}
                </Badge>
              )}
              {action.deadline && (
                <Badge variant="warning">
                  <Calendar size={10} className="mr-1" />
                  {new Date(action.deadline).toLocaleDateString('it-IT')}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function GlobalKanbanColumn({
  id,
  title,
  actions,
  color,
}: {
  id: string
  title: string
  actions: ActionWithSession[]
  color: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-slate-50 rounded-2xl border border-slate-200 p-3 min-h-[120px] md:min-h-[300px] transition-all duration-200
        ${isOver ? 'ring-2 ring-retro-primary/20 bg-retro-primary/5' : ''}`}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <h3 className="text-sm font-bold text-retro-text">{title}</h3>
        <span className="text-xs text-retro-text-secondary ml-auto bg-white rounded-full px-2 py-0.5 font-medium">{actions.length}</span>
      </div>
      <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2">
          {actions.map((action) => (
            <GlobalKanbanCard key={action.id} action={action} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export function ActionsPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban')
  const { actions, loading, updateActionStatus } = useGlobalActions()

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

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-retro-text flex items-center gap-2">
              <ListTodo size={22} />
              Azioni Globali
            </h1>
            <p className="text-xs md:text-sm text-retro-text-secondary mt-1">
              Tutte le azioni da tutte le retrospettive
            </p>
          </div>
          <div className="bg-slate-100 rounded-xl p-1 flex gap-0.5 self-start">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'kanban'
                  ? 'bg-white shadow-soft text-retro-text'
                  : 'text-retro-text-secondary hover:text-retro-text'
              }`}
            >
              <LayoutGrid size={14} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                viewMode === 'gantt'
                  ? 'bg-white shadow-soft text-retro-text'
                  : 'text-retro-text-secondary hover:text-retro-text'
              }`}
            >
              <GanttChart size={14} />
              Gantt
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-retro-primary" />
          </div>
        ) : viewMode === 'kanban' ? (
          <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {columns.map((col) => (
                <GlobalKanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  actions={actions.filter((a) => a.status === col.id)}
                  color={col.color}
                />
              ))}
            </div>
          </DndContext>
        ) : (
          <GanttView actions={actions} />
        )}
      </div>
    </AppLayout>
  )
}
