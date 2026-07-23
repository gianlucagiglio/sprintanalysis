import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useUnseenBadges } from '@/hooks/useUnseenBadges'
import { Button } from '@/components/ui/Button'

export function BadgeUnlockModal() {
  const { unseenBadges, markAllAsSeen, hasUnseen } = useUnseenBadges()
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Mostra il modal quando ci sono nuovi badge
  useEffect(() => {
    if (hasUnseen && unseenBadges.length > 0) {
      setIsOpen(true)
      setCurrentIndex(0)
    }
  }, [hasUnseen, unseenBadges.length])

  const handleClose = async () => {
    setIsOpen(false)
    await markAllAsSeen()
  }

  const handleNext = () => {
    if (currentIndex < unseenBadges.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    } else {
      handleClose()
    }
  }

  if (!isOpen || unseenBadges.length === 0) return null

  const currentBadge = unseenBadges[currentIndex]

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
              initial={{ scale: 0.5, opacity: 0, rotateY: -180 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-center">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-2"
                >
                  <Sparkles size={20} className="text-yellow-300" />
                  <h2 className="text-xl font-bold text-white">
                    Nuovo Badge Sbloccato!
                  </h2>
                  <Sparkles size={20} className="text-yellow-300" />
                </motion.div>

                {unseenBadges.length > 1 && (
                  <p className="text-white/80 text-sm">
                    {currentIndex + 1} di {unseenBadges.length}
                  </p>
                )}
              </div>

              {/* Badge Content */}
              <div className="p-8 text-center">
                <motion.div
                  key={currentBadge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.5, delay: 0.3 }}
                  className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-amber-100 to-yellow-100 border-4 border-amber-300 shadow-lg mb-6 animate-pulse-glow"
                >
                  <span className="text-6xl">{currentBadge.badge.icon}</span>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-2xl font-bold text-retro-text mb-2">
                    {currentBadge.badge.name}
                  </h3>
                  <p className="text-retro-text-secondary mb-6">
                    {currentBadge.badge.description}
                  </p>

                  {/* Category badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium mb-6">
                    {getCategoryIcon(currentBadge.badge.category)}
                    <span className="capitalize">{currentBadge.badge.category}</span>
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="flex gap-3">
                  {currentIndex < unseenBadges.length - 1 ? (
                    <Button onClick={handleNext} className="flex-1" variant="primary">
                      Prossimo Badge →
                    </Button>
                  ) : (
                    <Button onClick={handleClose} className="flex-1" variant="primary">
                      Fantastico! ✨
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    participation: '🎯',
    contribution: '💬',
    team: '🤝',
    special: '👑',
  }
  return icons[category] || '⭐'
}
