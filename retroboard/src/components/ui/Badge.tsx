import { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'glad' | 'sad' | 'mad' | 'primary' | 'success' | 'warning' | 'outline'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-retro-sidebar text-retro-text-secondary',
  glad: 'bg-retro-glad-light text-emerald-700 border border-emerald-200',
  sad: 'bg-retro-sad-light text-amber-700 border border-amber-200',
  mad: 'bg-retro-mad-light text-red-700 border border-red-200',
  primary: 'bg-retro-primary-100 text-indigo-700 border border-indigo-200',
  success: 'bg-retro-glad-light text-emerald-700 border border-emerald-200',
  warning: 'bg-retro-sad-light text-amber-700 border border-amber-200',
  outline: 'bg-transparent border border-retro-border text-retro-text-secondary',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  glow?: boolean
}

export function Badge({ variant = 'default', glow = false, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold
        transition-all duration-200 ease-out
        ${glow ? 'animate-pulse-glow' : ''}
        ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
