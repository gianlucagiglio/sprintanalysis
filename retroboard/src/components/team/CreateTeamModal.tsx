import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import { useTeams } from '@/hooks/useTeams'

interface CreateTeamModalProps {
  open: boolean
  onClose: () => void
}

export function CreateTeamModal({ open, onClose }: CreateTeamModalProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { createTeam } = useTeams()
  const navigate = useNavigate()

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)

    try {
      const team = await createTeam(name.trim())
      if (team) {
        setName('')
        onClose()
        navigate(`/team/${team.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuovo Team">
      <form onSubmit={handleCreate} className="space-y-4">
        <Input
          label="Nome team"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Team Backend"
          required
          autoFocus
        />
        <Button type="submit" className="w-full" disabled={loading}>
          <Plus size={16} />
          {loading ? 'Creazione...' : 'Crea team'}
        </Button>
      </form>
    </Modal>
  )
}
