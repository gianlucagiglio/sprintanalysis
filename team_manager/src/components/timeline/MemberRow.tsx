import { Badge } from '@/components/ui/Badge'
import { AllocationCell } from './AllocationCell'
import { CapacityTooltip } from './CapacityTooltip'
import { getCapacityInfo } from '@/lib/capacity'
import { useAppStore } from '@/store/useAppStore'
import type { TeamMember, Feature, WeekColumn, Allocation, TimeOff } from '@/types'

interface MemberRowProps {
  member: TeamMember
  feature: Feature
  weeks: WeekColumn[]
  gridWidth: number
  allocations: Allocation[]
  timeOffs: TimeOff[]
  onAllocationChange: (
    featureId: string,
    memberId: string,
    weekStart: string,
    days: number
  ) => Promise<void>
}

export function MemberRow({
  member,
  feature,
  weeks,
  gridWidth,
  allocations,
  timeOffs,
  onAllocationChange,
}: MemberRowProps) {
  const { allocations: allAllocations, features, ktloAllocations } = useAppStore()

  const getAllocation = (weekStart: string) => {
    return (
      allocations.find(
        (a) =>
          a.member_id === member.id &&
          a.feature_id === feature.id &&
          a.week_start === weekStart
      )?.days || 0
    )
  }

  return (
    <div className="flex hover:bg-[var(--bg-hover)] transition-colors">
      <div className="timeline-sticky-col bg-[var(--bg-primary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[var(--text-tertiary)]" />
        <span className="text-sm text-[var(--text-secondary)]">{member.name}</span>
        {member.role && (
          <Badge label={member.role.name} color={member.role.color} small />
        )}
      </div>

      <div className="flex hover:bg-[var(--bg-hover)]" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
        {weeks.map((week) => {
          const days = getAllocation(week.weekStart)
          const capacityInfo = getCapacityInfo(member, week.weekStart, allocations, timeOffs, ktloAllocations)

          return (
            <div
              key={week.weekStart}
              className={`border-r relative ${
                week.isCurrentWeek
                  ? 'border-[var(--accent-primary)] border-l-2 border-r-2 bg-[var(--accent-primary)]05'
                  : 'border-[var(--border-primary)] bg-[var(--bg-primary)]'
              }`}
              style={{ width: '72px', minWidth: '72px', height: '32px' }}
            >
              <AllocationCell
                value={days}
                isOverCapacity={capacityInfo.isOverCapacity}
                onChange={(newValue) =>
                  onAllocationChange(feature.id, member.id, week.weekStart, newValue)
                }
              />
              <CapacityTooltip
                member={member}
                week={week}
                allAllocations={allAllocations}
                timeOffs={timeOffs}
                ktloAllocations={ktloAllocations}
                features={features}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
