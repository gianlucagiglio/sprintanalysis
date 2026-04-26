import { Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { Sprint } from '@/types'

interface SprintListProps {
  sprints: Sprint[]
  onEditSprint: (sprint: Sprint) => void
  onDeleteSprint: (id: string) => void
}

export function SprintList({
  sprints,
  onEditSprint,
  onDeleteSprint,
}: SprintListProps) {

  if (sprints.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)]">
        Nessuno sprint creato. Inizia pianificando il tuo primo sprint!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sprints.map((sprint) => {
        return (
          <div key={sprint.id} className="bg-[var(--bg-tertiary)] rounded-lg overflow-hidden p-4 hover:bg-[var(--bg-hover)] transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-semibold text-[var(--text-primary)]">
                  {sprint.name}
                </div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">
                  {format(new Date(sprint.start_date), 'd MMM', { locale: it })} -{' '}
                  {format(new Date(sprint.end_date), 'd MMM yyyy', { locale: it })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditSprint(sprint)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  title="Modifica sprint"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Eliminare lo sprint "${sprint.name}"?`)) {
                      onDeleteSprint(sprint.id)
                    }
                  }}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                  title="Elimina sprint"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
