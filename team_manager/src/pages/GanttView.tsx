import { useState, useEffect, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { useFeatures } from '@/hooks/useFeatures'
import { useAllocations } from '@/hooks/useAllocations'
import { generateWeekColumns, getSprintSpans } from '@/lib/capacity'
import { GanttHeader } from '@/components/gantt/GanttHeader'
import { GanttFeatureRow } from '@/components/gantt/GanttFeatureRow'
import { TimelineFilters } from '@/components/timeline/TimelineFilters'
import { ExpandCollapseButtons } from '@/components/ui/ExpandCollapseButtons'

export function GanttView() {
  const { featureMembers, expandAllGantt, collapseAllGantt } = useAppStore()
  const { members, roles } = useTeam()
  const { sprints, features } = useSprints()
  const { allocations } = useAllocations()

  // Carica feature members
  useFeatures()

  // Filters state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['strategic', 'small_change'])

  // Initialize filters
  useEffect(() => {
    if (features.length > 0 && selectedFeatures.length === 0) {
      setSelectedFeatures(features.map((f) => f.id))
    }
  }, [features])

  useEffect(() => {
    if (members.length > 0 && selectedMembers.length === 0) {
      setSelectedMembers(members.map((m) => m.id))
    }
  }, [members])

  useEffect(() => {
    if (roles.length > 0 && selectedRoles.length === 0) {
      setSelectedRoles(roles.map((r) => r.id))
    }
  }, [roles])

  // Toggle functions for filters
  const toggleFeature = (featureId: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureId)
        ? prev.filter((id) => id !== featureId)
        : [...prev, featureId]
    )
  }

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    )
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    )
  }

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  // Generate weeks and sprints
  const weeks = useMemo(() => generateWeekColumns(sprints), [sprints])
  const sprintSpans = useMemo(() => getSprintSpans(sprints, weeks), [sprints, weeks])
  const gridWidth = weeks.length * 72

  // Apply filters
  const filteredFeatures = useMemo(() => {
    return features.filter((feature) => {
      // Filter by selected features
      if (!selectedFeatures.includes(feature.id)) return false

      // Filter by type
      if (!selectedTypes.includes(feature.type)) return false

      // Filter by assigned members
      const assignedMemberIds = featureMembers
        .filter((fm) => fm.feature_id === feature.id)
        .map((fm) => fm.member_id)

      const hasSelectedMember = assignedMemberIds.some((memberId) =>
        selectedMembers.includes(memberId)
      )
      if (!hasSelectedMember) return false

      // Filter by role
      const assignedMembers = members.filter((m) => assignedMemberIds.includes(m.id))
      const hasSelectedRole = assignedMembers.some((m) =>
        m.role_id && selectedRoles.includes(m.role_id)
      )
      if (!hasSelectedRole) return false

      return true
    })
  }, [features, selectedFeatures, selectedTypes, featureMembers, selectedMembers, members, selectedRoles])

  const filteredMembers = useMemo(() => {
    return members.filter((m) =>
      selectedMembers.includes(m.id) && m.role_id && selectedRoles.includes(m.role_id)
    )
  }, [members, selectedMembers, selectedRoles])

  // Empty states
  if (sprints.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Gantt View</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Feature timeline visualization with allocation intensity
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            No sprints created. Go to the Sprints section to get started!
          </p>
          <a href="/sprints" className="btn btn-primary inline-block">
            Go to Sprints
          </a>
        </div>
      </div>
    )
  }

  if (features.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Gantt View</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Feature timeline visualization with allocation intensity
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            No features created. Go to the Timeline section to create features!
          </p>
          <a href="/timeline" className="btn btn-primary inline-block">
            Go to Timeline
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Gantt View</h2>
        <p className="text-[var(--text-secondary)] mt-1">
          Feature timeline visualization with allocation intensity and role breakdown
        </p>
      </div>

      {/* Filters */}
      <div className="px-8 pb-4 flex items-start gap-3">
        <ExpandCollapseButtons
          onExpandAll={expandAllGantt}
          onCollapseAll={collapseAllGantt}
        />

        <TimelineFilters
          features={features}
          members={members}
          roles={roles}
          selectedFeatures={selectedFeatures}
          selectedMembers={selectedMembers}
          selectedRoles={selectedRoles}
          selectedTypes={selectedTypes}
          onFeatureToggle={toggleFeature}
          onMemberToggle={toggleMember}
          onRoleToggle={toggleRole}
          onTypeToggle={toggleType}
          onSelectAllFeatures={() => setSelectedFeatures(features.map((f) => f.id))}
          onDeselectAllFeatures={() => setSelectedFeatures([])}
          onSelectAllMembers={() => setSelectedMembers(members.map((m) => m.id))}
          onDeselectAllMembers={() => setSelectedMembers([])}
          onSelectAllRoles={() => setSelectedRoles(roles.map((r) => r.id))}
          onDeselectAllRoles={() => setSelectedRoles([])}
          onSelectAllTypes={() => setSelectedTypes(['strategic', 'small_change'])}
          onDeselectAllTypes={() => setSelectedTypes([])}
        />
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="border border-[var(--border-primary)] rounded-lg overflow-x-auto">
          <GanttHeader weeks={weeks} sprintSpans={sprintSpans} gridWidth={gridWidth} />

          {filteredFeatures.length === 0 ? (
            <div className="p-12 text-center border-t border-[var(--border-primary)]">
              <p className="text-[var(--text-secondary)]">
                No features found with the selected filters.
              </p>
            </div>
          ) : (
            <>
              {filteredFeatures.map((feature) => (
                <GanttFeatureRow
                  key={feature.id}
                  feature={feature}
                  weeks={weeks}
                  gridWidth={gridWidth}
                  allocations={allocations}
                  members={filteredMembers}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
