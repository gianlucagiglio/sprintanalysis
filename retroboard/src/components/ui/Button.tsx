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
  primary: 'bg-indigo-600 text-white shadow-soft hover:bg-indigo-700 active:bg-indigo-800',
  secondary: 'bg-white text-slate-800 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:scale-98 shadow-sm',
  danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700 active:bg-red-800',
  ghost: 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-98',
  success: 'bg-emerald-600 text-white shadow-soft hover:bg-emerald-700 active:bg-emerald-800',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[44px]',
  md: 'px-4 py-2.5 text-sm min-h-[44px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
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
