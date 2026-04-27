import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MemberRow } from './MemberRow'
import type { Feature, TeamMember, WeekColumn, Allocation, TimeOff } from '@/types'

interface FeatureGroupProps {
  feature: Feature
  members: TeamMember[]
  weeks: WeekColumn[]
  gridWidth: number
  allocations: Allocation[]
  timeOffs: TimeOff[]
  isCollapsed: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
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
  gridWidth,
  allocations,
  timeOffs,
  isCollapsed,
  onToggle,
  onEdit,
  onDelete,
  onAllocationChange,
}: FeatureGroupProps) {
  const featureAllocations = allocations.filter((a) => a.feature_id === feature.id)

  return (
    <div className="border-b border-[var(--border-primary)]">
      {/* Feature Header */}
      <div className="flex bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
        <div className="timeline-sticky-col sticky left-0 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center gap-2 z-10">
          <button
            onClick={onToggle}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <Badge label={feature.name} color={feature.color} maxWidth="200px" />
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={onEdit}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
              title="Modifica feature"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors"
              title="Elimina feature"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
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
              gridWidth={gridWidth}
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
