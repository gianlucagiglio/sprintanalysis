export default function TaskRow({ task, errors, wIndex, tIndex, onUpdate, onRemove, canRemove }) {
  const nameError = errors[`workunits.${wIndex}.tasks.${tIndex}.name`]
  const hoursError = errors[`workunits.${wIndex}.tasks.${tIndex}.estimatedTime`]

  return (
    <div className="task-row">
      <div className="task-row-name">
        <input
          type="text"
          className={`form-input${nameError ? ' is-error' : ''}`}
          placeholder="Nome task"
          value={task.name}
          onChange={(e) => onUpdate(wIndex, tIndex, 'name', e.target.value)}
        />
        {nameError && (
          <div className="form-message form-message--error">{nameError}</div>
        )}
      </div>
      <div className="task-row-hours">
        <input
          type="number"
          className={`form-input${hoursError ? ' is-error' : ''}`}
          placeholder="Ore"
          min="0"
          step="0.5"
          value={task.estimatedTime}
          onChange={(e) => onUpdate(wIndex, tIndex, 'estimatedTime', e.target.value)}
        />
        {hoursError && (
          <div className="form-message form-message--error">{hoursError}</div>
        )}
      </div>
      {canRemove && (
        <button
          type="button"
          className="task-row-remove"
          onClick={() => onRemove(wIndex, tIndex)}
          title="Rimuovi task"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
