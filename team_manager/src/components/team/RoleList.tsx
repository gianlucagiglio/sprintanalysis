import { Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Role } from '@/types'

interface RoleListProps {
  roles: Role[]
  onEdit: (role: Role) => void
  onDelete: (id: string) => void
}

export function RoleList({ roles, onEdit, onDelete }: RoleListProps) {
  if (roles.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-tertiary)]">
        No roles defined. Start by creating one!
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {roles.map((role) => (
        <div
          key={role.id}
          className="flex items-center justify-between p-4 bg-[var(--bg-tertiary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Badge label={role.name} color={role.color} />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(role)}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete role "${role.name}"?`)) {
                  onDelete(role.id)
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
