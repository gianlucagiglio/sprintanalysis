import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { MemberNRTRow } from './MemberNRTRow'
import type { TeamMember, WeekColumn, NRTAllocation, Sprint } from '@/types'
import { startOfWeek, format } from 'date-fns'

interface NRTRowProps {
  members: TeamMember[]
  weeks: WeekColumn[]
  gridWidth: number
  sprints: Sprint[]
  nrtAllocations: NRTAllocation[]
  onNRTChange: (memberId: string, weekStart: string, days: number) => Promise<void>
  color: string
}

export function NRTRow({
  members,
  weeks,
  gridWidth,
  sprints,
  nrtAllocations,
  onNRTChange,
  color,
}: NRTRowProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  // Filtra solo membri QA e QAA
  const qaMembers = members.filter((m) =>
    m.role?.name === 'QA' || m.role?.name === 'QAA'
  )

  const getTotalNRT = (weekStart: string) => {
    // Controlla se questa settimana è la prima di uno sprint
    const isFirstWeekOfSprint = sprints.some((sprint) => {
      const sprintStart = startOfWeek(new Date(sprint.start_date), { weekStartsOn: 1 })
      const sprintStartStr = format(sprintStart, 'yyyy-MM-dd')
      return sprintStartStr === weekStart
    })

    // Somma il NRT di tutti i QA/QAA per questa settimana
    return qaMembers.reduce((sum, member) => {
      const nrt =
        nrtAllocations.find(
          (n) => n.member_id === member.id && n.week_start === weekStart
        )?.days ?? (isFirstWeekOfSprint ? 2 : 0)
      return sum + nrt
    }, 0)
  }

  // Se non ci sono QA/QAA, non mostrare la riga
  if (qaMembers.length === 0) return null

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
            <div className="text-sm font-semibold" style={{ color }}>NRT</div>
            <div className="text-xs mt-0.5" style={{ color, opacity: 0.7 }}>
              Non-Regression Testing • Solo QA/QAA
            </div>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px`, borderTop: `2px solid ${color}` }}>
          {weeks.map((week) => {
            const total = getTotalNRT(week.weekStart)

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
          {qaMembers.map((member) => (
            <MemberNRTRow
              key={member.id}
              member={member}
              weeks={weeks}
              gridWidth={gridWidth}
              sprints={sprints}
              nrtAllocations={nrtAllocations}
              onNRTChange={onNRTChange}
              color={color}
            />
          ))}
        </div>
      )}
    </div>
  )
}
