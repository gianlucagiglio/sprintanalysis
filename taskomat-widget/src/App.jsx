import { useState, useEffect } from 'react'
import { useTaskomat } from './store/TaskomatContext'
import ProjectsListPage from './pages/ProjectsListPage'
import ProjectWizard from './components/widget/ProjectWizard'

function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <button className="theme-toggle" onClick={() => setDark(!dark)} title="Cambia tema">
      {dark ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.17 3.17L4.23 4.23M11.77 11.77L12.83 12.83M3.17 12.83L4.23 11.77M11.77 4.23L12.83 3.17" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M14 9.68A6.5 6.5 0 016.32 2 6.5 6.5 0 108 14.5a6.47 6.47 0 006-4.82z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

export default function App() {
  const { projects } = useTaskomat()
  const [wizardOpen, setWizardOpen] = useState(false)

  return (
    <div className="app-shell">
      <nav className="app-navbar">
        <div className="app-navbar-brand">
          <div className="app-navbar-logo">
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="app-navbar-title">Taskomat</span>
        </div>
        <div className="app-navbar-nav">
          <button className="app-navbar-link is-active">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5H12M2 7H12M2 10.5H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
            Progetti
            {projects.length > 0 && (
              <span className="tab-badge tab-badge--primary" style={{ marginLeft: 4 }}>
                {projects.length}
              </span>
            )}
          </button>
        </div>
        <div className="app-navbar-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setWizardOpen(true)}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}>
              <path d="M6 1.5V10.5M1.5 6H10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Nuovo progetto
          </button>
          <ThemeToggle />
        </div>
      </nav>

      <ProjectsListPage onCreateClick={() => setWizardOpen(true)} />

      {wizardOpen && (
        <ProjectWizard onClose={() => setWizardOpen(false)} />
      )}
    </div>
  )
}
