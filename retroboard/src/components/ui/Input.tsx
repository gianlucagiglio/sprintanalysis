import { InputHTMLAttributes, forwardRef } from 'react'
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
        <label className="block text-sm font-medium text-retro-text-DEFAULT">{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-white/70 backdrop-blur-sm px-4 py-2.5 text-sm
            text-retro-text-DEFAULT placeholder:text-retro-text-tertiary
            transition-all duration-200 ease-out
            focus:outline-none focus:shadow-soft focus:bg-white/90
            ${error
              ? 'border-glass-vibrant-mad pr-10 focus:ring-4 focus:ring-glass-vibrant-mad/20 focus:border-glass-vibrant-mad'
              : 'border-white/40 focus:border-glass-primary focus:ring-4 focus:ring-glass-primary/10'
            } ${className}`}
          {...props}
        />
        {error && (
          <AlertCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-retro-mad" />
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-retro-mad">
          {error}
        </p>
      )}
      {!error && helper && (
        <p className="text-xs text-retro-text-secondary">{helper}</p>
      )}
    </div>
  )
)

Input.displayName = 'Input'
