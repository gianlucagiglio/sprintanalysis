import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Calendar, ArrowRight } from 'lucide-react'
import { useOverdueActions } from '@/hooks/useOverdueActions'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

const STORAGE_KEY = 'overdue-actions-dismissed'

export function OverdueActionsModal() {
  const { overdueActions, hasOverdue, dismissAll } = useOverdueActions()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  // Mostra il modal quando ci sono azioni scadute
  useEffect(() => {
    // Controlla se l'utente ha già visto il modal in questa sessione
    const dismissed = sessionStorage.getItem(STORAGE_KEY)

    if (hasOverdue && overdueActions.length > 0 && !dismissed) {
      // Ritardo di 2 secondi per dare tempo al modal dei badge di chiudersi
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasOverdue, overdueActions.length])

  const handleClose = () => {
    // Salva in sessionStorage che l'utente ha visto il modal
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
    dismissAll()
  }

  const handleGoToAction = (sessionId: string) => {
    // Salva in sessionStorage che l'utente ha visto il modal
    sessionStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
    dismissAll()
    navigate(`/session/${sessionId}`)
  }

  const getDaysOverdue = (deadline: string) => {
    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = now.getTime() - deadlineDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (!isOpen || overdueActions.length === 0) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 p-6 text-center">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3"
                >
                  <AlertTriangle size={32} className="text-white" />
                </motion.div>

                <h2 className="text-xl font-bold text-white mb-1">
                  {overdueActions.length === 1 ? 'Azione Scaduta!' : 'Azioni Scadute!'}
                </h2>
                <p className="text-white/90 text-sm">
                  {overdueActions.length === 1
                    ? 'Hai 1 azione che ha superato la scadenza'
                    : `Hai ${overdueActions.length} azioni che hanno superato la scadenza`}
                </p>
              </div>

              {/* Actions List */}
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {overdueActions.map((action, index) => {
                    const daysOverdue = getDaysOverdue(action.deadline!)

                    return (
                      <motion.div
                        key={action.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border border-red-200 rounded-xl p-4 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                        onClick={() => handleGoToAction(action.session.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-retro-text mb-1 line-clamp-2">
                              {action.text}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-retro-text-secondary">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(action.deadline!).toLocaleDateString('it-IT')}
                              </span>
                              <span className="text-red-600 font-medium">
                                {daysOverdue === 0
                                  ? 'Scaduta oggi'
                                  : daysOverdue === 1
                                  ? 'Scaduta ieri'
                                  : `Scaduta ${daysOverdue} giorni fa`}
                              </span>
                            </div>
                            <p className="text-xs text-retro-text-secondary mt-1">
                              📋 {action.session.title}
                            </p>
                          </div>
                          <ArrowRight size={16} className="text-red-500 shrink-0 mt-1" />
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 pt-0">
                <Button onClick={handleClose} className="w-full" variant="secondary">
                  Ho capito
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
