import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-retro-text">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm
          text-retro-text placeholder:text-slate-400
          transition-all duration-200
          focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10
          ${error ? 'border-retro-mad focus:ring-retro-mad/10 focus:border-retro-mad' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-retro-mad">{error}</p>}
    </div>
  )
)

Input.displayName = 'Input'
