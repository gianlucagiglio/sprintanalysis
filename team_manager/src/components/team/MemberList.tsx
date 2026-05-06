import { Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { TeamMember } from '@/types'

interface MemberListProps {
  members: TeamMember[]
  onEdit: (member: TeamMember) => void
  onDelete: (id: string) => void
}

export function MemberList({ members, onEdit, onDelete }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)]">
        No team members. Add one!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div>
              <div className="font-medium text-[var(--text-primary)]">
                {member.name}
              </div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">
                Capacity: <span className="font-mono">{member.weekly_capacity}</span> days/week
              </div>
            </div>
            {member.role && (
              <Badge label={member.role.name} color={member.role.color} small />
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(member)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Remove ${member.name} from team?`)) {
                  onDelete(member.id)
                }
              }}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
