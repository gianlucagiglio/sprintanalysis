import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { GripVertical, User, Calendar } from 'lucide-react'
import { useSessionStore } from '@/stores/sessionStore'
import type { Action } from '@/types/database'

interface KanbanCardProps {
  action: Action
}

export function KanbanCard({ action }: KanbanCardProps) {
  const participants = useSessionStore((s) => s.participants)
  const assignee = participants.find((p) => p.user_id === action.assigned_to)

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
            <div className="flex items-center gap-2 mt-2">
              {assignee && (
                <Badge variant="primary">
                  <User size={10} className="mr-1" />
                  {assignee.profiles?.name}
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
