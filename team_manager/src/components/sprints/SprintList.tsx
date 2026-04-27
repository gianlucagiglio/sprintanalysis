import { Edit2, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import type { Sprint } from '@/types'

interface SprintListProps {
  sprints: Sprint[]
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onToggleSelectAll: () => void
  onEditSprint: (sprint: Sprint) => void
  onDeleteSprint: (id: string) => void
}

export function SprintList({
  sprints,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
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

  const allSelected = sprints.length > 0 && selectedIds.length === sprints.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < sprints.length

  return (
    <div className="space-y-3">
      {/* Header with Select All */}
      <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected
            }}
            onChange={onToggleSelectAll}
            className="w-4 h-4 accent-[var(--accent-primary)] cursor-pointer"
            aria-label="Seleziona tutti gli sprint"
          />
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {allSelected
              ? 'Deseleziona tutti'
              : someSelected
              ? `${selectedIds.length} selezionati`
              : 'Seleziona tutti'}
          </span>
        </label>
      </div>

      {/* Sprint List */}
      {sprints.map((sprint) => {
        const isSelected = selectedIds.includes(sprint.id)

        return (
          <div
            key={sprint.id}
            className={`bg-[var(--bg-tertiary)] rounded-lg overflow-hidden p-4 transition-all ${
              isSelected
                ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-subtle)]'
                : 'hover:bg-[var(--bg-hover)]'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Checkbox */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(sprint.id)}
                  className="w-4 h-4 accent-[var(--accent-primary)] cursor-pointer"
                  aria-label={`Seleziona sprint ${sprint.name}`}
                />
              </label>

              {/* Sprint Info */}
              <div className="flex-1">
                <div className="font-semibold text-[var(--text-primary)]">
                  {sprint.name}
                </div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">
                  {format(new Date(sprint.start_date), 'd MMM', { locale: it })} -{' '}
                  {format(new Date(sprint.end_date), 'd MMM yyyy', { locale: it })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditSprint(sprint)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  aria-label="Modifica sprint"
                  title="Modifica sprint"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => onDeleteSprint(sprint.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                  aria-label="Elimina sprint"
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
