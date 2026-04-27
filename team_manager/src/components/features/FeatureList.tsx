import { Edit2, Trash2, Users } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Feature, TeamMember, FeatureMember } from '@/types'

interface FeatureListProps {
  features: Feature[]
  members: TeamMember[]
  featureMembers: FeatureMember[]
  getFeatureMembers: (featureId: string) => FeatureMember[]
  onEdit: (feature: Feature) => void
  onDelete: (id: string) => void
  onAssignMembers: (featureId: string) => void
}

export function FeatureList({
  features,
  members,
  featureMembers,
  getFeatureMembers,
  onEdit,
  onDelete,
  onAssignMembers,
}: FeatureListProps) {
  if (features.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)]">
        <p className="text-[var(--text-secondary)]">
          Nessuna feature trovata. Crea la prima feature per iniziare.
        </p>
      </div>
    )
  }

  // Ordine ruoli: PA, PD, BE, FE, QA, QAA
  const roleOrder: Record<string, number> = {
    PA: 1,
    PD: 2,
    BE: 3,
    FE: 4,
    QA: 5,
    QAA: 6,
  }

  const getAssignedMembers = (featureId: string) => {
    const assignedIds = getFeatureMembers(featureId).map((fm) => fm.member_id)
    const assignedMembers = members.filter((m) => assignedIds.includes(m.id))

    // Ordina per ruolo
    return assignedMembers.sort((a, b) => {
      const roleA = a.role?.name || ''
      const roleB = b.role?.name || ''
      const orderA = roleOrder[roleA] || 999
      const orderB = roleOrder[roleB] || 999
      return orderA - orderB
    })
  }

  return (
    <div className="space-y-3">
      {features.map((feature) => {
        const assignedMembers = getAssignedMembers(feature.id)

        return (
          <div
            key={feature.id}
            className="p-5 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border-primary)] hover:border-[var(--accent-primary)] transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <Badge label={feature.name} color={feature.color} />
                  {feature.sprint && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      Sprint: {feature.sprint.name}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Users size={16} />
                    <span>
                      {assignedMembers.length === 0
                        ? 'Nessun membro assegnato'
                        : `${assignedMembers.length} ${
                            assignedMembers.length === 1 ? 'membro' : 'membri'
                          }`}
                    </span>
                  </div>

                  {assignedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {assignedMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-primary)] rounded-md border border-[var(--border-primary)]"
                        >
                          {member.role && (
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: member.role.color }}
                            />
                          )}
                          <span className="text-xs text-[var(--text-primary)]">
                            {member.name}
                          </span>
                          {member.role && (
                            <span className="text-xs text-[var(--text-tertiary)]">
                              ({member.role.name})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onAssignMembers(feature.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                  title="Assegna membri"
                >
                  <Users size={18} />
                </button>
                <button
                  onClick={() => onEdit(feature)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                  title="Modifica"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(feature.id)}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                  title="Elimina"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
