import { ChevronDown, ChevronRight } from 'lucide-react'
import type { TeamMember, WeekColumn, Allocation, TimeOff, KTLOAllocation, NRTAllocation, Sprint } from '@/types'
import { startOfWeek, format } from 'date-fns'

interface CapacityRecapRowProps {
  members: TeamMember[]
  weeks: WeekColumn[]
  gridWidth: number
  sprints: Sprint[]
  allocations: Allocation[]
  timeOffs: TimeOff[]
  ktloAllocations: KTLOAllocation[]
  nrtAllocations: NRTAllocation[]
  color: string
  isExpanded: boolean
  onToggle: () => void
}

interface WeekBreakdown {
  features: number
  ktlo: number
  nrt: number
  timeOff: number
  total: number
  capacity: number
  isOverCapacity: boolean
}

export function CapacityRecapRow({
  members,
  weeks,
  gridWidth,
  sprints,
  allocations,
  timeOffs,
  ktloAllocations,
  nrtAllocations,
  color,
  isExpanded,
  onToggle,
}: CapacityRecapRowProps) {

  // Ordina membri per ruolo (stesso ordine timeline)
  const roleOrder: Record<string, number> = {
    PA: 1,
    PD: 2,
    BE: 3,
    FE: 4,
    QA: 5,
    QAA: 6,
  }

  const sortedMembers = [...members].sort((a, b) => {
    const roleA = a.role?.name || ''
    const roleB = b.role?.name || ''
    const orderA = roleOrder[roleA] || 999
    const orderB = roleOrder[roleB] || 999
    return orderA - orderB
  })

  const getWeekBreakdown = (member: TeamMember, weekStart: string): WeekBreakdown => {
    // Feature allocations
    const features = allocations
      .filter((a) => a.member_id === member.id && a.week_start === weekStart)
      .reduce((sum, a) => sum + a.days, 0)

    // KTLO (default 1.5)
    const ktlo =
      ktloAllocations.find((k) => k.member_id === member.id && k.week_start === weekStart)
        ?.days ?? 1.5

    // NRT (solo QA/QAA, default 2 su prima settimana sprint)
    const isQA = member.role?.name === 'QA' || member.role?.name === 'QAA'
    let nrt = 0
    if (isQA) {
      const allocation = nrtAllocations.find(
        (n) => n.member_id === member.id && n.week_start === weekStart
      )
      if (allocation) {
        nrt = allocation.days
      } else {
        // Check se prima settimana sprint per default 2
        const isFirstWeek = sprints.some((sprint) => {
          const sprintStart = startOfWeek(new Date(sprint.start_date), { weekStartsOn: 1 })
          return format(sprintStart, 'yyyy-MM-dd') === weekStart
        })
        nrt = isFirstWeek ? 2 : 0
      }
    }

    // Ferie
    const timeOff =
      timeOffs.find((t) => t.member_id === member.id && t.week_start === weekStart)?.days || 0

    const total = features + ktlo + nrt + timeOff
    const capacity = member.weekly_capacity
    const isOverCapacity = total > capacity

    return {
      features,
      ktlo,
      nrt,
      timeOff,
      total,
      capacity,
      isOverCapacity,
    }
  }

  // Calcola totale generale per settimana (tutti i membri)
  const getWeekTotal = (weekStart: string): number => {
    return sortedMembers.reduce((sum, member) => {
      const breakdown = getWeekBreakdown(member, weekStart)
      return sum + breakdown.total
    }, 0)
  }

  return (
    <div className="mb-4 border-b-2 border-[var(--border-primary)]">
      {/* Header */}
      <div className="flex" style={{ backgroundColor: `${color}10` }}>
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5 flex items-center gap-3">
          <button onClick={onToggle} className="hover:opacity-70 transition-opacity" style={{ color }}>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex-1">
            <div className="text-sm font-bold cursor-help" style={{ color }} title="Total weekly allocations">
              Capacity Summary
            </div>
          </div>
        </div>

        <div
          className="flex"
          style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px`, borderTop: `2px solid ${color}` }}
        >
          {weeks.map((week) => {
            const total = getWeekTotal(week.weekStart)
            return (
              <div
                key={week.weekStart}
                className={`border-r p-1 text-center flex items-center justify-center ${
                  week.isCurrentWeek
                    ? 'border-[var(--accent-primary)] border-l-2 border-r-2 bg-[var(--accent-primary)]10'
                    : 'border-[var(--border-primary)] bg-[var(--bg-primary)]'
                }`}
                style={{ width: '72px', minWidth: '72px', height: '40px' }}
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
                    {total.toFixed(2)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Member Rows */}
      {isExpanded && (
        <div className="bg-[var(--bg-secondary)]">
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className="group/row flex transition-colors border-t border-[var(--border-primary)]"
            >
              <div className="timeline-sticky-col bg-[var(--bg-primary)] group-hover/row:bg-[var(--bg-hover)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3 transition-colors">
                <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-primary)] font-medium">
                  {member.name}
                </span>
                {member.role && (
                  <span className="text-xs text-[var(--text-secondary)]">
                    {member.role.name}
                  </span>
                )}
              </div>

              <div
                className="flex group-hover/row:bg-[var(--bg-hover)] transition-colors pointer-events-none"
                style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}
              >
                {weeks.map((week) => {
                  const breakdown = getWeekBreakdown(member, week.weekStart)

                  return (
                    <div
                      key={week.weekStart}
                      className={`border-r relative group/cell pointer-events-auto ${
                        week.isCurrentWeek
                          ? 'border-[var(--accent-primary)] border-l-2 border-r-2'
                          : 'border-[var(--border-primary)]'
                      } ${
                        breakdown.isOverCapacity
                          ? 'bg-[var(--danger)]20'
                          : 'bg-[var(--success)]20'
                      }`}
                      style={{ width: '72px', minWidth: '72px', height: '32px' }}
                    >
                      {/* Total Value */}
                      <div className="flex items-center justify-center h-full">
                        <span
                          className={`text-xs font-mono font-semibold ${
                            breakdown.isOverCapacity
                              ? 'text-[var(--danger)]'
                              : 'text-[var(--success)]'
                          }`}
                        >
                          {breakdown.total > 0 ? breakdown.total.toFixed(2) : ''}
                        </span>
                      </div>

                      {/* Tooltip Breakdown */}
                      {breakdown.total > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/cell:block z-50">
                          <div className="bg-[var(--bg-elevated)] border border-[var(--border-primary)] rounded-lg shadow-lg p-3 text-xs whitespace-nowrap">
                            <div className="font-semibold text-[var(--text-primary)] mb-2 border-b border-[var(--border-primary)] pb-1">
                              {member.name} • {week.label}
                            </div>
                            <div className="space-y-1 text-[var(--text-secondary)]">
                              {breakdown.features > 0 && (
                                <div className="flex justify-between gap-4">
                                  <span>Feature:</span>
                                  <span className="font-mono text-[var(--text-primary)]">
                                    {breakdown.features.toFixed(2)} d
                                  </span>
                                </div>
                              )}
                              {breakdown.ktlo > 0 && (
                                <div className="flex justify-between gap-4">
                                  <span>KTLO:</span>
                                  <span className="font-mono text-[var(--text-primary)]">
                                    {breakdown.ktlo.toFixed(2)} d
                                  </span>
                                </div>
                              )}
                              {breakdown.nrt > 0 && (
                                <div className="flex justify-between gap-4">
                                  <span>NRT:</span>
                                  <span className="font-mono text-[var(--text-primary)]">
                                    {breakdown.nrt.toFixed(2)} d
                                  </span>
                                </div>
                              )}
                              {breakdown.timeOff > 0 && (
                                <div className="flex justify-between gap-4">
                                  <span>Time Off:</span>
                                  <span className="font-mono text-[var(--text-primary)]">
                                    {breakdown.timeOff.toFixed(2)} d
                                  </span>
                                </div>
                              )}
                              <div className="border-t border-[var(--border-primary)] pt-1 mt-1">
                                <div className="flex justify-between gap-4 font-semibold">
                                  <span>Total:</span>
                                  <span
                                    className={`font-mono ${
                                      breakdown.isOverCapacity
                                        ? 'text-[var(--danger)]'
                                        : 'text-[var(--success)]'
                                    }`}
                                  >
                                    {breakdown.total.toFixed(2)} d
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Capacity:</span>
                                  <span className="font-mono text-[var(--text-primary)]">
                                    {breakdown.capacity.toFixed(2)} d
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Remaining:</span>
                                  <span
                                    className={`font-mono ${
                                      breakdown.isOverCapacity
                                        ? 'text-[var(--danger)]'
                                        : 'text-[var(--success)]'
                                    }`}
                                  >
                                    {breakdown.isOverCapacity ? '-' : '+'}
                                    {Math.abs(breakdown.capacity - breakdown.total).toFixed(2)} d
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
