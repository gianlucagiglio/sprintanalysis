import PreviewWorkunitList from '../preview/PreviewWorkunitList'

export default function StepPreview({ formData }) {
  const totalHours = formData.workunits.reduce(
    (sum, wu) => sum + wu.tasks.reduce((s, t) => s + (Number(t.estimatedTime) || 0), 0),
    0
  )
  const totalTasks = formData.workunits.reduce((sum, wu) => sum + wu.tasks.length, 0)
  const isUpdate = !!formData.existingProjectId

  return (
    <div className="step-content">
      <h2 className="step-title">Riepilogo</h2>
      <p className="step-description">
        {isUpdate
          ? 'Le nuove workunit verranno aggiunte al progetto esistente.'
          : 'Verifica i dati del progetto prima di procedere alla creazione.'}
      </p>

      <div className="preview-hero">
        <div className="preview-hero-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="preview-hero-text">
          <span className="preview-hero-customer">{formData.customer}</span>
          <span className="preview-hero-project">{formData.project}</span>
        </div>
      </div>

      <div className="preview-stats">
        <div className="preview-stat">
          <span className="preview-stat-label">Budget vendita</span>
          <span className="preview-stat-value preview-stat-value--mono">
            € {Number(formData.budgetSale).toLocaleString('it-IT')}
          </span>
        </div>
        <div className="preview-stat">
          <span className="preview-stat-label">Budget sviluppo</span>
          <span className="preview-stat-value preview-stat-value--mono">
            € {Number(formData.budgetDev).toLocaleString('it-IT')}
          </span>
        </div>
        <div className="preview-stat">
          <span className="preview-stat-label">Workunit</span>
          <span className="preview-stat-value">{formData.workunits.length}</span>
        </div>
        <div className="preview-stat">
          <span className="preview-stat-label">Task</span>
          <span className="preview-stat-value">{totalTasks}</span>
        </div>
        <div className="preview-stat">
          <span className="preview-stat-label">Ore stimate</span>
          <span className="preview-stat-value preview-stat-value--mono">{totalHours}h</span>
        </div>
      </div>

      <div className="preview-divider" />

      <PreviewWorkunitList workunits={formData.workunits} />
    </div>
  )
}
