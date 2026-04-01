import { useState, useMemo } from 'react'
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
import { ActionEditModal } from '@/components/kanban/ActionEditModal'
import {
  GripVertical,
  Calendar,
  FolderOpen,
  ListTodo,
  LayoutGrid,
  GanttChart,
  User,
  CircleDashed,
  Loader2 as Spinner,
  CheckCircle2,
  Zap,
  Target,
  Clock,
  AlertTriangle,
  Pencil,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { GanttView } from '@/components/kanban/GanttChart'
import type { Action } from '@/types/database'

const columns: {
  id: Action['status']
  title: string
  icon: typeof CircleDashed
  gradient: string
  dotColor: string
  dropBg: string
}[] = [
  {
    id: 'todo',
    title: 'Da fare',
    icon: CircleDashed,
    gradient: 'from-slate-400 to-slate-500',
    dotColor: 'bg-slate-400',
    dropBg: 'ring-slate-300/40 bg-slate-50',
  },
  {
    id: 'in_progress',
    title: 'In corso',
    icon: Spinner,
    gradient: 'from-blue-500 to-indigo-500',
    dotColor: 'bg-blue-500',
    dropBg: 'ring-blue-300/40 bg-blue-50/50',
  },
  {
    id: 'done',
    title: 'Completato',
    icon: CheckCircle2,
    gradient: 'from-emerald-400 to-teal-500',
    dotColor: 'bg-emerald-500',
    dropBg: 'ring-emerald-300/40 bg-emerald-50/50',
  },
]

function isOverdue(action: ActionWithSession): boolean {
  if (!action.deadline || action.status === 'done') return false
  return new Date(action.deadline) < new Date()
}

function GlobalKanbanCard({
  action,
  onEdit,
}: {
  action: ActionWithSession
  onEdit?: (action: ActionWithSession) => void
}) {
  const navigate = useNavigate()
  const overdue = isOverdue(action)
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
      <div
        className={`bg-white rounded-xl border transition-all duration-200 ${
          isDragging
            ? 'shadow-float rotate-1 border-retro-primary/30'
            : overdue
              ? 'border-red-200 shadow-soft hover:shadow-card'
              : 'border-slate-200/80 shadow-soft hover:shadow-card'
        }`}
      >
        {overdue && (
          <div className="h-0.5 bg-gradient-to-r from-red-400 to-orange-400 rounded-t-xl" />
        )}

        <div className="p-3.5">
          <div className="flex items-start gap-2.5">
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors"
            >
              <GripVertical size={14} />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <p className={`text-sm font-medium text-retro-text leading-snug flex-1 ${
                  action.status === 'done' ? 'line-through text-retro-text-secondary' : ''
                }`}>
                  {action.text}
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  {overdue && (
                    <AlertTriangle size={14} className="text-red-400 mt-0.5" />
                  )}
                  {onEdit && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEdit(action) }}
                      className="p-1 rounded-md text-slate-300 hover:text-retro-primary hover:bg-retro-primary-light transition-all"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/session/${action.session_id}`)
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <FolderOpen size={10} />
                  {action.sessionTitle}
                </button>
                {action.assigneeNames.map((name, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-600">
                    <User size={10} />
                    {name}
                  </span>
                ))}
                {action.deadline && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    overdue
                      ? 'bg-red-50 text-red-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}>
                    <Calendar size={10} />
                    {new Date(action.deadline).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GlobalKanbanColumn({
  column,
  actions,
  onEdit,
}: {
  column: typeof columns[number]
  actions: ActionWithSession[]
  onEdit?: (action: ActionWithSession) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const ColIcon = column.icon

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-2xl transition-all duration-200 min-h-[120px] md:min-h-[300px] ${
        isOver ? `ring-2 ${column.dropBg}` : 'bg-slate-50/80'
      }`}
    >
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${column.gradient} flex items-center justify-center`}>
          <ColIcon size={14} className="text-white" />
        </div>
        <h3 className="text-sm font-bold text-retro-text">{column.title}</h3>
        <span className="text-xs font-semibold text-retro-text-secondary ml-auto bg-white rounded-full px-2.5 py-0.5 border border-slate-100">
          {actions.length}
        </span>
      </div>

      <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 px-2 pb-3">
          {actions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-retro-text-secondary/50">
              <p className="text-xs">Nessuna azione</p>
            </div>
          ) : (
            actions.map((action) => (
              <GlobalKanbanCard key={action.id} action={action} onEdit={onEdit} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

export function ActionsPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt'>('kanban')
  const { actions, loading, updateActionStatus, updateAction, deleteAction } = useGlobalActions()
  const [editingAction, setEditingAction] = useState<ActionWithSession | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const stats = useMemo(() => {
    const todo = actions.filter((a) => a.status === 'todo').length
    const inProgress = actions.filter((a) => a.status === 'in_progress').length
    const done = actions.filter((a) => a.status === 'done').length
    const overdueCount = actions.filter(isOverdue).length
    return { todo, inProgress, done, overdueCount, total: actions.length }
  }, [actions])

  // Build a participant list from all assigneeNames across actions
  const modalParticipants = useMemo(() => {
    if (!editingAction) return []
    const multi = editingAction.assigned_to_multi || []
    const names = editingAction.assigneeNames || []
    return multi.map((id, i) => ({ user_id: id, name: names[i] || 'Utente' }))
  }, [editingAction])

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

  const handleEdit = (action: ActionWithSession) => {
    setEditingAction(action)
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ── Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-8 md:p-10 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <ListTodo size={180} />
          </div>
          <div className="relative">
            <Badge className="!bg-white/20 !text-white !backdrop-blur-sm mb-4">
              Azioni Globali
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Piano d'azione</h1>
            <p className="text-white/70 text-sm">
              Tutte le azioni da tutte le retrospettive in un unico posto
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-retro-primary" />
          </div>
        ) : actions.length === 0 ? (
          <Card className="!rounded-2xl text-center !py-16">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
              <ListTodo size={28} className="text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-retro-text mb-1">Nessuna azione</p>
            <p className="text-sm text-retro-text-secondary">
              Le azioni appariranno qui quando vengono create nelle retrospettive
            </p>
          </Card>
        ) : (
          <>
            {/* ── Stats Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Totale', value: stats.total, icon: Target, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { label: 'Da fare', value: stats.todo, icon: CircleDashed, color: 'text-slate-500', bg: 'bg-slate-100' },
                { label: 'In corso', value: stats.inProgress, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50' },
                { label: 'Completate', value: stats.done, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <Card key={stat.label} className="!p-4 !rounded-2xl text-center">
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon size={20} className={stat.color} />
                    </div>
                    <p className="text-2xl font-bold text-retro-text">{stat.value}</p>
                    <p className="text-xs text-retro-text-secondary mt-0.5">{stat.label}</p>
                  </Card>
                )
              })}
            </div>

            {/* ── Overdue alert ── */}
            {stats.overdueCount > 0 && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3.5">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-700">
                    {stats.overdueCount} {stats.overdueCount === 1 ? 'azione scaduta' : 'azioni scadute'}
                  </p>
                  <p className="text-xs text-red-500/80">
                    Alcune azioni hanno superato la deadline prevista
                  </p>
                </div>
              </div>
            )}

            {/* ── View Toggle ── */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                {([
                  { key: 'kanban' as const, label: 'Kanban', icon: LayoutGrid },
                  { key: 'gantt' as const, label: 'Gantt', icon: GanttChart },
                ]).map((tab) => {
                  const Icon = tab.icon
                  const isActive = viewMode === tab.key
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setViewMode(tab.key)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-white shadow-soft text-retro-text'
                          : 'text-retro-text-secondary hover:text-retro-text'
                      }`}
                    >
                      <Icon size={14} />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Content ── */}
            {viewMode === 'kanban' ? (
              <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {columns.map((col) => (
                    <GlobalKanbanColumn
                      key={col.id}
                      column={col}
                      actions={actions.filter((a) => a.status === col.id)}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </DndContext>
            ) : (
              <GanttView actions={actions} />
            )}
          </>
        )}

        {editingAction && (
          <ActionEditModal
            action={editingAction}
            participants={modalParticipants}
            canEdit={true}
            canDelete={true}
            onSave={updateAction}
            onDelete={deleteAction}
            onClose={() => setEditingAction(null)}
          />
        )}
      </div>
    </AppLayout>
  )
}
