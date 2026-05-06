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
  isExpanded: boolean
  onToggle: () => void
}

export function GlobalTimeOffRow({ members, weeks, gridWidth, timeOffs, onTimeOffChange, color, isExpanded, onToggle }: GlobalTimeOffRowProps) {

  const roleOrder: Record<string, number> = { PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }
  const sortedMembers = [...members].sort((a, b) => {
    const orderA = roleOrder[a.role?.name || ''] || 999
    const orderB = roleOrder[b.role?.name || ''] || 999
    return orderA - orderB
  })

  const getTotalTimeOff = (weekStart: string) => {
    return timeOffs.filter((t) => t.week_start === weekStart).reduce((sum, t) => sum + t.days, 0)
  }

  return (
    <div className="timeline-section" style={{ color }}>
      <div className="flex timeline-section-header" style={{ backgroundColor: `${color}10` }}>
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5 flex items-center gap-3">
          <button onClick={onToggle} className="hover:opacity-70 transition-opacity" style={{ color }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <Palmtree size={16} style={{ color }} />
          <div className="flex-1">
            <div className="text-sm font-bold cursor-help" style={{ color }} title="Detail per person">
              Time Off & Absences
            </div>
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
                {total > 0 && (
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                      border: `1px solid ${color}40`,
                    }}
                  >
                    {total}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {isExpanded && (
        <div className="bg-[var(--bg-secondary)]">
          {sortedMembers.map((member) => (
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
