import { useState } from 'react'
import { useActions } from '@/hooks/useActions'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { ActionEditModal } from '@/components/kanban/ActionEditModal'
import { Plus, User, Calendar, ListChecks, X, Pencil } from 'lucide-react'
import type { Action } from '@/types/database'

interface ActionPlanProps {
  sessionId: string
}

export function ActionPlan({ sessionId }: ActionPlanProps) {
  const { actions, addAction, updateAction, deleteAction } = useActions(sessionId)
  const session = useSessionStore((s) => s.session)
  const participants = useSessionStore((s) => s.participants)
  const user = useAuthStore((s) => s.user)
  const [text, setText] = useState('')
  const [assignedTo, setAssignedTo] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')
  const [editingAction, setEditingAction] = useState<Action | null>(null)

  const isOrganizer = session?.organizer_id === user?.id

  const canEditAction = (action: Action) => {
    if (isOrganizer) return true
    if (user && (action.assigned_to_multi || []).includes(user.id)) return true
    return false
  }

  const toggleAssignee = (userId: string) => {
    setAssignedTo((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleAdd = async () => {
    if (!text.trim()) return
    await addAction(text.trim(), assignedTo, deadline || undefined)
    setText('')
    setAssignedTo([])
    setDeadline('')
  }

  const modalParticipants = participants.map((p) => ({
    user_id: p.user_id,
    name: p.profiles?.name || 'Utente',
  }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-retro-text mb-2">Piano d'Azione</h2>
        <p className="text-sm text-retro-text-secondary">Crea azioni concrete da portare avanti</p>
      </div>

      <Card className="!rounded-2xl">
        <div className="space-y-4">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Descrivi l'azione da intraprendere..."
          />
          <div className="space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-medium text-retro-text-secondary">
                <User size={12} /> Assegnatari
              </div>
              {assignedTo.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {assignedTo.map((id) => {
                    const p = participants.find((pp) => pp.user_id === id)
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                      >
                        {p?.profiles?.name || 'Utente'}
                        <button onClick={() => toggleAssignee(id)} className="hover:text-indigo-900">
                          <X size={12} />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
              <select
                value=""
                onChange={(e) => { if (e.target.value) toggleAssignee(e.target.value) }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all duration-200 focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
              >
                <option value="">Aggiungi assegnatario...</option>
                {participants.filter((p) => !assignedTo.includes(p.user_id)).map((p) => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.profiles?.name || 'Utente'}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-medium text-retro-text-secondary">
                <Calendar size={12} /> Scadenza
              </div>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all duration-200 focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
              />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={!text.trim()} className="w-full">
            <Plus size={16} /> Aggiungi azione
          </Button>
        </div>
      </Card>

      {actions.length > 0 && (
        <div className="space-y-2">
          {actions.map((action) => {
            const assigneeNames = (action.assigned_to_multi || [])
              .map((id) => participants.find((p) => p.user_id === id)?.profiles?.name || 'Utente')
            const editable = canEditAction(action)
            return (
              <Card key={action.id} hover className="!p-4 !rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-retro-primary-light flex items-center justify-center">
                    <ListChecks size={16} className="text-retro-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-retro-text">{action.text}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {assigneeNames.map((name, i) => (
                        <Badge key={i} variant="primary">
                          <User size={10} className="mr-1" /> {name}
                        </Badge>
                      ))}
                      {action.deadline && (
                        <span className="flex items-center gap-1 text-xs text-retro-text-secondary">
                          <Calendar size={10} /> {new Date(action.deadline).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>
                  </div>
                  {editable && (
                    <button
                      onClick={() => setEditingAction(action)}
                      className="p-1.5 rounded-lg text-retro-text-secondary hover:text-retro-primary hover:bg-retro-primary-light transition-all duration-200"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {editingAction && (
        <ActionEditModal
          action={editingAction}
          participants={modalParticipants}
          canEdit={canEditAction(editingAction)}
          canDelete={isOrganizer}
          onSave={updateAction}
          onDelete={deleteAction}
          onClose={() => setEditingAction(null)}
        />
      )}
    </div>
  )
}
