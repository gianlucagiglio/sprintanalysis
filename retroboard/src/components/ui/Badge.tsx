import { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'glad' | 'sad' | 'mad' | 'primary' | 'success' | 'warning' | 'outline'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-retro-sidebar text-retro-text-secondary',
  glad: 'bg-retro-glad-light text-emerald-700',
  sad: 'bg-retro-sad-light text-amber-700',
  mad: 'bg-retro-mad-light text-red-700',
  primary: 'bg-retro-primary-light text-indigo-700',
  success: 'bg-retro-glad-light text-emerald-700',
  warning: 'bg-retro-sad-light text-amber-700',
  outline: 'bg-transparent border border-retro-border text-retro-text-secondary',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ variant = 'default', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold
        ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
