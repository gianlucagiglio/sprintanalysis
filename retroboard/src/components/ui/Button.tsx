import { ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-gradient-to-r from-retro-primary to-indigo-500 text-white shadow-soft hover:shadow-md hover:-translate-y-0.5',
  secondary: 'bg-white text-retro-text border border-retro-border hover:bg-retro-sidebar hover:border-slate-300',
  danger: 'bg-retro-mad text-white hover:bg-red-600 shadow-soft hover:shadow-md hover:-translate-y-0.5',
  ghost: 'text-retro-text-secondary hover:bg-retro-sidebar hover:text-retro-text',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-primary/50 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
)

Button.displayName = 'Button'
