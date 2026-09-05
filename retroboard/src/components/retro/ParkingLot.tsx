import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, ArrowRight, User, Calendar } from 'lucide-react'
import { useParkingLot } from '@/hooks/useParkingLot'
import { useActions } from '@/hooks/useActions'
import { useParticipants } from '@/hooks/useParticipants'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import type { ParkingLotItem } from '@/types/database'

interface ParkingLotProps {
  sessionId: string
  isOpen: boolean
  onClose: () => void
}

interface ConvertModalProps {
  item: ParkingLotItem | null
  onClose: () => void
  onConvert: (text: string, assignees: string[], deadline?: string) => void
  participants: Array<{ user_id: string; name: string }>
}

function ConvertToActionModal({ item, onClose, onConvert, participants }: ConvertModalProps) {
  const [text, setText] = useState('')
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    if (item) {
      setText(item.text)
      setSelectedAssignees([])
      setDeadline('')
    }
  }, [item])

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleConvert = () => {
    if (!text.trim()) return
    onConvert(text.trim(), selectedAssignees, deadline || undefined)
    onClose()
  }

  if (!item) return null

  return (
    <Modal open={!!item} onClose={onClose} title="Converti in Azione">
      <div className="space-y-4">
        <Input
          label="Descrizione azione"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cosa va fatto?"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-retro-text">
            <User size={14} className="inline mr-1" />
            Assegna a
          </label>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <button
                key={p.user_id}
                onClick={() => toggleAssignee(p.user_id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[44px] ${
                  selectedAssignees.includes(p.user_id)
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'bg-white/50 text-retro-text border border-retro-border hover:bg-white/80'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-retro-text">
            <Calendar size={14} className="inline mr-1" />
            Scadenza (opzionale)
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-xl border border-white/40 bg-white/70 backdrop-blur-sm px-4 py-2.5 text-sm min-h-[44px] text-retro-text focus:outline-none focus:border-glass-primary focus:ring-4 focus:ring-glass-primary/10"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleConvert} className="flex-1">
            <ArrowRight size={16} />
            Crea Azione
          </Button>
          <Button onClick={onClose} variant="ghost">
            Annulla
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export function ParkingLot({ sessionId, isOpen, onClose }: ParkingLotProps) {
  const [newItemText, setNewItemText] = useState('')
  const [convertingItem, setConvertingItem] = useState<ParkingLotItem | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const user = useAuthStore((s) => s.user)
  const { items, addItem, deleteItem, convertToAction } = useParkingLot(sessionId)
  const { addAction } = useActions(sessionId)
  const { participants } = useParticipants()

  const participantList = participants.map((p) => ({
    user_id: p.user_id,
    name: p.profiles?.name || 'Partecipante',
  }))

  const handleAddItem = async () => {
    const trimmed = newItemText.trim()
    if (!trimmed) return
    await addItem(trimmed)
    setNewItemText('')
    inputRef.current?.focus()
  }

  const handleConvert = async (itemId: string, text: string, assignees: string[], deadline?: string) => {
    // Create action first
    await addAction(text, assignees, deadline)

    // Get the action ID (fetch latest action for this session)
    // This is a simplified approach - in a real scenario you'd get the ID from addAction return value
    // For now we'll just mark as converted without linking to a specific action
    await convertToAction(itemId, '')
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-retro-border bg-gradient-to-r from-indigo-50 to-purple-50">
                <div>
                  <h2 className="text-lg font-heading font-bold text-retro-text">Parking Lot</h2>
                  <p className="text-xs text-retro-text-secondary">Temi da discutere dopo</p>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full hover:bg-white/50 text-retro-text-secondary transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Input */}
              <div className="p-4 border-b border-retro-border bg-white/50">
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                    placeholder="Aggiungi un tema..."
                    className="flex-1 rounded-xl border border-white/40 bg-white/70 backdrop-blur-sm px-4 py-2.5 text-sm min-h-[44px] text-retro-text placeholder:text-retro-text-tertiary focus:outline-none focus:border-glass-primary focus:ring-4 focus:ring-glass-primary/10"
                  />
                  <Button onClick={handleAddItem} size="sm">
                    Aggiungi
                  </Button>
                </div>
              </div>

              {/* Items list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {items.length === 0 ? (
                  <div className="text-center py-12 text-retro-text-secondary">
                    <p className="text-sm">Nessun tema parcheggiato</p>
                    <p className="text-xs mt-1">Usa il campo sopra per aggiungerne uno</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 100 }}
                        transition={{ duration: 0.2 }}
                        className={`glass-card rounded-xl p-3 ${
                          item.is_converted ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-retro-text break-words">{item.text}</p>
                            <p className="text-xs text-retro-text-tertiary mt-1">
                              {new Date(item.created_at).toLocaleString('it-IT', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                            {item.is_converted && (
                              <Badge variant="success" className="mt-2 text-xs">
                                Convertito in azione
                              </Badge>
                            )}
                          </div>

                          {!item.is_converted && (
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => setConvertingItem(item)}
                                className="flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                                title="Converti in azione"
                              >
                                <ArrowRight size={14} />
                              </button>
                              {item.user_id === user?.id && (
                                <button
                                  onClick={() => deleteItem(item.id)}
                                  className="flex items-center justify-center min-w-[36px] min-h-[36px] rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                  title="Elimina"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Convert Modal */}
      <ConvertToActionModal
        item={convertingItem}
        onClose={() => setConvertingItem(null)}
        onConvert={(text, assignees, deadline) => {
          if (convertingItem) {
            handleConvert(convertingItem.id, text, assignees, deadline)
          }
        }}
        participants={participantList}
      />
    </>
  )
}
