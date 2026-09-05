import { type InputHTMLAttributes, forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium" style={{ color: 'var(--primary-text-color)' }}>{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`vibe-input w-full rounded-xl border bg-white/70 backdrop-blur-sm px-4 py-2.5 text-sm min-h-[44px]
            transition-all duration-200 ease-out
            focus:outline-none focus:shadow-soft focus:bg-white/90
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/50
            ${error ? 'vibe-input-error pr-10 focus:ring-4 focus:ring-[var(--negative-color)]/20' : 'focus:ring-4 focus:ring-[var(--primary-color)]/10'}
            ${className}`}
          {...props}
        />
        {error && (
          <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--negative-color)' }} />
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs" style={{ color: 'var(--negative-color)' }}>
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="text-xs" style={{ color: 'var(--secondary-text-color)' }}>{helper}</p>
      )}
    </div>
  )
)

Input.displayName = 'Input'
