import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { MemberTimeOffRow } from './MemberTimeOffRow'
import type { TeamMember, WeekColumn, TimeOff } from '@/types'

interface GlobalTimeOffRowProps {
  members: TeamMember[]
  weeks: WeekColumn[]
  gridWidth: number
  timeOffs: TimeOff[]
  onTimeOffChange: (memberId: string, weekStart: string, days: number) => Promise<void>
}

export function GlobalTimeOffRow({
  members,
  weeks,
  gridWidth,
  timeOffs,
  onTimeOffChange,
}: GlobalTimeOffRowProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getTotalTimeOff = (weekStart: string) => {
    return timeOffs
      .filter((t) => t.week_start === weekStart)
      .reduce((sum, t) => sum + t.days, 0)
  }

  return (
    <div className="border-t-2 border-[var(--warning)]">
      {/* Header Row */}
      <div className="flex bg-[var(--warning)]10">
        <div className="timeline-sticky-col sticky left-0 bg-[var(--warning)]20 border-r border-[var(--border-primary)] px-4 py-3 flex items-center gap-3 z-10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[var(--warning)] hover:opacity-70 transition-opacity"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
          <div className="flex-1">
            <div className="text-sm text-[var(--warning)] font-semibold">Ferie & Assenze</div>
            <div className="text-xs text-[var(--warning)] opacity-70 mt-0.5">
              Dettaglio per persona
            </div>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
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

      {/* Member Rows */}
      {isExpanded && (
        <div className="bg-[var(--bg-secondary)]">
          {members.map((member) => (
            <MemberTimeOffRow
              key={member.id}
              member={member}
              weeks={weeks}
              gridWidth={gridWidth}
              timeOffs={timeOffs}
              onTimeOffChange={onTimeOffChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
