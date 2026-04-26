import type { WeekColumn, TimeOff } from '@/types'

interface GlobalTimeOffRowProps {
  weeks: WeekColumn[]
  timeOffs: TimeOff[]
}

export function GlobalTimeOffRow({ weeks, timeOffs }: GlobalTimeOffRowProps) {
  const getTotalTimeOff = (weekStart: string) => {
    return timeOffs
      .filter((t) => t.week_start === weekStart)
      .reduce((sum, t) => sum + t.days, 0)
  }

  return (
    <div className="flex bg-[var(--warning)]10 border-t-2 border-[var(--warning)]">
      <div className="sticky left-0 w-[220px] bg-[var(--warning)]20 border-r border-[var(--border-primary)] px-4 py-3 flex items-center gap-3 z-10">
        <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
        <div>
          <div className="text-sm text-[var(--warning)] font-semibold">Ferie & Assenze</div>
          <div className="text-xs text-[var(--warning)] opacity-70 mt-0.5">
            Totale team
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {weeks.map((week) => {
          const total = getTotalTimeOff(week.weekStart)

          return (
            <div
              key={week.weekStart}
              className="border-r border-[var(--border-primary)] p-1 text-center bg-[var(--warning)]10"
              style={{ width: '72px', minWidth: '72px', height: '40px' }}
            >
              <span className="text-sm font-mono text-[var(--warning)] font-semibold leading-[32px]">
                {total > 0 ? total : ''}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
