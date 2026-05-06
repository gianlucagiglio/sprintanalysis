import type { WeekColumn, SprintSpan } from '@/types'

interface TimelineHeaderProps {
  weeks: WeekColumn[]
  sprintSpans: SprintSpan[]
  gridWidth: number
}

export function TimelineHeader({ weeks, sprintSpans, gridWidth }: TimelineHeaderProps) {
  return (
    <div className="timeline-header">
      {/* Sprint Row */}
      <div className="flex border-b border-[var(--border-primary)]">
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            Sprint
          </span>
        </div>
        <div className="flex" style={{ width: `${gridWidth}px` }}>
          {sprintSpans.map((span) => (
            <div
              key={span.sprint.id}
              className="border-r border-[var(--border-primary)] px-3 py-2.5 text-center"
              style={{ width: `${span.colSpan * 72}px` }}
            >
              <span className="timeline-sprint-badge">{span.sprint.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Week Row */}
      <div className="flex border-b border-[var(--border-secondary)]">
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            Week
          </span>
        </div>
        <div className="flex" style={{ width: `${gridWidth}px` }}>
          {weeks.map((week) => (
            <div
              key={week.weekStart}
              className={`relative border-r border-[var(--border-primary)] px-2 py-2 text-center transition-colors ${
                week.isCurrentWeek ? 'timeline-week-current' : ''
              }`}
              style={{ width: '72px' }}
            >
              <span className={`text-xs font-medium ${
                week.isCurrentWeek ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)]'
              }`}>
                {week.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
