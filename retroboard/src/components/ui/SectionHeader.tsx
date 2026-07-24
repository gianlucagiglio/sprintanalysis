import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'
import { Badge } from './Badge'

interface SectionHeaderProps {
  title: string
  icon?: LucideIcon
  iconColor?: string
  badge?: {
    label: string
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  }
  actions?: ReactNode
  className?: string
}

export function SectionHeader({
  title,
  icon: Icon,
  iconColor = 'text-indigo-500',
  badge,
  actions,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Left: Icon + Title + Badge */}
      <div className="flex items-center gap-2 min-w-0">
        {Icon && (
          <Icon size={16} className={iconColor} strokeWidth={2.5} />
        )}
        <h3 className="text-sm font-semibold text-retro-text truncate">
          {title}
        </h3>
        {badge && (
          <Badge variant={badge.variant || 'primary'} className="shrink-0">
            {badge.label}
          </Badge>
        )}
      </div>

      {/* Right: Actions */}
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  )
}
