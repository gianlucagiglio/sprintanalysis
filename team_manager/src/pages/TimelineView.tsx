import { useState, useEffect, useMemo } from 'react'
import { Plus, Calendar, Users, Layers, Download } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { useFeatures } from '@/hooks/useFeatures'
import { useAllocations } from '@/hooks/useAllocations'
import { useKTLO } from '@/hooks/useKTLO'
import { useNRT } from '@/hooks/useNRT'
import { useSettings } from '@/hooks/useSettings'
import { generateWeekColumns, getSprintSpans } from '@/lib/capacity'
import { exportTimelineToExcel } from '@/lib/excelExport'
import { TimelineHeader } from '@/components/timeline/TimelineHeader'
import { CapacityRecapRow } from '@/components/timeline/CapacityRecapRow'
import { FeatureGroup } from '@/components/timeline/FeatureGroup'
import { GlobalTimeOffRow } from '@/components/timeline/GlobalTimeOffRow'
import { NRTRow } from '@/components/timeline/NRTRow'
import { KTLORow } from '@/components/timeline/KTLORow'
import { TimelineFilters } from '@/components/timeline/TimelineFilters'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { ExpandCollapseButtons } from '@/components/ui/ExpandCollapseButtons'
import { FeatureForm } from '@/components/sprints/FeatureForm'
import type { Feature } from '@/types'

export function TimelineView() {
  const {
    collapsedFeatures,
    toggleFeatureCollapse,
    featureMembers,
    nrtExpanded,
    ktloExpanded,
    timeOffExpanded,
    capacityRecapExpanded,
    setNRTExpanded,
    setKTLOExpanded,
    setTimeOffExpanded,
    setCapacityRecapExpanded,
    expandAllTimeline,
    collapseAllTimeline,
  } = useAppStore()
  const { members, roles } = useTeam()
  const { sprints, features, createFeature, updateFeature, deleteFeature } = useSprints()
  const { allocations, timeOffs, upsertAllocation, upsertTimeOff } = useAllocations()
  const { ktloAllocations, upsertKTLOAllocation } = useKTLO()
  const { nrtAllocations, upsertNRTAllocation } = useNRT()
  const { settings } = useSettings()

  // Carica feature members per filtrare i membri visibili nella timeline
  useFeatures()

  const [featureModalOpen, setFeatureModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null)

  // Filters state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['strategic', 'small_change'])

  // Initialize filters when data loads and sync new features
  useEffect(() => {
    if (features.length > 0) {
      if (selectedFeatures.length === 0) {
        // Prima inizializzazione: seleziona tutte le feature
        setSelectedFeatures(features.map((f) => f.id))
      } else {
        // Aggiungi automaticamente le nuove feature ai filtri
        const newFeatureIds = features
          .filter((f) => !selectedFeatures.includes(f.id))
          .map((f) => f.id)

        if (newFeatureIds.length > 0) {
          setSelectedFeatures((prev) => [...prev, ...newFeatureIds])
        }
      }
    }
  }, [features])

  useEffect(() => {
    if (members.length > 0) {
      if (selectedMembers.length === 0) {
        setSelectedMembers(members.map((m) => m.id))
      } else {
        // Aggiungi automaticamente i nuovi membri ai filtri
        const newMemberIds = members
          .filter((m) => !selectedMembers.includes(m.id))
          .map((m) => m.id)

        if (newMemberIds.length > 0) {
          setSelectedMembers((prev) => [...prev, ...newMemberIds])
        }
      }
    }
  }, [members])

  useEffect(() => {
    if (roles.length > 0) {
      if (selectedRoles.length === 0) {
        setSelectedRoles(roles.map((r) => r.id))
      } else {
        // Aggiungi automaticamente i nuovi ruoli ai filtri
        const newRoleIds = roles
          .filter((r) => !selectedRoles.includes(r.id))
          .map((r) => r.id)

        if (newRoleIds.length > 0) {
          setSelectedRoles((prev) => [...prev, ...newRoleIds])
        }
      }
    }
  }, [roles])

  const handleFeatureSubmit = async (data: Omit<Feature, 'id' | 'created_at' | 'sprint'>) => {
    if (editingFeature) {
      await updateFeature(editingFeature.id, data)
    } else {
      await createFeature(data)
    }
  }

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature(feature)
    setFeatureModalOpen(true)
  }

  const handleDeleteFeature = (feature: Feature) => {
    setFeatureToDelete(feature)
    setDeleteConfirmOpen(true)
  }

  const confirmDeleteFeature = async () => {
    if (featureToDelete) {
      await deleteFeature(featureToDelete.id)
      setFeatureToDelete(null)
    }
  }

  // Filter logic
  const filteredFeatures = useMemo(() => {
    return features.filter(
      (f) => selectedFeatures.includes(f.id) && selectedTypes.includes(f.type)
    )
  }, [features, selectedFeatures, selectedTypes])

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

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const weeks = generateWeekColumns(sprints)
  const sprintSpans = getSprintSpans(sprints, weeks)

  // Calcola larghezza totale griglia per garantire allineamento
  const gridWidth = weeks.length * 72 // 72px per settimana

  // Empty states
  if (sprints.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Weekly allocation view per feature and member
          </p>
        </div>
        <div className="card">
          <EmptyState
            icon={Calendar}
            title="No sprints created"
            description="To start planning team work, create your first sprint in the Sprints section."
            action={{
              label: 'Go to Sprints',
              onClick: () => (window.location.href = '/sprints'),
            }}
          />
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
            Weekly allocation view per feature and member
          </p>
        </div>
        <div className="card">
          <EmptyState
            icon={Users}
            title="No team members"
            description="Add team members to allocate resources on features."
            action={{
              label: 'Go to Team',
              onClick: () => (window.location.href = '/team'),
            }}
          />
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
              Weekly allocation view per feature and member
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ExpandCollapseButtons
              onExpandAll={expandAllTimeline}
              onCollapseAll={collapseAllTimeline}
            />

            <button
              onClick={() => {
                exportTimelineToExcel({
                  features: filteredFeatures,
                  members: filteredMembers,
                  featureMembers,
                  weeks,
                  allocations,
                  ktloAllocations,
                  nrtAllocations,
                  timeOffs,
                  sprints,
                })
              }}
              className="btn btn-secondary flex items-center gap-2"
              title="Export Timeline to Excel"
            >
              <Download size={16} />
              Export Excel
            </button>

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

            <button
              onClick={() => setFeatureModalOpen(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              New Feature
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="border border-[var(--border-primary)] rounded-lg overflow-x-auto">
          <TimelineHeader weeks={weeks} sprintSpans={sprintSpans} gridWidth={gridWidth} />

          {/* Capacity Recap - Riepilogo allocazioni totali per membro */}
          <CapacityRecapRow
            members={filteredMembers}
            weeks={weeks}
            gridWidth={gridWidth}
            sprints={sprints}
            allocations={allocations}
            timeOffs={timeOffs}
            ktloAllocations={ktloAllocations}
            nrtAllocations={nrtAllocations}
            color={settings.capacity_color}
            isExpanded={capacityRecapExpanded}
            onToggle={() => setCapacityRecapExpanded(!capacityRecapExpanded)}
          />

          {features.length === 0 ? (
            <div className="border-t border-[var(--border-primary)]">
              <EmptyState
                icon={Layers}
                title="No features created"
                description="Features represent projects or tasks the team works on. Create your first feature to get started."
                action={{
                  label: 'Create First Feature',
                  onClick: () => setFeatureModalOpen(true),
                }}
              />
            </div>
          ) : filteredFeatures.length === 0 ? (
            <div className="border-t border-[var(--border-primary)]">
              <EmptyState
                icon={Layers}
                title="No visible features"
                description="No features match the selected filters. Modify filters to view more features."
                action={{
                  label: 'Reset filters',
                  onClick: () => setSelectedFeatures(features.map((f) => f.id)),
                  variant: 'secondary',
                }}
              />
            </div>
          ) : (
            filteredFeatures.map((feature) => (
              <FeatureGroup
                key={feature.id}
                feature={feature}
                members={filteredMembers}
                featureMembers={featureMembers}
                weeks={weeks}
                gridWidth={gridWidth}
                allocations={allocations}
                timeOffs={timeOffs}
                isCollapsed={!!collapsedFeatures[feature.id]}
                onToggle={() => toggleFeatureCollapse(feature.id)}
                onEdit={() => handleEditFeature(feature)}
                onDelete={() => handleDeleteFeature(feature)}
                onAllocationChange={upsertAllocation}
              />
            ))
          )}

          {/* Riga NRT (Non-Regression Testing) - Solo QA/QAA */}
          <NRTRow
            members={filteredMembers}
            weeks={weeks}
            gridWidth={gridWidth}
            sprints={sprints}
            nrtAllocations={nrtAllocations}
            onNRTChange={upsertNRTAllocation}
            color={settings.nrt_color}
            isExpanded={nrtExpanded}
            onToggle={() => setNRTExpanded(!nrtExpanded)}
          />

          {/* Riga KTLO */}
          <KTLORow
            members={filteredMembers}
            weeks={weeks}
            gridWidth={gridWidth}
            ktloAllocations={ktloAllocations}
            onKTLOChange={upsertKTLOAllocation}
            color={settings.ktlo_color}
            isExpanded={ktloExpanded}
            onToggle={() => setKTLOExpanded(!ktloExpanded)}
          />

          {/* Riga Globale Ferie */}
          <GlobalTimeOffRow
            members={filteredMembers}
            weeks={weeks}
            gridWidth={gridWidth}
            timeOffs={timeOffs}
            onTimeOffChange={upsertTimeOff}
            color={settings.timeoff_color}
            isExpanded={timeOffExpanded}
            onToggle={() => setTimeOffExpanded(!timeOffExpanded)}
          />
        </div>
      </div>

      {/* Feature Modal */}
      <Modal
        isOpen={featureModalOpen}
        onClose={() => {
          setFeatureModalOpen(false)
          setEditingFeature(null)
        }}
        title={editingFeature ? 'Edit Feature' : 'New Feature'}
      >
        <FeatureForm
          feature={editingFeature}
          sprints={sprints}
          onSubmit={handleFeatureSubmit}
          onCancel={() => {
            setFeatureModalOpen(false)
            setEditingFeature(null)
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setFeatureToDelete(null)
        }}
        onConfirm={confirmDeleteFeature}
        title="Delete Feature"
        message={`Are you sure you want to delete feature "${featureToDelete?.name}"? All associated allocations will also be deleted. This action cannot be undone.`}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
