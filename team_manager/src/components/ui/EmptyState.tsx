import { LucideIcon } from 'lucide-react'
import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  children?: ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      {Icon && (
        <div className="mb-4 p-4 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]">
          <Icon size={48} strokeWidth={1.5} />
        </div>
      )}

      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>

      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">{description}</p>
      )}

      {children}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4">
          {action && (
            <button
              onClick={action.onClick}
              className={`btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button onClick={secondaryAction.onClick} className="btn btn-secondary">
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
