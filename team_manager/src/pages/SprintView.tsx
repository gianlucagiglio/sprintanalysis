import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useSprints } from '@/hooks/useSprints'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SprintList } from '@/components/sprints/SprintList'
import { SprintForm } from '@/components/sprints/SprintForm'
import type { Sprint } from '@/types'

export function SprintView() {
  const {
    sprints,
    createSprint,
    createMultipleSprints,
    updateSprint,
    updateSprintAndFollowing,
    deleteSprint,
    deleteSprints,
  } = useSprints()

  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSingleId, setDeletingSingleId] = useState<string | null>(null)

  const handleSprintSubmit = async (data: Omit<Sprint, 'id' | 'created_at'>) => {
    if (editingSprint) {
      await updateSprint(editingSprint.id, data)
    } else {
      await createSprint(data)
    }
  }

  const handleSprintUpdateAndFollowing = async (data: Omit<Sprint, 'id' | 'created_at'>) => {
    if (editingSprint) {
      await updateSprintAndFollowing(editingSprint.id, data)
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    if (selectedIds.length === sprints.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(sprints.map((s) => s.id))
    }
  }

  const handleDeleteSingle = (id: string) => {
    setDeletingSingleId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteBulk = () => {
    setDeletingSingleId(null)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (deletingSingleId) {
      await deleteSprint(deletingSingleId)
      setDeletingSingleId(null)
    } else if (selectedIds.length > 0) {
      await deleteSprints(selectedIds)
      setSelectedIds([])
    }
    setDeleteDialogOpen(false)
  }

  const getDeleteMessage = () => {
    if (deletingSingleId) {
      const sprint = sprints.find((s) => s.id === deletingSingleId)
      return `Are you sure you want to delete sprint "${sprint?.name}"? This action cannot be undone.`
    }
    return `Are you sure you want to delete ${selectedIds.length} selected sprints? This action cannot be undone.`
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Sprints
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Sprint management and time planning
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteBulk}
                className="btn bg-[var(--danger)] hover:bg-[#dc2626] text-white flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete {selectedIds.length} {selectedIds.length === 1 ? 'sprint' : 'sprints'}
              </button>
            )}

            <button
              onClick={() => {
                setEditingSprint(null)
                setSprintModalOpen(true)
              }}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              New Sprint
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <SprintList
          sprints={sprints}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onEditSprint={(sprint) => {
            setEditingSprint(sprint)
            setSprintModalOpen(true)
          }}
          onDeleteSprint={handleDeleteSingle}
        />
      </div>

      {/* Sprint Modal */}
      <Modal
        isOpen={sprintModalOpen}
        onClose={() => {
          setSprintModalOpen(false)
          setEditingSprint(null)
        }}
        title={editingSprint ? 'Edit Sprint' : 'New Sprint'}
      >
        <SprintForm
          sprint={editingSprint}
          existingSprints={sprints}
          onSubmit={handleSprintSubmit}
          onSubmitMultiple={createMultipleSprints}
          onSubmitAndUpdateFollowing={handleSprintUpdateAndFollowing}
          onCancel={() => {
            setSprintModalOpen(false)
            setEditingSprint(null)
          }}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setDeletingSingleId(null)
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Sprint"
        message={getDeleteMessage()}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}
