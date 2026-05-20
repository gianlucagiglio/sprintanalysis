import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { User, Calendar, X, Trash2, Save } from 'lucide-react'
import type { Action } from '@/types/database'

interface Participant {
  user_id: string
  name: string
}

interface ActionEditModalProps {
  action: Action
  participants: Participant[]
  canEdit: boolean
  canDelete: boolean
  onSave: (actionId: string, updates: Partial<Action>) => Promise<void>
  onDelete: (actionId: string) => Promise<void>
  onClose: () => void
}

export function ActionEditModal({
  action,
  participants,
  canEdit,
  canDelete,
  onSave,
  onDelete,
  onClose,
}: ActionEditModalProps) {
  const [text, setText] = useState(action.text)
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(action.assigned_to_multi || [])
  const [deadline, setDeadline] = useState(action.deadline || '')
  const [status, setStatus] = useState<Action['status']>(action.status)
  const [notes, setNotes] = useState(action.notes || '')
  const [resolution, setResolution] = useState(action.resolution || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setText(action.text)
    setSelectedAssignees(action.assigned_to_multi || [])
    setDeadline(action.deadline || '')
    setStatus(action.status)
    setNotes(action.notes || '')
    setResolution(action.resolution || '')
  }, [action])

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const removeAssignee = (userId: string) => {
    setSelectedAssignees((prev) => prev.filter((id) => id !== userId))
  }

  const handleSave = async () => {
    if (!text.trim()) return
    setSaving(true)
    await onSave(action.id, {
      text: text.trim(),
      assigned_to: selectedAssignees[0] || null,
      assigned_to_multi: selectedAssignees,
      deadline: deadline || null,
      status,
      notes: notes.trim() || null,
      resolution: resolution.trim() || null,
    })
    setSaving(false)
    onClose()
  }

  const handleDelete = async () => {
    setSaving(true)
    await onDelete(action.id)
    setSaving(false)
    onClose()
  }

  const selectedNames = selectedAssignees
    .map((id) => participants.find((p) => p.user_id === id))
    .filter(Boolean) as Participant[]

  const unselected = participants.filter((p) => !selectedAssignees.includes(p.user_id))

  return (
    <Modal open onClose={onClose} title="Modifica azione">
      <div className="space-y-4">
        {/* Title */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-retro-text-secondary">Titolo</label>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!canEdit}
            className="!rounded-xl"
          />
        </div>

        {/* Multi-select assignees */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-retro-text-secondary">
            <User size={11} /> Assegnatari
          </div>

          {/* Selected chips */}
          {selectedNames.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {selectedNames.map((p) => (
                <span
                  key={p.user_id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
                >
                  {p.name}
                  {canEdit && (
                    <button
                      onClick={() => removeAssignee(p.user_id)}
                      className="hover:text-indigo-900 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}

          {/* Dropdown to add */}
          {canEdit && unselected.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) toggleAssignee(e.target.value)
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10"
            >
              <option value="">Aggiungi assegnatario...</option>
              {unselected.map((p) => (
                <option key={p.user_id} value={p.user_id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Deadline */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-retro-text-secondary">
            <Calendar size={11} /> Scadenza
          </div>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            disabled={!canEdit}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10 disabled:opacity-50"
          />
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-retro-text-secondary">Stato</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Action['status'])}
            disabled={!canEdit}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10 disabled:opacity-50"
          >
            <option value="todo">Da fare</option>
            <option value="in_progress">In corso</option>
            <option value="done">Completato</option>
          </select>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-retro-text-secondary">Note</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={!canEdit}
            placeholder="Aggiungi note, dettagli, aggiornamenti..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Resolution */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-retro-text-secondary">Risoluzione</label>
          <textarea
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            disabled={!canEdit}
            placeholder="Come è stata risolta l'azione..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-retro-text transition-all focus:outline-none focus:border-retro-primary focus:ring-4 focus:ring-retro-primary/10 disabled:opacity-50 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {canDelete && (
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={saving}
              className="!text-red-600 hover:!bg-red-50"
            >
              <Trash2 size={14} /> Elimina
            </Button>
          )}
          <div className="flex-1" />
          {canEdit && (
            <Button onClick={handleSave} disabled={saving || !text.trim()}>
              <Save size={14} /> Salva
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
