import { TOTAL_STEPS } from '../../utils/constants'

export default function WizardFooter({ currentStep, onPrev, onNext, onSubmit, submitting, submitResult }) {
  const isFirst = currentStep === 0
  const isLast = currentStep === TOTAL_STEPS - 1
  const isPreview = currentStep === TOTAL_STEPS - 2
  const hideFooter = isLast && (submitting || submitResult)

  if (hideFooter) return null

  return (
    <div className="wizard-footer">
      <div className="wizard-footer-left">
        {!isFirst && (
          <button className="btn btn-ghost btn-md" onClick={onPrev}>
            Indietro
          </button>
        )}
      </div>
      <div className="wizard-footer-right">
        {isPreview ? (
          <button className="btn btn-success btn-md" onClick={onSubmit}>
            Crea progetto
          </button>
        ) : !isLast ? (
          <button className="btn btn-primary btn-md" onClick={onNext}>
            Avanti
          </button>
        ) : null}
      </div>
    </div>
  )
}
