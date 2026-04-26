import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { useAllocations } from '@/hooks/useAllocations'
import { generateWeekColumns, getSprintSpans } from '@/lib/capacity'
import { TimelineHeader } from '@/components/timeline/TimelineHeader'
import { FeatureGroup } from '@/components/timeline/FeatureGroup'
import { GlobalTimeOffRow } from '@/components/timeline/GlobalTimeOffRow'
import { TimelineFilters } from '@/components/timeline/TimelineFilters'
import { Modal } from '@/components/ui/Modal'
import { FeatureForm } from '@/components/sprints/FeatureForm'
import type { Feature } from '@/types'

export function TimelineView() {
  const { collapsedFeatures, toggleFeatureCollapse } = useAppStore()
  const { members, roles } = useTeam()
  const { sprints, features, createFeature } = useSprints()
  const { allocations, timeOffs, upsertAllocation } = useAllocations()

  const [featureModalOpen, setFeatureModalOpen] = useState(false)

  // Filters state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  // Initialize filters when data loads
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

  const handleFeatureSubmit = async (data: Omit<Feature, 'id' | 'created_at' | 'sprint'>) => {
    await createFeature(data)
  }

  // Filter logic
  const filteredFeatures = useMemo(() => {
    return features.filter((f) => selectedFeatures.includes(f.id))
  }, [features, selectedFeatures])

  const filteredMembers = useMemo(() => {
    return members.filter(
      (m) =>
        selectedMembers.includes(m.id) &&
        (m.role_id ? selectedRoles.includes(m.role_id) : true)
    )
  }, [members, selectedMembers, selectedRoles])

  // Filter handlers
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

  const weeks = generateWeekColumns(sprints)
  const sprintSpans = getSprintSpans(sprints, weeks)

  // Empty states
  if (sprints.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Vista settimanale allocazioni per feature e membro
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuno sprint creato. Vai alla sezione Sprint per iniziare!
          </p>
          <a href="/sprints" className="btn btn-primary inline-block">
            Vai a Sprint
          </a>
        </div>
      </div>
    )
  }

  if (features.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Vista settimanale allocazioni per feature e membro
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuna feature creata. Vai alla sezione Sprint per aggiungerne!
          </p>
          <a href="/sprints" className="btn btn-primary inline-block">
            Vai a Sprint
          </a>
        </div>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Vista settimanale allocazioni per feature e membro
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessun membro nel team. Vai alla sezione Team per aggiungerne!
          </p>
          <a href="/team" className="btn btn-primary inline-block">
            Vai a Team
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Vista settimanale allocazioni per feature e membro
            </p>
          </div>

          <div className="flex items-center gap-3">
            <TimelineFilters
              features={features}
              members={members}
              roles={roles}
              selectedFeatures={selectedFeatures}
              selectedMembers={selectedMembers}
              selectedRoles={selectedRoles}
              onFeatureToggle={toggleFeature}
              onMemberToggle={toggleMember}
              onRoleToggle={toggleRole}
              onSelectAllFeatures={() => setSelectedFeatures(features.map((f) => f.id))}
              onDeselectAllFeatures={() => setSelectedFeatures([])}
              onSelectAllMembers={() => setSelectedMembers(members.map((m) => m.id))}
              onDeselectAllMembers={() => setSelectedMembers([])}
              onSelectAllRoles={() => setSelectedRoles(roles.map((r) => r.id))}
              onDeselectAllRoles={() => setSelectedRoles([])}
            />

            <button
              onClick={() => setFeatureModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Nuova Feature
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden">
          <TimelineHeader weeks={weeks} sprintSpans={sprintSpans} />

          {filteredFeatures.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[var(--text-secondary)]">
                Nessuna feature corrisponde ai filtri selezionati
              </p>
              <button
                onClick={() => setSelectedFeatures(features.map((f) => f.id))}
                className="btn btn-secondary mt-4"
              >
                Ripristina filtri feature
              </button>
            </div>
          ) : (
            filteredFeatures.map((feature) => (
              <FeatureGroup
                key={feature.id}
                feature={feature}
                members={filteredMembers}
                weeks={weeks}
                allocations={allocations}
                timeOffs={timeOffs}
                isCollapsed={!!collapsedFeatures[feature.id]}
                onToggle={() => toggleFeatureCollapse(feature.id)}
                onAllocationChange={upsertAllocation}
              />
            ))
          )}

          {/* Riga Globale Ferie */}
          <GlobalTimeOffRow weeks={weeks} timeOffs={timeOffs} />
        </div>
      </div>

      {/* Feature Modal */}
      <Modal
        isOpen={featureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
        title="Nuova Feature"
      >
        <FeatureForm
          sprints={sprints}
          onSubmit={handleFeatureSubmit}
          onCancel={() => setFeatureModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
