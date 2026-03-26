import { STEPS, TOTAL_STEPS } from '../../utils/constants'

export default function WizardHeader({ currentStep }) {
  const progressPercent = ((currentStep + 1) / TOTAL_STEPS) * 100

  return (
    <div className="wizard-header">
      <div className="wizard-steps">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentStep
          const isCompleted = idx < currentStep
          const cls = isActive ? 'is-active' : isCompleted ? 'is-completed' : ''

          return (
            <span key={step.id} style={{ display: 'contents' }}>
              <div className={`wizard-step ${cls}`}>
                <span className="wizard-step-number">
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6.5L4.5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
                <span className="wizard-step-label">{step.shortLabel}</span>
              </div>
              {idx < TOTAL_STEPS - 1 && (
                <span className={`wizard-step-separator${isCompleted ? ' is-completed' : ''}`} />
              )}
            </span>
          )
        })}
      </div>
      <div className="wizard-progress">
        <div
          className="wizard-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
