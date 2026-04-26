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
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (feature) {
      setName(feature.name)
      setType(feature.type || 'strategic')
      setColor(feature.color)
    } else {
      setName('')
      setType('strategic')
      setColor('#3b82f6')
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
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          I giorni di lavoro verranno allocati direttamente sulla timeline
        </p>
      </div>

      <div>
        <label htmlFor="feature-type" className="label">
          Tipologia
        </label>
        <select
          id="feature-type"
          value={type}
          onChange={(e) => setType(e.target.value as FeatureType)}
          className="form-input form-select w-full"
          required
        >
          <option value="strategic">Strategica</option>
          <option value="small_change">Small Change</option>
        </select>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Strategica: feature importante a lungo termine • Small Change: modifica minore o fix
        </p>
      </div>

      <ColorPicker label="Colore" value={color} onChange={setColor} />

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
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
