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
  color: string
}

export function GlobalTimeOffRow({
  members,
  weeks,
  gridWidth,
  timeOffs,
  onTimeOffChange,
  color,
}: GlobalTimeOffRowProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getTotalTimeOff = (weekStart: string) => {
    return timeOffs
      .filter((t) => t.week_start === weekStart)
      .reduce((sum, t) => sum + t.days, 0)
  }

  return (
    <div style={{ borderTop: `2px solid ${color}` }}>
      {/* Header Row */}
      <div className="flex" style={{ backgroundColor: `${color}1A` }}>
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:opacity-70 transition-opacity"
            style={{ color }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <div className="flex-1">
            <div className="text-sm font-semibold" style={{ color }}>Ferie & Assenze</div>
            <div className="text-xs mt-0.5" style={{ color, opacity: 0.7 }}>
              Dettaglio per persona
            </div>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px`, borderTop: `2px solid ${color}` }}>
          {weeks.map((week) => {
            const total = getTotalTimeOff(week.weekStart)

            return (
              <div
                key={week.weekStart}
                className={`border-r p-1 text-center ${
                  week.isCurrentWeek
                    ? 'border-[var(--accent-primary)] border-l-2 border-r-2 bg-[var(--accent-primary)]05'
                    : 'border-[var(--border-primary)] bg-[var(--bg-primary)]'
                }`}
                style={{ width: '72px', minWidth: '72px', height: '40px' }}
              >
                <span className="text-sm font-mono font-semibold leading-[32px]" style={{ color }}>
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
              color={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}
