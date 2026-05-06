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

export function FeatureList({ features, members, getFeatureMembers, onEdit, onDelete, onAssignMembers }: FeatureListProps) {
  const roleOrder: Record<string, number> = { PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }

  const getAssignedMembers = (featureId: string) => {
    const assignedIds = getFeatureMembers(featureId).map((fm) => fm.member_id)
    const assignedMembers = members.filter((m) => assignedIds.includes(m.id))
    return assignedMembers.sort((a, b) => {
      const orderA = roleOrder[a.role?.name || ''] || 999
      const orderB = roleOrder[b.role?.name || ''] || 999
      return orderA - orderB
    })
  }

  return (
    <div className="space-y-3">
      {features.map((feature) => {
        const assignedMembers = getAssignedMembers(feature.id)

        return (
          <div key={feature.id} className="card hover:border-[var(--border-secondary)] transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <Badge label={feature.name} color={feature.color} />
                  {feature.type && (
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
                      {feature.type === 'strategic' ? 'Strategica' : 'Small Change'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Users size={14} />
                    <span>
                      {assignedMembers.length === 0 ? 'Nessun membro assegnato' : `${assignedMembers.length} ${assignedMembers.length === 1 ? 'membro' : 'membri'}`}
                    </span>
                  </div>

                  {assignedMembers.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {assignedMembers.map((member) => (
                        <div key={member.id} className="flex items-center gap-2 px-2.5 py-1 bg-[var(--bg-tertiary)] rounded text-xs">
                          {member.role && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.role.color }} />}
                          <span className="text-[var(--text-primary)]">{member.name}</span>
                          {member.role && <span className="text-[var(--text-tertiary)]">({member.role.name})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => onAssignMembers(feature.id)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors" title="Assegna membri">
                  <Users size={16} />
                </button>
                <button onClick={() => onEdit(feature)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors" title="Modifica">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => onDelete(feature.id)} className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--bg-hover)] rounded transition-colors" title="Elimina">
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
