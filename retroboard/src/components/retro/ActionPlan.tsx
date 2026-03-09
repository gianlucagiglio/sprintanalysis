import { useState } from 'react'
import { useActions } from '@/hooks/useActions'
import { useSessionStore } from '@/stores/sessionStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, User, Calendar, Trash2, ListChecks } from 'lucide-react'

interface ActionPlanProps {
  sessionId: string
}

export function ActionPlan({ sessionId }: ActionPlanProps) {
  const { actions, addAction, deleteAction } = useActions(sessionId)
  const participants = useSessionStore((s) => s.participants)
  const [text, setText] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [deadline, setDeadline] = useState('')

  const handleAdd = async () => {
    if (!text.trim()) return
    await addAction(text.trim(), assignedTo || undefined, deadline || undefined)
    setText('')
    setAssignedTo('')
    setDeadline('')
  }

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
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-1 text-xs font-medium text-retro-text-secondary">
                <User size={12} /> Assegnato a
              </div>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all duration-200 focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
              >
                <option value="">Nessuno</option>
                {participants.map((p) => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.profiles?.name || 'Utente'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 space-y-1.5">
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
            const assignee = participants.find((p) => p.user_id === action.assigned_to)
            return (
              <Card key={action.id} hover className="!p-4 !rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-retro-primary-light flex items-center justify-center">
                    <ListChecks size={16} className="text-retro-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-retro-text">{action.text}</p>
                    <div className="flex gap-3 mt-1 text-xs text-retro-text-secondary">
                      {assignee && (
                        <span className="flex items-center gap-1">
                          <User size={10} /> {assignee.profiles?.name}
                        </span>
                      )}
                      {action.deadline && (
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {new Date(action.deadline).toLocaleDateString('it-IT')}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAction(action.id)}
                    className="p-1.5 rounded-lg text-retro-text-secondary hover:text-retro-mad hover:bg-red-50 transition-all duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
