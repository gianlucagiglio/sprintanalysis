import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-10 w-full max-w-md glass-card rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between p-5 border-b border-white/20">
              <h2 className="text-lg font-heading font-semibold text-retro-text">{title}</h2>
              <button
                onClick={onClose}
                aria-label="Chiudi finestra"
                className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-full hover:bg-white/50 text-retro-text-secondary transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-glass-primary/50"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
