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
        initial={{ opacity: 0, x: 100, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.9 }}
        transition={{ type: 'spring', duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed top-4 right-4 z-[200] w-full max-w-md px-4"
      >
        <div
          className="relative bg-glass-vibrant-purple rounded-3xl p-8 text-white overflow-hidden border-4 border-white vibrant-block"
          style={{ boxShadow: 'var(--block-shadow)' }}
        >
          {/* Close button - Vibrant Style */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-10 h-10 rounded-xl bg-white/30 hover:bg-white/50 flex items-center justify-center transition-all hover:scale-105 border-2 border-white/40 z-10"
            style={{ transition: 'var(--transition-vibrant)' }}
          >
            <X size={18} />
          </button>

          {/* Content - Vibrant Block Layout */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles size={24} className="text-glass-vibrant-yellow animate-bounce-gentle" />
              <p className="text-base font-display font-bold uppercase tracking-wide">
                Badge Sbloccato!
              </p>
              <Sparkles size={24} className="text-glass-vibrant-yellow animate-bounce-gentle" />
            </div>

            <div className="flex items-center gap-6 mb-8">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
                className="text-8xl vibrant-bounce flex-shrink-0"
              >
                {currentBadge.badge.icon}
              </motion.div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-display font-bold mb-2 leading-tight">
                  {currentBadge.badge.name}
                </h3>
                <p className="text-sm font-heading font-medium text-white/90 leading-relaxed">
                  {currentBadge.badge.description}
                </p>
              </div>
            </div>

            <Button
              onClick={handleDismiss}
              variant="secondary"
              size="sm"
              className="w-full !bg-white !text-glass-vibrant-purple hover:!bg-white/90 !py-3 !text-base font-heading font-bold !rounded-2xl hover:scale-105"
              style={{ transition: 'var(--transition-vibrant)' }}
            >
              Fantastico!
            </Button>
          </div>

          {/* Enhanced Confetti effect with vibrant colors */}
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
                transition={{ duration: 1, delay: Math.random() * 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#F59E0B', '#10B981', '#EF4444', '#2563EB', '#8B5CF6'][
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
