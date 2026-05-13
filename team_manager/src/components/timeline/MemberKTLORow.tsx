import { Badge } from '@/components/ui/Badge'
import { AllocationCell } from './AllocationCell'
import type { TeamMember, WeekColumn, KTLOAllocation } from '@/types'

interface MemberKTLORowProps {
  member: TeamMember
  weeks: WeekColumn[]
  gridWidth: number
  ktloAllocations: KTLOAllocation[]
  onKTLOChange: (memberId: string, weekStart: string, days: number) => Promise<void>
  color: string
}

export function MemberKTLORow({
  member,
  weeks,
  gridWidth,
  ktloAllocations,
  onKTLOChange,
  color,
}: MemberKTLORowProps) {
  const getKTLO = (weekStart: string) => {
    const allocation = ktloAllocations.find(
      (k) => k.member_id === member.id && k.week_start === weekStart
    )
    // Default: 0.75 giorni se non specificato
    return allocation ? allocation.days : 0.75
  }

  // KTLO consigliato: 0.75 giorni
  const suggestedKTLO = 0.75

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
          const days = getKTLO(week.weekStart)

          return (
            <div
              key={week.weekStart}
              className={`border-r border-[var(--border-primary)] relative pointer-events-auto ${
                week.isCurrentWeek ? 'timeline-week-current' : ''
              }`}
              style={{ width: '72px', minWidth: '72px', height: '32px' }}
              title="KTLO - Keep The Lights On (default: 0.75 days, customizable)"
            >
              <AllocationCell
                value={days}
                isOverCapacity={false}
                onChange={(newValue) => onKTLOChange(member.id, week.weekStart, newValue)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
