import { InputHTMLAttributes, forwardRef } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  checked?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, checked, onChange, className = '', ...props }, ref) => {
    return (
      <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="sr-only"
            {...props}
          />
          <div
            className={`w-5 h-5 rounded border-2 transition-all duration-200
              ${
                checked
                  ? 'bg-retro-primary border-retro-primary scale-110'
                  : 'border-retro-border hover:border-retro-primary-400'
              }
            `}
          >
            {checked && (
              <svg
                className="w-full h-full text-white animate-scale-in"
                viewBox="0 0 12 12"
              >
                <polyline
                  points="2,6 5,9 10,3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        </div>
        {label && <span className="text-sm text-retro-text select-none">{label}</span>}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'
