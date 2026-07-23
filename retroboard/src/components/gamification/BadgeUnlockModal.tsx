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
              transition={{ type: 'spring', duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden border-4 border-glass-vibrant-purple vibrant-block"
              style={{ boxShadow: 'var(--block-shadow)' }}
            >
              {/* Header - Vibrant Block Style */}
              <div className="relative bg-glass-vibrant-purple p-12 text-center">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 p-3 rounded-xl bg-white/30 hover:bg-white/50 text-white transition-all hover:scale-105 border-2 border-white/40"
                >
                  <X size={20} />
                </button>

                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                  className="flex flex-col items-center justify-center gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={24} className="text-glass-vibrant-yellow animate-bounce-gentle" />
                    <Sparkles size={24} className="text-glass-vibrant-yellow animate-bounce-gentle" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                    Nuovo Badge<br/>Sbloccato!
                  </h2>
                </motion.div>

                {unseenBadges.length > 1 && (
                  <div className="mt-4 inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl border-2 border-white/30">
                    <p className="text-white font-heading font-semibold text-sm">
                      {currentIndex + 1} di {unseenBadges.length}
                    </p>
                  </div>
                )}
              </div>

              {/* Badge Content - Vibrant Style with Large Spacing */}
              <div className="p-12 text-center" style={{ gap: 'var(--block-gap)' }}>
                <motion.div
                  key={currentBadge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 0.5, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  className="inline-flex items-center justify-center w-40 h-40 rounded-3xl bg-glass-vibrant-yellow border-4 border-white shadow-lg mb-12 vibrant-bounce"
                  style={{ boxShadow: '0 20px 40px rgba(245, 158, 11, 0.4)' }}
                >
                  <span className="text-8xl">{currentBadge.badge.icon}</span>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                  className="space-y-6"
                >
                  <h3 className="text-3xl font-display font-bold text-retro-text">
                    {currentBadge.badge.name}
                  </h3>
                  <p className="text-base font-heading font-medium text-retro-text-secondary">
                    {currentBadge.badge.description}
                  </p>

                  {/* Category badge - Vibrant Block */}
                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-glass-vibrant-purple text-white rounded-2xl font-heading font-semibold border-4 border-white shadow-lg">
                    <span className="text-2xl">{getCategoryIcon(currentBadge.badge.category)}</span>
                    <span className="capitalize text-lg">{currentBadge.badge.category}</span>
                  </div>
                </motion.div>

                {/* Actions - Vibrant Buttons */}
                <div className="flex gap-4 mt-12">
                  {currentIndex < unseenBadges.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      className="flex-1 !py-4 !text-lg font-heading font-bold !rounded-2xl hover:scale-105 transition-transform"
                      variant="primary"
                      style={{ transition: 'var(--transition-vibrant)' }}
                    >
                      Prossimo Badge →
                    </Button>
                  ) : (
                    <Button
                      onClick={handleClose}
                      className="flex-1 !py-4 !text-lg font-heading font-bold !rounded-2xl hover:scale-105 transition-transform"
                      variant="primary"
                      style={{ transition: 'var(--transition-vibrant)' }}
                    >
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
