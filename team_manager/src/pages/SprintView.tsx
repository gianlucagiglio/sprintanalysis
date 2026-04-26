import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useSprints } from '@/hooks/useSprints'
import { Modal } from '@/components/ui/Modal'
import { SprintList } from '@/components/sprints/SprintList'
import { SprintForm } from '@/components/sprints/SprintForm'
import { FeatureForm } from '@/components/sprints/FeatureForm'
import type { Sprint, Feature } from '@/types'

export function SprintView() {
  const {
    sprints,
    features,
    createSprint,
    createMultipleSprints,
    updateSprint,
    deleteSprint,
    createFeature,
    updateFeature,
    deleteFeature,
  } = useSprints()

  const [sprintModalOpen, setSprintModalOpen] = useState(false)
  const [featureModalOpen, setFeatureModalOpen] = useState(false)
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null)
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null)
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')

  const handleSprintSubmit = async (data: Omit<Sprint, 'id' | 'created_at'>) => {
    if (editingSprint) {
      await updateSprint(editingSprint.id, data)
    } else {
      await createSprint(data)
    }
  }

  const handleFeatureSubmit = async (data: Omit<Feature, 'id' | 'created_at' | 'sprint'>) => {
    if (editingFeature) {
      await updateFeature(editingFeature.id, data)
    } else {
      await createFeature(data)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              Sprint & Feature
            </h2>
            <p className="text-[var(--text-secondary)] mt-1">
              Gestione sprint e relative feature
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setEditingFeature(null)
                setSelectedSprintId('')
                setFeatureModalOpen(true)
              }}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Plus size={16} />
              Nuova Feature
            </button>
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
      </div>

      <div className="card">
        <SprintList
          sprints={sprints}
          features={features}
          onEditSprint={(sprint) => {
            setEditingSprint(sprint)
            setSprintModalOpen(true)
          }}
          onDeleteSprint={deleteSprint}
          onEditFeature={(feature) => {
            setEditingFeature(feature)
            setFeatureModalOpen(true)
          }}
          onDeleteFeature={deleteFeature}
          onAddFeature={(sprintId) => {
            setEditingFeature(null)
            setSelectedSprintId(sprintId)
            setFeatureModalOpen(true)
          }}
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
          onCancel={() => {
            setSprintModalOpen(false)
            setEditingSprint(null)
          }}
        />
      </Modal>

      {/* Feature Modal */}
      <Modal
        isOpen={featureModalOpen}
        onClose={() => {
          setFeatureModalOpen(false)
          setEditingFeature(null)
          setSelectedSprintId('')
        }}
        title={editingFeature ? 'Modifica Feature' : 'Nuova Feature'}
      >
        <FeatureForm
          feature={editingFeature}
          sprints={sprints}
          initialSprintId={selectedSprintId}
          onSubmit={handleFeatureSubmit}
          onCancel={() => {
            setFeatureModalOpen(false)
            setEditingFeature(null)
            setSelectedSprintId('')
          }}
        />
      </Modal>
    </div>
  )
}
