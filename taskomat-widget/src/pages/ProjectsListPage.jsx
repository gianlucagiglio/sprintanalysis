import { useState } from 'react'
import { useTaskomat } from '../store/TaskomatContext'
import PageHeader from '../components/shared/PageHeader'
import EmptyState from '../components/shared/EmptyState'
import ProjectDetailModal from '../components/shared/ProjectDetailModal'

export default function ProjectsListPage({ onCreateClick }) {
  const { projects } = useTaskomat()
  const [selectedProject, setSelectedProject] = useState(null)

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (projects.length === 0) {
    return (
      <div className="page-wrapper">
        <PageHeader title="Progetti" subtitle="Tutti i progetti creati." />
        <div className="card">
          <EmptyState
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            }
            title="Nessun progetto"
            text="Non hai ancora creato nessun progetto. Crea il tuo primo progetto per vederlo qui."
          >
            <button
              className="btn btn-primary btn-md"
              onClick={onCreateClick}
            >
              Crea progetto
            </button>
          </EmptyState>
        </div>
      </div>
    )
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Progetti"
        subtitle={`${projects.length} progett${projects.length === 1 ? 'o' : 'i'} creat${projects.length === 1 ? 'o' : 'i'}`}
      />
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Progetto</th>
              <th>Budget vendita</th>
              <th>Budget sviluppo</th>
              <th>Workunit</th>
              <th>Task</th>
              <th>Creato il</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const totalTasks = p.workunits.reduce((s, wu) => s + wu.tasks.length, 0)
              return (
                <tr
                  key={p.id}
                  className="is-clickable"
                  onClick={() => setSelectedProject(p)}
                >
                  <td>
                    <span className="table-cell-name">{p.customer}</span>
                  </td>
                  <td>{p.project}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                    € {Number(p.budgetSale).toLocaleString('it-IT')}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                    € {Number(p.budgetDev).toLocaleString('it-IT')}
                  </td>
                  <td>{p.workunits.length}</td>
                  <td>{totalTasks}</td>
                  <td style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                    {formatDate(p.createdAt)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}
