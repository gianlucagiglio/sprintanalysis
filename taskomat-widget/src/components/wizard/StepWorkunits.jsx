import { useRef, useEffect } from 'react'
import WorkunitCard from '../forms/WorkunitCard'
import { ACTION } from '../../utils/constants'

export default function StepWorkunits({ formData, errors, dispatch }) {
  const lastAddRef = useRef(null)

  useEffect(() => {
    if (!lastAddRef.current) return
    const action = lastAddRef.current
    lastAddRef.current = null

    const cards = document.querySelectorAll('.workunit-card')
    if (action.type === 'workunit') {
      const lastCard = cards[cards.length - 1]
      lastCard?.querySelector('.workunit-card-header .form-input')?.focus()
    } else if (action.type === 'task') {
      const card = cards[action.wIndex]
      const rows = card?.querySelectorAll('.task-row')
      const lastRow = rows?.[rows.length - 1]
      lastRow?.querySelector('.task-row-name .form-input')?.focus()
    }
  })

  const handleUpdateName = (wIndex, value) => {
    dispatch({ type: ACTION.UPDATE_WORKUNIT_NAME, wIndex, value })
  }

  const handleUpdateTask = (wIndex, tIndex, field, value) => {
    dispatch({ type: ACTION.UPDATE_TASK_FIELD, wIndex, tIndex, field, value })
  }

  const handleAddTask = (wIndex) => {
    dispatch({ type: ACTION.ADD_TASK, wIndex })
    lastAddRef.current = { type: 'task', wIndex }
  }

  const handleRemoveTask = (wIndex, tIndex) => {
    dispatch({ type: ACTION.REMOVE_TASK, wIndex, tIndex })
  }

  const handleRemoveWorkunit = (wIndex) => {
    dispatch({ type: ACTION.REMOVE_WORKUNIT, wIndex })
  }

  const handleAddWorkunit = () => {
    dispatch({ type: ACTION.ADD_WORKUNIT })
    lastAddRef.current = { type: 'workunit' }
  }

  return (
    <div className="step-content">
      <h2 className="step-title">Workunit e Task</h2>
      <p className="step-description">
        Aggiungi le workunit del progetto. Ogni workunit contiene uno o più task con le relative ore stimate.
      </p>

      {errors.workunits && (
        <div className="form-error-banner" style={{ marginBottom: 16 }}>
          <svg viewBox="0 0 18 18" fill="none" width="18" height="18">
            <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.2" />
            <path d="M9 5v4.5M9 12.5v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="form-error-banner-text">{errors.workunits}</span>
        </div>
      )}

      {formData.workunits.map((wu, wIdx) => (
        <WorkunitCard
          key={wIdx}
          workunit={wu}
          index={wIdx}
          errors={errors}
          onUpdateName={handleUpdateName}
          onUpdateTask={handleUpdateTask}
          onAddTask={handleAddTask}
          onRemoveTask={handleRemoveTask}
          onRemove={handleRemoveWorkunit}
          canRemove={formData.workunits.length > 1}
        />
      ))}

      <button
        type="button"
        className="add-button add-workunit-btn"
        onClick={handleAddWorkunit}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Aggiungi workunit
      </button>
    </div>
  )
}
