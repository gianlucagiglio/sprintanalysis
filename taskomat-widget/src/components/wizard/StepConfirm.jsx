import Spinner from '../shared/Spinner'

export default function StepConfirm({ submitting, submitResult, onClose, onReset, isUpdate }) {
  if (submitting) {
    return (
      <div className="submitting-container">
        <Spinner size={32} />
        <p className="submitting-text">
          {isUpdate ? 'Aggiornamento progetto in corso...' : 'Creazione progetto in corso...'}
        </p>
      </div>
    )
  }

  if (submitResult?.success === false) {
    return (
      <div className="error-container anim-fade-in">
        <div className="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="error-title">{isUpdate ? 'Errore nell\'aggiornamento' : 'Errore nella creazione'}</h3>
        <p className="error-message">{submitResult.message}</p>
        <button className="btn btn-primary btn-md" onClick={onReset}>
          Riprova
        </button>
      </div>
    )
  }

  if (submitResult?.success) {
    return (
      <div className="confirm-container anim-fade-in">
        <div className="confirm-icon">
          <div className="anim-check">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 12L10 16L18 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <h3 className="confirm-title">{isUpdate ? 'Progetto aggiornato!' : 'Progetto creato!'}</h3>
        <p className="confirm-message">
          {isUpdate
            ? 'Le nuove workunit sono state aggiunte al progetto esistente.'
            : 'Il progetto è stato creato con successo e aggiunto alla lista dei tuoi progetti.'}
        </p>
        <div className="confirm-actions">
          <button className="btn btn-ghost btn-md" onClick={onReset}>
            Crea un altro
          </button>
          <button className="btn btn-primary btn-md" onClick={onClose}>
            Chiudi
          </button>
        </div>
      </div>
    )
  }

  return null
}
