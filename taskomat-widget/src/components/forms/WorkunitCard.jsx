import TaskRow from './TaskRow'

export default function WorkunitCard({
  workunit,
  index,
  errors,
  onUpdateName,
  onUpdateTask,
  onAddTask,
  onRemoveTask,
  onRemove,
  canRemove,
}) {
  const nameError = errors[`workunits.${index}.name`]
  const tasksError = errors[`workunits.${index}.tasks`]

  return (
    <div className="workunit-card">
      <div className="workunit-card-header">
        <span className="workunit-badge">{index + 1}</span>
        <input
          type="text"
          className={`form-input${nameError ? ' is-error' : ''}`}
          placeholder="Nome workunit"
          value={workunit.name}
          onChange={(e) => onUpdateName(index, e.target.value)}
        />
        {canRemove && (
          <button
            type="button"
            className="workunit-remove"
            onClick={() => onRemove(index)}
            title="Rimuovi workunit"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
      {nameError && (
        <div style={{ padding: '0 16px' }}>
          <div className="form-message form-message--error">{nameError}</div>
        </div>
      )}
      <div className="workunit-card-body">
        {tasksError && (
          <div className="form-message form-message--error" style={{ marginBottom: 8 }}>
            {tasksError}
          </div>
        )}
        {workunit.tasks.map((task, tIdx) => (
          <TaskRow
            key={tIdx}
            task={task}
            errors={errors}
            wIndex={index}
            tIndex={tIdx}
            onUpdate={onUpdateTask}
            onRemove={onRemoveTask}
            canRemove={workunit.tasks.length > 1}
          />
        ))}
        <button
          type="button"
          className="add-button add-task-btn"
          onClick={() => onAddTask(index)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Aggiungi task
        </button>
      </div>
    </div>
  )
}
