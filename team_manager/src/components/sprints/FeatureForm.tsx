import { useState, useEffect } from 'react'
import { ColorPicker } from '@/components/ui/ColorPicker'
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
  const [name, setName] = useState('')
  const [type, setType] = useState<FeatureType>('strategic')
  const [color, setColor] = useState('#3b82f6')
  const [displayOrder, setDisplayOrder] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (feature) {
      setName(feature.name)
      setType(feature.type || 'strategic')
      setColor(feature.color)
      setDisplayOrder(feature.display_order ?? 0)
    } else {
      setName('')
      setType('strategic')
      setColor('#3b82f6')
      setDisplayOrder(0)
    }
  }, [feature])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        type,
        color,
        display_order: displayOrder,
      })
      onCancel()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
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
