import { useState } from 'react'
import { ChevronDown, ChevronRight, FlaskConical } from 'lucide-react'
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

export function NRTRow({ members, weeks, gridWidth, sprints, nrtAllocations, onNRTChange, color }: NRTRowProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const roleOrder: Record<string, number> = { PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }
  const qaMembers = members
    .filter((m) => m.role?.name === 'QA' || m.role?.name === 'QAA')
    .sort((a, b) => {
      const orderA = roleOrder[a.role?.name || ''] || 999
      const orderB = roleOrder[b.role?.name || ''] || 999
      return orderA - orderB
    })

  const getTotalNRT = (weekStart: string) => {
    const isFirstWeekOfSprint = sprints.some((sprint) => {
      const sprintStart = startOfWeek(new Date(sprint.start_date), { weekStartsOn: 1 })
      return format(sprintStart, 'yyyy-MM-dd') === weekStart
    })

    return qaMembers.reduce((sum, member) => {
      const nrt = nrtAllocations.find((n) => n.member_id === member.id && n.week_start === weekStart)?.days ?? (isFirstWeekOfSprint ? 2 : 0)
      return sum + nrt
    }, 0)
  }

  if (qaMembers.length === 0) return null

  return (
    <div className="timeline-section" style={{ color }}>
      <div className="flex timeline-section-header" style={{ backgroundColor: `${color}10` }}>
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => setIsExpanded(!isExpanded)} className="hover:opacity-70 transition-opacity" style={{ color }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <FlaskConical size={16} style={{ color }} />
          <div className="flex-1">
            <div className="text-sm font-bold cursor-help" style={{ color }} title="Non-Regression Testing">
              NRT
            </div>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px` }}>
          {weeks.map((week) => {
            const total = getTotalNRT(week.weekStart)
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

      {isExpanded && qaMembers.map((member) => (
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
  )
}
