import type { WeekColumn, SprintSpan } from '@/types'

interface GanttHeaderProps {
  weeks: WeekColumn[]
  sprintSpans: SprintSpan[]
  gridWidth: number
}

export function GanttHeader({ weeks, sprintSpans, gridWidth }: GanttHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-[var(--bg-primary)]">
      {/* Sprint Row */}
      <div className="flex border-b border-[var(--border-primary)]">
        <div className="w-[280px] min-w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            Feature
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
        <div className="w-[280px] min-w-[280px] bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center">
          <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
            Settimana
          </span>
        </div>

        <div className="flex bg-[var(--bg-primary)]" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
          {weeks.map((week) => (
            <div
              key={week.weekStart}
              className={`border-r px-2 py-2 text-center ${
                week.isCurrentWeek
                  ? 'border-[var(--accent-primary)] border-l-2 border-r-2 bg-[var(--accent-primary)]10'
                  : 'border-[var(--border-primary)] bg-[var(--bg-primary)]'
              }`}
              style={{ width: '72px', minWidth: '72px' }}
            >
              <span className={`text-xs font-medium ${
                week.isCurrentWeek
                  ? 'text-[var(--accent-primary)] font-semibold'
                  : 'text-[var(--text-secondary)]'
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
