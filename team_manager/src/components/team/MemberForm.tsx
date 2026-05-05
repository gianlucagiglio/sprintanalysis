import { useState, useEffect } from 'react'
import type { TeamMember, Role } from '@/types'

interface MemberFormProps {
  member?: TeamMember | null
  roles: Role[]
  onSubmit: (data: Omit<TeamMember, 'id' | 'created_at' | 'role'>) => Promise<void>
  onCancel: () => void
}

export function MemberForm({ member, roles, onSubmit, onCancel }: MemberFormProps) {
  const [name, setName] = useState('')
  const [roleId, setRoleId] = useState('')
  const [weeklyCapacity, setWeeklyCapacity] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (member) {
      setName(member.name)
      setRoleId(member.role_id)
      setWeeklyCapacity(member.weekly_capacity)
    } else {
      setName('')
      setRoleId(roles[0]?.id || '')
      setWeeklyCapacity(5)
    }
  }, [member, roles])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !roleId) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: name.trim(),
        role_id: roleId,
        weekly_capacity: weeklyCapacity,
      })
      onCancel()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (roles.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        Crea prima almeno un ruolo per aggiungere membri al team.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="member-name" className="label">
          Nome
        </label>
        <input
          id="member-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input w-full"
          placeholder="es. Mario Rossi"
          autoFocus
          required
        />
      </div>

      <div>
        <label htmlFor="member-role" className="label">
          Ruolo
        </label>
        <select
          id="member-role"
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          className="input w-full"
          required
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="member-capacity" className="label">
          Capacità settimanale (giorni)
        </label>
        <input
          id="member-capacity"
          type="number"
          value={weeklyCapacity}
          onChange={(e) => setWeeklyCapacity(parseFloat(e.target.value))}
          className="input w-full font-mono"
          min="0"
          max="5"
          step="0.01"
          required
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Giorni lavorativi disponibili a settimana (0-5, step 0.01)
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting || !name.trim() || !roleId}
          className="btn btn-primary flex-1"
        >
          {isSubmitting ? 'Salvataggio...' : member ? 'Aggiorna' : 'Aggiungi'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Annulla
        </button>
      </div>
    </form>
  )
}
