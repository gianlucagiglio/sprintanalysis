import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
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

export function KTLORow({
  members,
  weeks,
  gridWidth,
  ktloAllocations,
  onKTLOChange,
  color,
}: KTLORowProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const getTotalKTLO = (weekStart: string) => {
    // Somma il KTLO di tutti i membri per questa settimana
    // Considera il default 1.5 per i membri senza allocazione salvata
    return members.reduce((sum, member) => {
      const ktlo =
        ktloAllocations.find(
          (k) => k.member_id === member.id && k.week_start === weekStart
        )?.days ?? 1.5
      return sum + ktlo
    }, 0)
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
            <div className="text-sm font-semibold" style={{ color }}>KTLO</div>
            <div className="text-xs mt-0.5" style={{ color, opacity: 0.7 }}>
              Keep The Lights On • 15% consigliato
            </div>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px`, borderTop: `2px solid ${color}` }}>
          {weeks.map((week) => {
            const total = getTotalKTLO(week.weekStart)

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
      )}
    </div>
  )
}
