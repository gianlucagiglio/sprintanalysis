import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { getCapacityInfo } from '@/lib/capacity'
import type { TeamMember, WeekColumn, Allocation, TimeOff, Feature } from '@/types'

interface CapacityTooltipProps {
  member: TeamMember
  week: WeekColumn
  allAllocations: Allocation[]
  timeOffs: TimeOff[]
  features: Feature[]
}

export function CapacityTooltip({
  member,
  week,
  allAllocations,
  timeOffs,
  features,
}: CapacityTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const capacityInfo = getCapacityInfo(member, week.weekStart, allAllocations, timeOffs)

  if (!capacityInfo.isOverCapacity) return null

  // Trova le allocazioni per questo membro in questa settimana
  const weekAllocations = allAllocations.filter(
    (a) => a.member_id === member.id && a.week_start === week.weekStart
  )

  return (
    <div
      className="absolute top-1 right-1 z-30"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <AlertTriangle size={12} className="text-[var(--danger)]" />

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[var(--bg-secondary)] border border-[var(--danger)] rounded-lg shadow-2xl p-4 z-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-[var(--danger)]" />
            <h4 className="font-semibold text-[var(--danger)] text-sm">
              Sovraccarico Capacità
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Capacità totale:</span>
              <span className="font-mono text-[var(--text-primary)]">
                {capacityInfo.total} giorni
              </span>
            </div>

            {capacityInfo.timeOff > 0 && (
              <div className="flex justify-between">
                <span className="text-[var(--warning)]">Ferie/Assenze:</span>
                <span className="font-mono text-[var(--warning)]">
                  -{capacityInfo.timeOff} giorni
                </span>
              </div>
            )}

            <div className="border-t border-[var(--border-primary)] pt-2 mt-2">
              <div className="font-medium text-[var(--text-secondary)] mb-1">
                Allocazioni:
              </div>
              {weekAllocations.map((alloc) => {
                const feature = features.find((f) => f.id === alloc.feature_id)
                return (
                  <div key={alloc.id} className="flex justify-between ml-2">
                    <span className="text-[var(--text-secondary)] truncate">
                      {feature?.name || 'Unknown'}
                    </span>
                    <span className="font-mono text-[var(--text-primary)] ml-2">
                      {alloc.days} giorni
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-[var(--border-primary)] pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-[var(--text-secondary)]">Totale allocato:</span>
                <span className="font-mono text-[var(--danger)]">
                  {capacityInfo.allocated} giorni
                </span>
              </div>
              <div className="flex justify-between font-semibold mt-1">
                <span className="text-[var(--danger)]">Eccedenza:</span>
                <span className="font-mono text-[var(--danger)]">
                  +{(capacityInfo.allocated + capacityInfo.timeOff - capacityInfo.total).toFixed(1)}{' '}
                  giorni
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
