import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSprints } from '@/hooks/useSprints'
import { Modal } from '@/components/ui/Modal'
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
  } = useSprints()

  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)

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

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Sprint
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Gestione sprint e pianificazione temporale
            </p>
          </div>

          <button
            onClick={() => {
              setEditingSprint(null)
              setSprintModalOpen(true)
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Nuovo Sprint
          </button>
        </div>
      </div>

      <div className="card">
        <SprintList
          sprints={sprints}
          onEditSprint={(sprint) => {
            setEditingSprint(sprint)
            setSprintModalOpen(true)
          }}
          onDeleteSprint={deleteSprint}
        />
      </div>

      {/* Sprint Modal */}
      <Modal
        isOpen={sprintModalOpen}
        onClose={() => {
          setSprintModalOpen(false)
          setEditingSprint(null)
        }}
        title={editingSprint ? 'Modifica Sprint' : 'Nuovo Sprint'}
      >
        <SprintForm
          sprint={editingSprint}
          onSubmit={handleSprintSubmit}
          onSubmitMultiple={createMultipleSprints}
          onSubmitAndUpdateFollowing={handleSprintUpdateAndFollowing}
          onCancel={() => {
            setSprintModalOpen(false)
            setEditingSprint(null)
          }}
        />
      </Modal>
    </div>
  )
}
