import { Badge } from '@/components/ui/Badge'
import { TimeOffCell } from './TimeOffCell'
import type { TeamMember, WeekColumn, TimeOff } from '@/types'

interface MemberTimeOffRowProps {
  member: TeamMember
  weeks: WeekColumn[]
  gridWidth: number
  timeOffs: TimeOff[]
  onTimeOffChange: (memberId: string, weekStart: string, days: number) => Promise<void>
  color: string
}

export function MemberTimeOffRow({
  member,
  weeks,
  gridWidth,
  timeOffs,
  onTimeOffChange,
  color,
}: MemberTimeOffRowProps) {
  const getTimeOff = (weekStart: string) => {
    return (
      timeOffs.find((t) => t.member_id === member.id && t.week_start === weekStart)
        ?.days || 0
    )
  }

  // Verifica se il membro ha almeno una ferie
  const hasTimeOff = timeOffs.some((t) => t.member_id === member.id && t.days > 0)

  // Se non ha ferie, non mostrare la riga (opzionale - commentare per mostrare sempre)
  // if (!hasTimeOff) return null

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
          const days = getTimeOff(week.weekStart)

          return (
            <div
              key={week.weekStart}
              className={`border-r ${
                week.isCurrentWeek
                  ? 'border-[var(--accent-primary)] border-l-2 border-r-2 bg-[var(--accent-primary)]05'
                  : 'border-[var(--border-primary)] bg-[var(--bg-primary)]'
              }`}
              style={{ width: '72px', minWidth: '72px', height: '32px' }}
            >
              <TimeOffCell
                value={days}
                onChange={(newValue) => onTimeOffChange(member.id, week.weekStart, newValue)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
