import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useBadges } from '@/hooks/useBadges'
import { X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function BadgeUnlockedToast() {
  const { unseenBadges, markBadgeSeen } = useBadges()
  const [currentBadge, setCurrentBadge] = useState<typeof unseenBadges[0] | null>(null)

  useEffect(() => {
    if (unseenBadges.length > 0 && !currentBadge) {
      setCurrentBadge(unseenBadges[0])
    }
  }, [unseenBadges, currentBadge])

  const handleDismiss = () => {
    if (currentBadge) {
      markBadgeSeen(currentBadge.id)
      setCurrentBadge(null)

      // Show next badge if any
      setTimeout(() => {
        const remaining = unseenBadges.filter((b) => b.id !== currentBadge.id)
        if (remaining.length > 0) {
          setCurrentBadge(remaining[0])
        }
      }, 500)
    }
  }

  if (!currentBadge) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-md px-4"
      >
        <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 text-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={20} className="text-yellow-300" />
              <p className="text-sm font-semibold uppercase tracking-wide">
                Badge Sbloccato!
              </p>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', duration: 0.8 }}
                className="text-6xl"
              >
                {currentBadge.badge.icon}
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  {currentBadge.badge.name}
                </h3>
                <p className="text-sm text-white/80">
                  {currentBadge.badge.description}
                </p>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              variant="secondary"
              size="sm"
              className="w-full !bg-white !text-indigo-600 hover:!bg-white/90"
            >
              Fantastico!
            </Button>
          </div>

          {/* Confetti effect */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0, x: '50%' }}
                animate={{
                  opacity: 0,
                  y: Math.random() * 200 - 100,
                  x: `${Math.random() * 200 - 50}%`,
                  rotate: Math.random() * 360,
                }}
                transition={{ duration: 1, delay: Math.random() * 0.3 }}
                className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
