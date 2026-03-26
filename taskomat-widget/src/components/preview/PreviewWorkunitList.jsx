export default function PreviewWorkunitList({ workunits }) {
  return (
    <div className="preview-wu-list">
      {workunits.map((wu, wIdx) => {
        const wuHours = wu.tasks.reduce((s, t) => s + (Number(t.estimatedTime) || 0), 0)
        return (
          <div key={wIdx} className="preview-wu">
            <div className="preview-wu-header">
              <span className="preview-wu-badge">{wIdx + 1}</span>
              <span className="preview-wu-name">{wu.name}</span>
              <span className="preview-wu-hours">{wuHours}h</span>
            </div>
            <div className="preview-wu-tasks">
              {wu.tasks.map((task, tIdx) => (
                <div key={tIdx} className="preview-wu-task">
                  <span className="preview-wu-task-dot" />
                  <span className="preview-wu-task-name">{task.name}</span>
                  <span className="preview-wu-task-hours">
                    {Number(task.estimatedTime)}h
                  </span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
