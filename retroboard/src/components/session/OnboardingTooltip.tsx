import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface OnboardingStep {
  title: string
  description: string
  icon: string
}

const ONBOARDING_STEPS: Record<number, OnboardingStep> = {
  1: {
    title: 'Inizia con il Mood',
    description: 'Condividi come ti senti oggi e valuta la collaborazione del team. Questo aiuta il team a capire lo stato emotivo generale.',
    icon: '😊'
  },
  2: {
    title: 'Quiz di Team Building',
    description: 'Rispondi al quiz per rompere il ghiaccio e guadagnare punti! Divertiti con i tuoi colleghi prima della retrospettiva vera e propria.',
    icon: '🎯'
  },
  3: {
    title: 'Retrospettiva Collaborativa',
    description: 'Aggiungi i tuoi commenti, vota quelli più importanti, raggruppali per tema e discutili insieme. Questa è la fase principale!',
    icon: '💡'
  },
  4: {
    title: 'Piano d\'Azione',
    description: 'Crea azioni concrete da portare nel prossimo sprint. Assegna responsabili e scadenze per garantire il follow-up.',
    icon: '✅'
  }
}

interface OnboardingTooltipProps {
  currentStep: number
}

export function OnboardingTooltip({ currentStep }: OnboardingTooltipProps) {
  const [dismissed, setDismissed] = useState(false)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false)

  useEffect(() => {
    // Check if user has seen onboarding before
    const seen = localStorage.getItem('retroboard_onboarding_seen')
    setHasSeenOnboarding(!!seen)
    setDismissed(!!seen)
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('retroboard_onboarding_seen', 'true')
    setDismissed(true)
    setHasSeenOnboarding(true)
  }

  const step = ONBOARDING_STEPS[currentStep]

  if (!step || dismissed || hasSeenOnboarding || currentStep > 4) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[90] max-w-md w-full mx-4"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-2xl border-2 border-white/30">
          {/* Animated background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Chiudi suggerimento"
          >
            <X size={16} />
          </button>

          {/* Content */}
          <div className="relative">
            {/* Icon and step indicator */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border-2 border-white/30">
                {step.icon}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                  Fase {currentStep} di 4
                </div>
                <h3 className="text-lg font-display font-bold">{step.title}</h3>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Progress dots */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <div
                    key={s}
                    className={`transition-all duration-300 ${
                      s === currentStep
                        ? 'w-6 h-2 rounded-full bg-white'
                        : s < currentStep
                        ? 'w-2 h-2 rounded-full bg-emerald-300'
                        : 'w-2 h-2 rounded-full bg-white/30'
                    }`}
                  />
                ))}
              </div>

              <Button
                size="sm"
                onClick={handleDismiss}
                className="!bg-white !text-indigo-600 hover:!bg-white/90 !font-semibold ml-auto"
              >
                {currentStep === 4 ? (
                  <>
                    <Check size={14} />
                    Ho capito!
                  </>
                ) : (
                  <>
                    Avanti
                    <ArrowRight size={14} />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
