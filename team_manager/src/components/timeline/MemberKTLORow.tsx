import { Badge } from '@/components/ui/Badge'
import { AllocationCell } from './AllocationCell'
import type { TeamMember, WeekColumn, KTLOAllocation } from '@/types'

interface MemberKTLORowProps {
  member: TeamMember
  weeks: WeekColumn[]
  ktloAllocations: KTLOAllocation[]
  onKTLOChange: (memberId: string, weekStart: string, days: number) => Promise<void>
}

export function MemberKTLORow({
  member,
  weeks,
  ktloAllocations,
  onKTLOChange,
}: MemberKTLORowProps) {
  const getKTLO = (weekStart: string) => {
    const allocation = ktloAllocations.find(
      (k) => k.member_id === member.id && k.week_start === weekStart
    )
    // Default: 1.5 giorni se non specificato
    return allocation ? allocation.days : 1.5
  }

  // KTLO consigliato: 1.5 giorni
  const suggestedKTLO = 1.5

  return (
    <div className="flex hover:bg-[var(--bg-hover)] transition-colors border-t border-[var(--border-primary)]">
      <div className="sticky left-0 w-[220px] bg-[var(--bg-primary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3 z-10">
        <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]" />
        <span className="text-sm text-[var(--text-secondary)]">{member.name}</span>
        {member.role && (
          <Badge label={member.role.name} color={member.role.color} small />
        )}
      </div>

      <div className="flex-1 flex">
        {weeks.map((week) => {
          const days = getKTLO(week.weekStart)

          return (
            <div
              key={week.weekStart}
              className="border-r border-[var(--border-primary)]"
              style={{ width: '72px', minWidth: '72px', height: '32px' }}
              title="KTLO - Keep The Lights On (default: 1.5 giorni, personalizzabile)"
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
