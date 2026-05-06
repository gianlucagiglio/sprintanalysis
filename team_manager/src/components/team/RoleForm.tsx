import { useState, useEffect } from 'react'
import { ColorPicker } from '@/components/ui/ColorPicker'
import type { Role } from '@/types'

interface RoleFormProps {
  role?: Role | null
  onSubmit: (data: Omit<Role, 'id' | 'created_at'>) => Promise<void>
  onCancel: () => void
}

export function RoleForm({ role, onSubmit, onCancel }: RoleFormProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (role) {
      setName(role.name)
      setColor(role.color)
    } else {
      setName('')
      setColor('#3b82f6')
    }
  }, [role])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({ name: name.trim(), color })
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
        <label htmlFor="role-name" className="label">
          Role name
        </label>
        <input
          id="role-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
          placeholder="e.g. Frontend Developer"
          autoFocus
          required
        />
      </div>

      <ColorPicker label="Color" value={color} onChange={setColor} />

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? 'Saving...' : role ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  )
}
