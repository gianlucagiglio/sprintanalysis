import { useState } from 'react'
import { Plus, Calendar, Users } from 'lucide-react'
import { useFeatures } from '@/hooks/useFeatures'
import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/ui/EmptyState'
import { FeatureList } from '@/components/features/FeatureList'
import { FeatureForm } from '@/components/sprints/FeatureForm'
import type { Feature } from '@/types'

export function FeaturesView() {
  const { features, featureMembers, createFeature, updateFeature, deleteFeature, assignMembers, getFeatureMembers } = useFeatures()
  const { members } = useTeam()
  const { sprints } = useSprints()

  const [featureModalOpen, setFeatureModalOpen] = useState(false)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assigningFeatureId, setAssigningFeatureId] = useState<string | null>(null)

  const handleFeatureSubmit = async (data: Omit<Feature, 'id' | 'created_at'>) => {
    if (editingFeature) {
      await updateFeature(editingFeature.id, data)
    } else {
      await createFeature(data)
    }
    setFeatureModalOpen(false)
    setEditingFeature(null)
  }

  const handleEdit = (feature: Feature) => {
    setEditingFeature(feature)
    setFeatureModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deletingId) {
      await deleteFeature(deletingId)
      setDeletingId(null)
    }
    setDeleteDialogOpen(false)
  }

  const handleAssignMembers = (featureId: string) => {
    setAssigningFeatureId(featureId)
    setAssignModalOpen(true)
  }

  const handleConfirmAssign = async (memberIds: string[]) => {
    if (assigningFeatureId) {
      await assignMembers(assigningFeatureId, memberIds)
      setAssigningFeatureId(null)
    }
    setAssignModalOpen(false)
  }

  const getDeleteMessage = () => {
    const feature = features.find((f) => f.id === deletingId)
    return `Are you sure you want to delete feature "${feature?.name}"? All associated allocations will also be deleted.`
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Features</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage features and assign team members
          </p>
        </div>
        <button onClick={() => { setEditingFeature(null); setFeatureModalOpen(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Feature
        </button>
      </div>

      {features.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No features created"
          description="Features represent projects the team works on. Create the first feature to get started."
          action={{ label: 'Create Feature', onClick: () => setFeatureModalOpen(true) }}
        />
      ) : (
        <FeatureList
          features={features}
          members={members}
          featureMembers={featureMembers}
          getFeatureMembers={getFeatureMembers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAssignMembers={handleAssignMembers}
        />
      )}

      <Modal isOpen={featureModalOpen} onClose={() => { setFeatureModalOpen(false); setEditingFeature(null); }} title={editingFeature ? 'Edit Feature' : 'New Feature'}>
        <FeatureForm feature={editingFeature || undefined} sprints={sprints} onSubmit={handleFeatureSubmit} onCancel={() => { setFeatureModalOpen(false); setEditingFeature(null); }} />
      </Modal>

      <Modal isOpen={assignModalOpen} onClose={() => { setAssignModalOpen(false); setAssigningFeatureId(null); }} title="Assign Members">
        <MemberAssignForm members={members} selectedIds={assigningFeatureId ? getFeatureMembers(assigningFeatureId).map((fm) => fm.member_id) : []} onConfirm={handleConfirmAssign} onCancel={() => { setAssignModalOpen(false); setAssigningFeatureId(null); }} />
      </Modal>

      <ConfirmDialog isOpen={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleConfirmDelete} title="Delete Feature" message={getDeleteMessage()} type="danger" confirmText="Delete" cancelText="Cancel" />
    </div>
  )
}

interface MemberAssignFormProps {
  members: any[]
  selectedIds: string[]
  onConfirm: (memberIds: string[]) => void
  onCancel: () => void
}

function MemberAssignForm({ members, selectedIds, onConfirm, onCancel }: MemberAssignFormProps) {
  const [selected, setSelected] = useState<string[]>(selectedIds)

  const handleToggle = (memberId: string) => {
    setSelected((prev) => prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId])
  }

  const roleOrder: Record<string, number> = { PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }
  const sortedMembers = [...members].sort((a, b) => {
    const orderA = roleOrder[a.role?.name || ''] || 999
    const orderB = roleOrder[b.role?.name || ''] || 999
    return orderA - orderB
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">
        Select members who will work on this feature
      </p>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {sortedMembers.map((member) => (
          <label key={member.id} className="flex items-center gap-3 p-3 rounded border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors min-h-[44px]">
            <input type="checkbox" checked={selected.includes(member.id)} onChange={() => handleToggle(member.id)} className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer" />
            <div className="flex-1">
              <div className="font-medium text-sm text-[var(--text-primary)]">{member.name}</div>
              {member.role && <div className="text-xs text-[var(--text-secondary)]">{member.role.name}</div>}
            </div>
            {member.role && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: member.role.color }} />}
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-[var(--border-primary)]">
        <button onClick={onCancel} className="btn btn-secondary flex-1">Cancel</button>
        <button onClick={() => onConfirm(selected)} className="btn btn-primary flex-1">Save</button>
      </div>
    </div>
  )
}
