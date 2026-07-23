import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-glass-primary text-white shadow-soft hover:opacity-90 active:opacity-80',
  secondary: 'bg-white/70 backdrop-blur-sm text-retro-text border border-white/40 hover:bg-white/90 hover:border-white/60 active:scale-98',
  danger: 'bg-glass-vibrant-mad text-white shadow-soft hover:opacity-90 active:opacity-80',
  ghost: 'text-retro-text-secondary hover:bg-white/50 hover:text-retro-text active:scale-98',
  success: 'bg-glass-vibrant-glad text-white shadow-soft hover:opacity-90 active:opacity-80',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2.5 text-sm min-h-[40px]',
  lg: 'px-6 py-3 text-base min-h-[44px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled, loading, children, ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium
        transition-all duration-150 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-retro-primary-400/50 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-soft
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
)

Button.displayName = 'Button'
