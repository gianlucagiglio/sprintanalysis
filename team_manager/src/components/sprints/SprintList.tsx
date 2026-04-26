import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import type { Sprint, Feature } from '@/types'

interface SprintListProps {
  sprints: Sprint[]
  features: Feature[]
  onEditSprint: (sprint: Sprint) => void
  onDeleteSprint: (id: string) => void
  onEditFeature: (feature: Feature) => void
  onDeleteFeature: (id: string) => void
  onAddFeature: (sprintId: string) => void
}

export function SprintList({
  sprints,
  features,
  onEditSprint,
  onDeleteSprint,
  onEditFeature,
  onDeleteFeature,
  onAddFeature,
}: SprintListProps) {
  const [expandedSprints, setExpandedSprints] = useState<Record<string, boolean>>({})

  if (sprints.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)]">
        Nessuno sprint creato. Inizia pianificando il tuo primo sprint!
      </div>
    )
  }

  const toggleSprint = (sprintId: string) => {
    setExpandedSprints((prev) => ({
      ...prev,
      [sprintId]: !prev[sprintId],
    }))
  }

  return (
    <div className="space-y-3">
      {sprints.map((sprint) => {
        const sprintFeatures = features.filter((f) => f.sprint_id === sprint.id)
        const isExpanded = expandedSprints[sprint.id]

        return (
          <div key={sprint.id} className="bg-[var(--bg-tertiary)] rounded-lg overflow-hidden">
            {/* Sprint Header */}
            <div className="flex items-center justify-between p-4 hover:bg-[var(--bg-hover)] transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleSprint(sprint.id)}
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>

                <div className="flex-1">
                  <div className="font-semibold text-[var(--text-primary)]">
                    {sprint.name}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)] mt-1">
                    {format(new Date(sprint.start_date), 'd MMM', { locale: it })} -{' '}
                    {format(new Date(sprint.end_date), 'd MMM yyyy', { locale: it })}
                    {' • '}
                    {sprintFeatures.length} feature
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAddFeature(sprint.id)}
                  className="btn btn-secondary text-xs"
                >
                  + Feature
                </button>
                <button
                  onClick={() => onEditSprint(sprint)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                  title="Modifica sprint"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Eliminare lo sprint "${sprint.name}"? Verranno eliminate anche tutte le feature associate.`)) {
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

            {/* Features List */}
            {isExpanded && (
              <div className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)] p-4">
                {sprintFeatures.length === 0 ? (
                  <div className="text-center py-4 text-[var(--text-tertiary)] text-sm">
                    Nessuna feature in questo sprint. Aggiungine una!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sprintFeatures.map((feature) => (
                      <div
                        key={feature.id}
                        className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge label={feature.name} color={feature.color} />
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditFeature(feature)}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                            title="Modifica feature"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Eliminare la feature "${feature.name}"?`)) {
                                onDeleteFeature(feature.id)
                              }
                            }}
                            className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
                            title="Elimina feature"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
