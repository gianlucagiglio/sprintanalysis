import { useState, useEffect } from 'react'
import { ColorPicker } from '@/components/ui/ColorPicker'
import type { Feature, Sprint } from '@/types'

interface FeatureFormProps {
  feature?: Feature | null
  sprints: Sprint[]
  initialSprintId?: string
  onSubmit: (data: Omit<Feature, 'id' | 'created_at' | 'sprint'>) => Promise<void>
  onCancel: () => void
}

export function FeatureForm({
  feature,
  sprints,
  initialSprintId,
  onSubmit,
  onCancel,
}: FeatureFormProps) {
  const [name, setName] = useState('')
  const [sprintId, setSprintId] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (feature) {
      setName(feature.name)
      setSprintId(feature.sprint_id)
      setColor(feature.color)
    } else {
      setName('')
      setSprintId(initialSprintId || sprints[0]?.id || '')
      setColor('#3b82f6')
    }
  }, [feature, initialSprintId, sprints])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !sprintId) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        sprint_id: sprintId,
        color,
      })
      onCancel()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sprints.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        Crea prima almeno uno sprint per aggiungere feature.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="feature-name" className="label">
          Nome Feature
        </label>
        <input
          id="feature-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
          placeholder="es. User Authentication"
          autoFocus
          required
        />
      </div>

      <div>
        <label htmlFor="feature-sprint" className="label">
          Sprint
        </label>
        <select
          id="feature-sprint"
          value={sprintId}
          onChange={(e) => setSprintId(e.target.value)}
          className="input w-full"
          required
        >
          {sprints.map((sprint) => (
            <option key={sprint.id} value={sprint.id}>
              {sprint.name}
            </option>
          ))}
        </select>
      </div>

      <ColorPicker label="Colore" value={color} onChange={setColor} />

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !sprintId}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? 'Salvataggio...' : feature ? 'Aggiorna' : 'Crea Feature'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
      </div>
    </form>
  )
}
