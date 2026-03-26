import PreviewSection from '../preview/PreviewSection'
import PreviewWorkunitList from '../preview/PreviewWorkunitList'

export default function ProjectDetailModal({ project, onClose }) {
  const totalTasks = project.workunits.reduce((s, wu) => s + wu.tasks.length, 0)
  const totalHours = project.workunits.reduce(
    (sum, wu) => sum + wu.tasks.reduce((s, t) => s + (Number(t.estimatedTime) || 0), 0),
    0
  )

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="wizard-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="wizard-modal" style={{ maxWidth: 640 }}>
        <button className="wizard-modal-close" onClick={onClose} title="Chiudi">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div className="detail-modal">
          <div className="detail-modal-header">
            <h2 className="detail-modal-title">{project.project}</h2>
            <span className="detail-modal-subtitle">{project.customer}</span>
          </div>
          <div className="detail-modal-body">
            <div className="detail-grid">
              <PreviewSection label="Cliente" value={project.customer} />
              <PreviewSection label="Progetto" value={project.project} />
              <PreviewSection
                label="Budget vendita"
                value={`€ ${Number(project.budgetSale).toLocaleString('it-IT')}`}
                mono
              />
              <PreviewSection
                label="Budget sviluppo"
                value={`€ ${Number(project.budgetDev).toLocaleString('it-IT')}`}
                mono
              />
              <PreviewSection label="Workunit" value={project.workunits.length} />
              <PreviewSection label="Task totali" value={totalTasks} />
              <PreviewSection label="Ore stimate totali" value={`${totalHours}h`} mono />
            </div>
            <div className="detail-section">
              <PreviewWorkunitList workunits={project.workunits} />
            </div>
            <div className="detail-meta">
              <span>Creato il {formatDate(project.createdAt)}</span>
              <span className="detail-meta-id">{project.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
