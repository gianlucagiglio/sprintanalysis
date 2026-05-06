import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MemberRow } from './MemberRow'
import type { Feature, TeamMember, WeekColumn, Allocation, TimeOff, FeatureMember } from '@/types'

interface FeatureGroupProps {
  feature: Feature
  members: TeamMember[]
  featureMembers: FeatureMember[]
  weeks: WeekColumn[]
  gridWidth: number
  allocations: Allocation[]
  timeOffs: TimeOff[]
  isCollapsed: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onAllocationChange: (featureId: string, memberId: string, weekStart: string, days: number) => Promise<void>
}

export function FeatureGroup({
  feature,
  members,
  featureMembers,
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
  const assignedMemberIds = featureMembers.filter((fm) => fm.feature_id === feature.id).map((fm) => fm.member_id)
  const assignedMembers = members.filter((m) => assignedMemberIds.includes(m.id))

  const roleOrder: Record<string, number> = { PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }
  const sortedMembers = [...assignedMembers].sort((a, b) => {
    const orderA = roleOrder[a.role?.name || ''] || 999
    const orderB = roleOrder[b.role?.name || ''] || 999
    return orderA - orderB
  })

  const getTotalDays = (weekStart: string) => {
    return featureAllocations
      .filter((a) => a.week_start === weekStart && assignedMemberIds.includes(a.member_id))
      .reduce((sum, a) => sum + a.days, 0)
  }

  return (
    <div className="border-b border-[var(--border-primary)]">
      {/* Feature Header */}
      <div className="flex timeline-feature-header">
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5 flex items-center gap-3">
          <button onClick={onToggle} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <Badge label={feature.name} color={feature.color} maxWidth="180px" />
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={onEdit}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors rounded"
              title="Modifica"
            >
              <Edit2 size={14} />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors rounded"
              title="Elimina"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex" style={{ width: `${gridWidth}px` }}>
          {weeks.map((week) => {
            const total = getTotalDays(week.weekStart)
            return (
              <div
                key={week.weekStart}
                className={`border-r border-[var(--border-primary)] p-1 text-center ${
                  week.isCurrentWeek ? 'timeline-week-current' : ''
                }`}
                style={{ width: '72px', height: '36px' }}
              >
                {total > 0 && (
                  <span
                    className="inline-block px-1.5 py-0.5 rounded text-xs font-mono font-bold"
                    style={{
                      backgroundColor: `${feature.color}20`,
                      color: feature.color,
                      border: `1px solid ${feature.color}40`,
                    }}
                  >
                    {total}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Member Rows */}
      {!isCollapsed && sortedMembers.map((member) => (
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
    </div>
  )
}
