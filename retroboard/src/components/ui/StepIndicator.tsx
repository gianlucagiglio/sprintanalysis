import { Check } from 'lucide-react'

const steps = [
  { label: 'Mood', step: 1 },
  { label: 'Icebreaker', step: 2 },
  { label: 'Retro', step: 3 },
  { label: 'Kanban', step: 4 },
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2">
      {steps.map(({ label, step }, i) => {
        const isCompleted = currentStep > step
        const isCurrent = currentStep === step
        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-1 md:gap-2">
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-retro-glad text-white shadow-soft' : ''}
                  ${isCurrent ? 'bg-gradient-to-br from-retro-primary to-indigo-500 text-white shadow-soft' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-retro-sidebar text-retro-text-secondary border border-retro-border' : ''}`}
              >
                {isCompleted ? <Check size={12} strokeWidth={2.5} /> : step}
              </div>
              <span className={`text-[10px] md:text-xs hidden sm:inline transition-all duration-200 ${isCurrent ? 'font-semibold text-retro-text' : 'text-retro-text-secondary'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-4 md:w-8 h-0.5 md:h-1 rounded-full mx-1 md:mx-2 transition-colors duration-500 ${currentStep > step ? 'bg-retro-glad' : 'bg-retro-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
