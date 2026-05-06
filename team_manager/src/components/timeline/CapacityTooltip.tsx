import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getCapacityInfo } from '@/lib/capacity'
import type { TeamMember, WeekColumn, Allocation, TimeOff, KTLOAllocation, Feature } from '@/types'

interface CapacityTooltipProps {
  member: TeamMember
  week: WeekColumn
  allAllocations: Allocation[]
  timeOffs: TimeOff[]
  ktloAllocations: KTLOAllocation[]
  features: Feature[]
}

export function CapacityTooltip({
  member,
  week,
  allAllocations,
  timeOffs,
  ktloAllocations,
  features,
}: CapacityTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const capacityInfo = getCapacityInfo(member, week.weekStart, allAllocations, timeOffs, ktloAllocations)

  if (!capacityInfo.isOverCapacity) return null

  // Trova le allocazioni per questo membro in questa settimana
  const weekAllocations = allAllocations.filter(
    (a) => a.member_id === member.id && a.week_start === week.weekStart
  )

  // Trova il KTLO per questo membro in questa settimana
  const ktlo =
    ktloAllocations.find((k) => k.member_id === member.id && k.week_start === week.weekStart)
      ?.days ?? 1.5

  // Calcola totale impegnato e eccedenza
  const totalUsed = capacityInfo.allocated + capacityInfo.timeOff + ktlo
  const overCapacity = totalUsed - capacityInfo.total

  return (
    <div
      className="absolute top-1 right-1 z-10"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <AlertTriangle size={12} className="text-[var(--danger)]" />

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-[var(--bg-secondary)] border-2 border-[var(--danger)] rounded-lg shadow-2xl p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[var(--danger)]" />
            <h4 className="font-semibold text-[var(--danger)] text-sm">
              ⚠️ Capacity Overload
            </h4>
          </div>

          <div className="space-y-3 text-xs">
            {/* Weekly Capacity */}
            <div className="flex justify-between items-center bg-[var(--bg-tertiary)] p-2 rounded">
              <span className="font-medium text-[var(--text-primary)]">Weekly capacity:</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {capacityInfo.total} days
              </span>
            </div>

            {/* Breakdown */}
            <div className="space-y-1.5">
              <div className="font-medium text-[var(--text-secondary)] mb-2">Usage:</div>

              {/* KTLO */}
              <div className="flex justify-between items-center pl-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent-secondary)]" />
                  <span className="text-[var(--text-secondary)]">KTLO (maintenance)</span>
                </div>
                <span className="font-mono text-[var(--accent-secondary)]">
                  {ktlo} days
                </span>
              </div>

              {/* Time Off */}
              {capacityInfo.timeOff > 0 && (
                <div className="flex justify-between items-center pl-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                    <span className="text-[var(--text-secondary)]">Time Off/Absences</span>
                  </div>
                  <span className="font-mono text-[var(--warning)]">
                    {capacityInfo.timeOff} days
                  </span>
                </div>
              )}

              {/* Allocazioni Feature */}
              {weekAllocations.length > 0 && (
                <div className="border-l-2 border-[var(--border-primary)] pl-3 ml-1 space-y-1">
                  <div className="text-[var(--text-secondary)] font-medium">Feature:</div>
                  {weekAllocations.map((alloc) => {
                    const feature = features.find((f) => f.id === alloc.feature_id)
                    return (
                      <div key={alloc.id} className="flex justify-between items-center pl-2">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: feature?.color || '#gray' }}
                          />
                          <span className="text-[var(--text-secondary)] truncate text-xs">
                            {feature?.name || 'Unknown'}
                          </span>
                        </div>
                        <span className="font-mono text-[var(--text-primary)] ml-2 flex-shrink-0">
                          {alloc.days} days
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="border-t-2 border-[var(--border-primary)] pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[var(--text-secondary)]">Total allocated:</span>
                <span className="font-mono font-semibold text-[var(--text-primary)]">
                  {totalUsed.toFixed(1)} days
                </span>
              </div>

              <div className="flex justify-between items-center bg-[var(--danger)]10 p-2 rounded">
                <span className="font-semibold text-[var(--danger)]">🔴 Overload:</span>
                <span className="font-mono font-bold text-[var(--danger)]">
                  +{overCapacity.toFixed(1)} days
                </span>
              </div>

              <div className="text-[10px] text-[var(--text-tertiary)] italic mt-2">
                Reduce allocations or KTLO to stay within available capacity
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
