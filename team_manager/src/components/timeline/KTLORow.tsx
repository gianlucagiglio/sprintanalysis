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
}

export function KTLORow({
  members,
  weeks,
  gridWidth,
  ktloAllocations,
  onKTLOChange,
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
    <div className="border-t-2 border-[var(--accent-secondary)]">
      {/* Header Row */}
      <div className="flex bg-[var(--accent-secondary)]10">
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[var(--accent-secondary)] hover:opacity-70 transition-opacity"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]" />
          <div className="flex-1">
            <div className="text-sm text-[var(--accent-secondary)] font-semibold">KTLO</div>
            <div className="text-xs text-[var(--accent-secondary)] opacity-70 mt-0.5">
              Keep The Lights On • 15% consigliato
            </div>
          </div>
        </div>

        <div className="flex border-t-2 border-[var(--accent-secondary)]" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
          {weeks.map((week) => {
            const total = getTotalKTLO(week.weekStart)

            return (
              <div
                key={week.weekStart}
                className="border-r border-[var(--border-primary)] p-1 text-center bg-[var(--accent-secondary)]10"
                style={{ width: '72px', minWidth: '72px', height: '40px' }}
              >
                <span className="text-sm font-mono text-[var(--accent-secondary)] font-semibold leading-[32px]">
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
