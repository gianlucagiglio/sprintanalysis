import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MemberRow } from './MemberRow'
import type { Feature, TeamMember, WeekColumn, Allocation, TimeOff } from '@/types'

interface FeatureGroupProps {
  feature: Feature
  members: TeamMember[]
  weeks: WeekColumn[]
  allocations: Allocation[]
  timeOffs: TimeOff[]
  isCollapsed: boolean
  onToggle: () => void
  onAllocationChange: (
    featureId: string,
    memberId: string,
    weekStart: string,
    days: number
  ) => Promise<void>
}

export function FeatureGroup({
  feature,
  members,
  weeks,
  allocations,
  timeOffs,
  isCollapsed,
  onToggle,
  onAllocationChange,
}: FeatureGroupProps) {
  const featureAllocations = allocations.filter((a) => a.feature_id === feature.id)

  return (
    <div className="border-b border-[var(--border-primary)]">
      {/* Feature Header */}
      <div className="flex bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
        <div className="sticky left-0 w-[220px] bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center gap-3 z-10">
          <button
            onClick={onToggle}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <Badge label={feature.name} color={feature.color} />
        </div>

        <div className="flex-1 flex">
          {weeks.map((week) => (
            <div
              key={week.weekStart}
              className="border-r border-[var(--border-primary)]"
              style={{ width: '72px', minWidth: '72px' }}
            />
          ))}
        </div>
      </div>

      {/* Member Rows */}
      {!isCollapsed && (
        <>
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              feature={feature}
              weeks={weeks}
              allocations={featureAllocations}
              timeOffs={timeOffs}
              onAllocationChange={onAllocationChange}
            />
          ))}
        </>
      )}
    </div>
  )
}
