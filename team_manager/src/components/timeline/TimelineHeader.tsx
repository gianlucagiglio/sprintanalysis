import type { WeekColumn, SprintSpan } from '@/types'

interface TimelineHeaderProps {
  weeks: WeekColumn[]
  sprintSpans: SprintSpan[]
  gridWidth: number
}

export function TimelineHeader({ weeks, sprintSpans, gridWidth }: TimelineHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-[var(--bg-primary)]">
      {/* Sprint Row */}
      <div className="flex border-b border-[var(--border-primary)]">
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            Sprint
          </span>
        </div>

        <div className="flex bg-[var(--bg-primary)]" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
          {sprintSpans.map((span) => (
            <div
              key={span.sprint.id}
              className="border-r border-[var(--border-primary)] px-3 py-3 bg-[var(--bg-primary)]"
              style={{
                width: `${span.colSpan * 72}px`,
                minWidth: `${span.colSpan * 72}px`,
              }}
            >
              <div
                className="text-xs font-semibold px-2 py-1 rounded"
                style={{
                  backgroundColor: `var(--accent-primary)20`,
                  color: 'var(--accent-primary)',
                }}
              >
                {span.sprint.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Week Row */}
      <div className="flex border-b-2 border-[var(--border-secondary)]">
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            Settimana
          </span>
        </div>

        <div className="flex bg-[var(--bg-primary)]" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
          {weeks.map((week) => (
            <div
              key={week.weekStart}
              className="border-r border-[var(--border-primary)] px-2 py-2 text-center bg-[var(--bg-primary)]"
              style={{ width: '72px', minWidth: '72px' }}
            >
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                {week.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
