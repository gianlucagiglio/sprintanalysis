import { useState } from 'react'
import { ChevronDown, ChevronRight, Palmtree } from 'lucide-react'
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

export function GlobalTimeOffRow({ members, weeks, gridWidth, timeOffs, onTimeOffChange, color }: GlobalTimeOffRowProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getTotalTimeOff = (weekStart: string) => {
    return timeOffs.filter((t) => t.week_start === weekStart).reduce((sum, t) => sum + t.days, 0)
  }

  return (
    <div className="timeline-section" style={{ color }}>
      <div className="flex timeline-section-header" style={{ backgroundColor: `${color}10` }}>
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => setIsExpanded(!isExpanded)} className="hover:opacity-70 transition-opacity" style={{ color }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <Palmtree size={16} style={{ color }} />
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color }}>Ferie & Assenze</div>
            <div className="text-xs opacity-70" style={{ color }}>Dettaglio per persona</div>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px` }}>
          {weeks.map((week) => {
            const total = getTotalTimeOff(week.weekStart)
            return (
              <div
                key={week.weekStart}
                className={`border-r border-[var(--border-primary)] p-1 text-center ${
                  week.isCurrentWeek ? 'timeline-week-current' : ''
                }`}
                style={{ width: '72px', height: '36px' }}
              >
                <span className="text-sm font-mono font-semibold" style={{ color }}>
                  {total > 0 ? total : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>

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
