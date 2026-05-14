import { useState, useEffect } from 'react'
import { ColorPicker } from '@/components/ui/ColorPicker'
import { useTeam } from '@/hooks/useTeam'
import { useEstimatedEfforts } from '@/hooks/useEstimatedEfforts'
import type { Feature, Sprint, FeatureType } from '@/types'

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
  const { roles } = useTeam()
  const { estimatedEfforts, batchUpsertEstimatedEfforts } = useEstimatedEfforts(feature?.id)

  const [name, setName] = useState('')
  const [type, setType] = useState<FeatureType>('strategic')
  const [color, setColor] = useState('#3b82f6')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State per effort stimati per ruolo
  const [effortsByRole, setEffortsByRole] = useState<Record<string, number>>({})

  useEffect(() => {
    if (feature) {
      setName(feature.name)
      setType(feature.type || 'strategic')
      setColor(feature.color)
      setDisplayOrder(feature.display_order ?? 0)

      // Carica effort stimati
      const efforts: Record<string, number> = {}
      estimatedEfforts.forEach((effort) => {
        efforts[effort.role_id] = effort.estimated_days
      })
      setEffortsByRole(efforts)
    } else {
      setName('')
      setType('strategic')
      setColor('#3b82f6')
      setDisplayOrder(0)
      setEffortsByRole({})
    }
  }, [feature, estimatedEfforts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      // Salva feature
      await onSubmit({
        name: name.trim(),
        type,
        color,
        display_order: displayOrder,
      })

      // Salva effort stimati (solo se in edit mode)
      if (feature?.id) {
        const efforts = Object.entries(effortsByRole).map(([roleId, days]) => ({
          roleId,
          estimatedDays: days || 0,
        }))

        if (efforts.length > 0) {
          await batchUpsertEstimatedEfforts(feature.id, efforts)
        }
      }

      onCancel()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEffortChange = (roleId: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setEffortsByRole((prev) => ({
      ...prev,
      [roleId]: numValue,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="feature-name" className="label">
          Feature Name
        </label>
        <input
          id="feature-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
          placeholder="e.g. User Authentication"
          autoFocus
          required
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Work days will be allocated directly on the timeline
        </p>
      </div>

      <div>
        <label htmlFor="feature-type" className="label">
          Type
        </label>
        <select
          id="feature-type"
          value={type}
          onChange={(e) => setType(e.target.value as FeatureType)}
          className="form-input form-select w-full"
          required
        >
          <option value="strategic">Strategic</option>
          <option value="small_change">Small Change</option>
        </select>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Strategic: long-term important feature • Small Change: minor modification or fix
        </p>
      </div>

      <ColorPicker label="Color" value={color} onChange={setColor} />

      <div>
        <label htmlFor="feature-order" className="label">
          Display Order
        </label>
        <input
          id="feature-order"
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
          className="input w-full"
          min="0"
          step="1"
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Order number in timeline (0 = first, higher values = after)
        </p>
      </div>

      {/* Effort Stimati per Ruolo - Solo in edit mode */}
      {feature && (
        <div className="border-t border-[var(--border-primary)] pt-4">
          <label className="label mb-3">
            Effort Stimato per Famiglia Professionale
          </label>
          <p className="text-xs text-[var(--text-tertiary)] mb-3">
            Inserisci i giorni stimati per ogni ruolo. Questo servirà per confrontare l'effort
            pianificato (timeline) vs stimato.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => (
              <div key={role.id}>
                <label htmlFor={`effort-${role.id}`} className="label text-xs">
                  {role.name}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id={`effort-${role.id}`}
                    type="number"
                    value={effortsByRole[role.id] || ''}
                    onChange={(e) => handleEffortChange(role.id, e.target.value)}
                    className="input w-full"
                    placeholder="0"
                    min="0"
                    max="999"
                    step="0.5"
                  />
                  <span
                    className="text-xs font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${role.color}20`,
                      color: role.color,
                    }}
                  >
                    d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? 'Saving...' : feature ? 'Update' : 'Create Feature'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
