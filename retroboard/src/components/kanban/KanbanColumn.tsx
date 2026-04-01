import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import type { Action } from '@/types/database'

interface KanbanColumnProps {
  id: string
  title: string
  actions: Action[]
  color: string
  onEditAction?: (action: Action) => void
  canEditAction?: (action: Action) => boolean
}

export function KanbanColumn({ id, title, actions, color, onEditAction, canEditAction }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-slate-50 rounded-2xl border border-slate-200 p-3 min-h-[300px] transition-all duration-200
        ${isOver ? 'ring-2 ring-retro-primary/20 bg-retro-primary/5' : ''}
        min-h-[120px] md:min-h-[300px]`}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <h3 className="text-sm font-bold text-retro-text">{title}</h3>
        <span className="text-xs text-retro-text-secondary ml-auto bg-white rounded-full px-2 py-0.5 font-medium">{actions.length}</span>
      </div>
      <SortableContext items={actions.map((a) => a.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2">
          {actions.map((action) => (
            <KanbanCard
              key={action.id}
              action={action}
              onEdit={onEditAction}
              canEdit={canEditAction?.(action)}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
