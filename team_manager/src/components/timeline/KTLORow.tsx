import { useState } from 'react'
import { ChevronDown, ChevronRight, Wrench } from 'lucide-react'
import { MemberKTLORow } from './MemberKTLORow'
import type { TeamMember, WeekColumn, KTLOAllocation } from '@/types'

interface KTLORowProps {
  members: TeamMember[]
  weeks: WeekColumn[]
  gridWidth: number
  ktloAllocations: KTLOAllocation[]
  onKTLOChange: (memberId: string, weekStart: string, days: number) => Promise<void>
  color: string
}

export function KTLORow({ members, weeks, gridWidth, ktloAllocations, onKTLOChange, color }: KTLORowProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getTotalKTLO = (weekStart: string) => {
    return members.reduce((sum, member) => {
      const ktlo = ktloAllocations.find((k) => k.member_id === member.id && k.week_start === weekStart)?.days ?? 1.5
      return sum + ktlo
    }, 0)
  }

  return (
    <div className="timeline-section" style={{ color }}>
      <div className="flex timeline-section-header" style={{ backgroundColor: `${color}10` }}>
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5 flex items-center gap-3">
          <button onClick={() => setIsExpanded(!isExpanded)} className="hover:opacity-70 transition-opacity" style={{ color }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <Wrench size={16} style={{ color }} />
          <div className="flex-1">
            <div className="text-sm font-bold" style={{ color }}>KTLO</div>
            <div className="text-xs opacity-70" style={{ color }}>Keep The Lights On</div>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px` }}>
          {weeks.map((week) => {
            const total = getTotalKTLO(week.weekStart)
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

      {isExpanded && members.map((member) => (
        <MemberKTLORow
          key={member.id}
          member={member}
          weeks={weeks}
          gridWidth={gridWidth}
          ktloAllocations={ktloAllocations}
          onKTLOChange={onKTLOChange}
          color={color}
        />
      ))}
    </div>
  )
}
