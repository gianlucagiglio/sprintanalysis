import { type HTMLAttributes, type CSSProperties } from 'react'

export type BadgeVariant = 'default' | 'glad' | 'sad' | 'mad' | 'primary' | 'success' | 'warning' | 'outline'

const variantTokens: Record<BadgeVariant, CSSProperties> = {
  default: {
    backgroundColor: 'var(--ui-background-color)',
    color: 'var(--secondary-text-color)',
  },
  glad: {
    backgroundColor: 'var(--positive-color-selected)',
    color: 'var(--positive-color)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--positive-color)',
  },
  sad: {
    backgroundColor: 'var(--warning-color-selected)',
    color: 'var(--warning-color-hover)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--warning-color)',
  },
  mad: {
    backgroundColor: 'var(--negative-color-selected)',
    color: 'var(--negative-color)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--negative-color)',
  },
  primary: {
    backgroundColor: 'var(--primary-selected-color)',
    color: 'var(--primary-color)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--primary-color)',
  },
  success: {
    backgroundColor: 'var(--positive-color-selected)',
    color: 'var(--positive-color)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--positive-color)',
  },
  warning: {
    backgroundColor: 'var(--warning-color-selected)',
    color: 'var(--warning-color-hover)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--warning-color)',
  },
  outline: {
    backgroundColor: 'transparent',
    color: 'var(--secondary-text-color)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--ui-border-color)',
  },
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  glow?: boolean
}

export function Badge({ variant = 'default', glow = false, className = '', children, style, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold
        transition-all duration-200 ease-out
        ${glow ? 'animate-pulse-glow' : ''} ${className}`}
      style={{ ...variantTokens[variant], ...style }}
      {...props}
    >
      {children}
    </span>
  )
}
