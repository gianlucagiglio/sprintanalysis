import { Badge } from '@/components/ui/Badge'
import { AllocationCell } from './AllocationCell'
import type { TeamMember, WeekColumn, NRTAllocation, Sprint } from '@/types'
import { startOfWeek, format } from 'date-fns'

interface MemberNRTRowProps {
  member: TeamMember
  weeks: WeekColumn[]
  gridWidth: number
  sprints: Sprint[]
  nrtAllocations: NRTAllocation[]
  onNRTChange: (memberId: string, weekStart: string, days: number) => Promise<void>
  color: string
}

export function MemberNRTRow({
  member,
  weeks,
  gridWidth,
  sprints,
  nrtAllocations,
  onNRTChange,
  color,
}: MemberNRTRowProps) {
  const getNRT = (weekStart: string) => {
    const allocation = nrtAllocations.find(
      (n) => n.member_id === member.id && n.week_start === weekStart
    )

    // Se esiste un'allocazione salvata, usala
    if (allocation) return allocation.days

    // Altrimenti, se questa è la prima settimana di uno sprint, usa default 2
    const isFirstWeekOfSprint = sprints.some((sprint) => {
      const sprintStart = startOfWeek(new Date(sprint.start_date), { weekStartsOn: 1 })
      const sprintStartStr = format(sprintStart, 'yyyy-MM-dd')
      return sprintStartStr === weekStart
    })

    return isFirstWeekOfSprint ? 2 : 0
  }

  return (
    <div className="group flex transition-colors border-t border-[var(--border-primary)]">
      <div className="timeline-sticky-col bg-[var(--bg-primary)] group-hover:bg-[var(--bg-hover)] border-r border-[var(--border-primary)] pointer-events-auto px-4 py-2 flex items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm text-[var(--text-secondary)]">{member.name}</span>
        </div>
        {member.role && (
          <Badge label={member.role.name} color={member.role.color} small />
        )}
      </div>

      <div className="flex group-hover:bg-[var(--bg-hover)] transition-colors pointer-events-none" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
        {weeks.map((week) => {
          const days = getNRT(week.weekStart)

          return (
            <div
              key={week.weekStart}
              className={`border-r border-[var(--border-primary)] relative pointer-events-auto ${
                week.isCurrentWeek ? 'timeline-week-current' : ''
              }`}
              style={{ width: '72px', minWidth: '72px', height: '32px' }}
              title="NRT - Non-Regression Testing (default: 2 days on sprint first week)"
            >
              <AllocationCell
                value={days}
                isOverCapacity={false}
                onChange={(newValue) => onNRTChange(member.id, week.weekStart, newValue)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
