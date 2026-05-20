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
  onAllocationChange: (featureId: string, memberId: string, weekStart: string, days: number) => Promise<void>
}

export function MemberRow({ member, feature, weeks, gridWidth, allocations, timeOffs, onAllocationChange }: MemberRowProps) {
  const {
    allocations: allAllocations,
    features,
    ktloAllocations,
    selectedCells,
    isSelecting,
    selectionFeatureId,
    startCellSelection,
    addCellToSelection,
  } = useAppStore()

  const getAllocation = (weekStart: string) => {
    return allocations.find((a) => a.member_id === member.id && a.feature_id === feature.id && a.week_start === weekStart)?.days || 0
  }

  const isCellSelected = (weekStart: string) => {
    return selectedCells.some(
      (c) => c.featureId === feature.id && c.memberId === member.id && c.weekStart === weekStart
    )
  }

  const handleCellMouseDown = (weekStart: string, value: number) => {
    startCellSelection(feature.id)
    addCellToSelection({
      featureId: feature.id,
      memberId: member.id,
      weekStart,
      value,
    })
  }

  const handleCellMouseEnter = (weekStart: string, value: number) => {
    if (isSelecting && selectionFeatureId === feature.id) {
      addCellToSelection({
        featureId: feature.id,
        memberId: member.id,
        weekStart,
        value,
      })
    }
  }

  return (
    <div className="group flex transition-colors">
      <div className="timeline-sticky-col bg-[var(--bg-primary)] group-hover:bg-[var(--bg-hover)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center justify-between gap-2.5 transition-colors">
        <div className="flex items-center gap-2.5">
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: member.role?.color || 'var(--text-tertiary)' }}
          />
          <span className="text-sm text-[var(--text-secondary)]">{member.name}</span>
        </div>
        {member.role && <Badge label={member.role.name} color={member.role.color} small />}
      </div>

      <div className="flex group-hover:bg-[var(--bg-hover)] transition-colors pointer-events-none" style={{ width: `${gridWidth}px` }}>
        {weeks.map((week) => {
          const days = getAllocation(week.weekStart)
          const capacityInfo = getCapacityInfo(member, week.weekStart, allocations, timeOffs, ktloAllocations)

          const isSelected = isCellSelected(week.weekStart)

          return (
            <div
              key={week.weekStart}
              className={`border-r relative pointer-events-auto ${
                week.isCurrentWeek ? 'timeline-week-current' : ''
              } ${
                isSelected
                  ? 'bg-[var(--accent-primary)]30 border-[var(--accent-primary)] border-2'
                  : 'border-[var(--border-primary)]'
              }`}
              style={{ width: '72px', height: '32px' }}
              onMouseDown={() => handleCellMouseDown(week.weekStart, days)}
              onMouseEnter={() => handleCellMouseEnter(week.weekStart, days)}
            >
              <AllocationCell
                value={days}
                isOverCapacity={capacityInfo.isOverCapacity}
                onChange={(newValue) => onAllocationChange(feature.id, member.id, week.weekStart, newValue)}
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
