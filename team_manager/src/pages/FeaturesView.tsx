import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useFeatures } from '@/hooks/useFeatures'
import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { FeatureList } from '@/components/features/FeatureList'
import { FeatureForm } from '@/components/sprints/FeatureForm'
import type { Feature } from '@/types'

export function FeaturesView() {
  const {
    features,
    featureMembers,
    createFeature,
    updateFeature,
    deleteFeature,
    assignMembers,
    getFeatureMembers,
  } = useFeatures()

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
    return `Sei sicuro di voler eliminare la feature "${feature?.name}"? Verranno eliminate anche tutte le allocazioni associate. Questa azione non può essere annullata.`
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Feature</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Gestisci le feature e assegna i membri del team
          </p>
        </div>
        <button
          onClick={() => {
            setEditingFeature(null)
            setFeatureModalOpen(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
          Nuova Feature
        </button>
      </div>

      <FeatureList
        features={features}
        members={members}
        featureMembers={featureMembers}
        getFeatureMembers={getFeatureMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAssignMembers={handleAssignMembers}
      />

      <Modal
        isOpen={featureModalOpen}
        onClose={() => {
          setFeatureModalOpen(false)
          setEditingFeature(null)
        }}
        title={editingFeature ? 'Modifica Feature' : 'Nuova Feature'}
      >
        <FeatureForm
          feature={editingFeature || undefined}
          sprints={sprints}
          onSubmit={handleFeatureSubmit}
          onCancel={() => {
            setFeatureModalOpen(false)
            setEditingFeature(null)
          }}
        />
      </Modal>

      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false)
          setAssigningFeatureId(null)
        }}
        title="Assegna Membri al Team"
      >
        <MemberAssignForm
          members={members}
          selectedIds={
            assigningFeatureId
              ? getFeatureMembers(assigningFeatureId).map((fm) => fm.member_id)
              : []
          }
          onConfirm={handleConfirmAssign}
          onCancel={() => {
            setAssignModalOpen(false)
            setAssigningFeatureId(null)
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Conferma eliminazione"
        message={getDeleteMessage()}
        confirmLabel="Elimina"
        cancelLabel="Annulla"
      />
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
    setSelected((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    )
  }

  // Ordine ruoli: PA, PD, BE, FE, QA, QAA
  const roleOrder: Record<string, number> = {
    PA: 1,
    PD: 2,
    BE: 3,
    FE: 4,
    QA: 5,
    QAA: 6,
  }

  const sortedMembers = [...members].sort((a, b) => {
    const roleA = a.role?.name || ''
    const roleB = b.role?.name || ''
    const orderA = roleOrder[roleA] || 999
    const orderB = roleOrder[roleB] || 999
    return orderA - orderB
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--text-secondary)]">
        Seleziona i membri del team che lavoreranno su questa feature
      </p>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {sortedMembers.map((member) => (
          <label
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={selected.includes(member.id)}
              onChange={() => handleToggle(member.id)}
              className="w-4 h-4 accent-[var(--accent-primary)]"
            />
            <div className="flex-1">
              <div className="font-medium text-[var(--text-primary)]">{member.name}</div>
              {member.role && (
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {member.role.name}
                </div>
              )}
            </div>
            {member.role && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: member.role.color }}
              />
            )}
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-4 border-t border-[var(--border-primary)]">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[var(--border-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
        >
          Annulla
        </button>
        <button
          onClick={() => onConfirm(selected)}
          className="flex-1 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          Salva Assegnazioni
        </button>
      </div>
    </div>
  )
}
