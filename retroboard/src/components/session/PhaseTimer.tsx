import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Square, Play, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface PhaseTimerProps {
  sessionId: string
  isOrganizer: boolean
  timerDuration: number
  timerStartedAt: string | null
  onStart: (durationSeconds: number) => void
  onStop: () => void
  onExpired: () => void
}

const PRESETS = [
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '15 min', seconds: 900 },
]

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function PhaseTimer({ isOrganizer, timerDuration, timerStartedAt, onStart, onStop, onExpired }: PhaseTimerProps) {
  const [remaining, setRemaining] = useState(0)
  const [showPopover, setShowPopover] = useState(false)
  const [customMinutes, setCustomMinutes] = useState('')
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0 })
  const [showExpired, setShowExpired] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const expiredRef = useRef(false)

  const isActive = timerStartedAt !== null && timerDuration > 0

  const calcRemaining = useCallback(() => {
    if (!timerStartedAt || timerDuration <= 0) return 0
    const elapsed = (Date.now() - new Date(timerStartedAt).getTime()) / 1000
    return Math.max(0, Math.ceil(timerDuration - elapsed))
  }, [timerStartedAt, timerDuration])

  // Countdown interval
  useEffect(() => {
    if (!isActive) {
      setRemaining(0)
      expiredRef.current = false
      setShowExpired(false)
      return
    }

    setRemaining(calcRemaining())
    expiredRef.current = false

    const interval = setInterval(() => {
      const r = calcRemaining()
      setRemaining(r)
      if (r <= 0 && !expiredRef.current) {
        expiredRef.current = true
        setShowExpired(true)
        onExpired()
        // Hide "Tempo scaduto" after 3 seconds
        setTimeout(() => setShowExpired(false), 3000)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, calcRemaining, onExpired])

  // Position popover relative to trigger button
  useEffect(() => {
    if (!showPopover || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popoverWidth = 208 // w-52 = 13rem = 208px
    // Prefer opening to the left if it would overflow the right edge
    let left = rect.left
    if (left + popoverWidth > window.innerWidth - 16) {
      left = rect.right - popoverWidth
    }
    setPopoverPos({
      top: rect.bottom + 8,
      left,
    })
  }, [showPopover])

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setShowPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPopover])

  const handleStartPreset = (seconds: number) => {
    onStart(seconds)
    setShowPopover(false)
  }

  const handleStartCustom = () => {
    const mins = parseInt(customMinutes, 10)
    if (mins > 0 && mins <= 120) {
      onStart(mins * 60)
      setShowPopover(false)
      setCustomMinutes('')
    }
  }

  // Timer attivo: mostra countdown flottante + pulsante stop
  if (isActive && remaining >= 0) {
    const shouldPulse = remaining <= 10 && remaining > 0
    const isLowTime = remaining <= 60
    const isCritical = remaining <= 15

    return (
      <>
        {/* Floating countdown at top center */}
        {createPortal(
          <AnimatePresence>
            {!showExpired && remaining > 0 && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[100]"
              >
                <motion.div
                  animate={shouldPulse ? { scale: [1, 1.08, 1] } : {}}
                  transition={shouldPulse ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : {}}
                  className={`
                    relative px-8 py-4 rounded-3xl shadow-2xl backdrop-blur-sm border-2 transition-all duration-300
                    ${isCritical
                      ? 'bg-gradient-to-br from-red-50/95 to-rose-100/95 border-red-300'
                      : isLowTime
                        ? 'bg-gradient-to-br from-amber-50/95 to-orange-100/95 border-amber-300'
                        : 'bg-gradient-to-br from-emerald-50/95 to-teal-100/95 border-emerald-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={shouldPulse ? { rotate: [0, 10, -10, 0] } : {}}
                      transition={shouldPulse ? { duration: 0.8, repeat: Infinity } : {}}
                      className={`${isCritical ? 'text-red-600' : isLowTime ? 'text-amber-600' : 'text-emerald-600'}`}
                    >
                      <Clock size={32} strokeWidth={2.5} />
                    </motion.div>
                    <div className="text-center">
                      <div className={`
                        text-5xl font-bold font-mono tracking-tight
                        ${isCritical ? 'text-red-600' : isLowTime ? 'text-amber-600' : 'text-emerald-600'}
                      `}>
                        {formatTime(remaining)}
                      </div>
                      <div className="text-xs font-medium text-retro-text-secondary uppercase tracking-wider mt-0.5">
                        Tempo rimanente
                      </div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 rounded-b-3xl"
                    style={{
                      width: `${(remaining / timerDuration) * 100}%`,
                      background: isCritical ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                : isLowTime ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                : 'linear-gradient(90deg, #10b981, #059669)',
                    }}
                    transition={{ duration: 1 }}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Tempo scaduto message */}
            {showExpired && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="fixed inset-0 flex items-center justify-center z-[150] pointer-events-none"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 2, -2, 0]
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="bg-gradient-to-br from-rose-500 to-red-600 text-white px-12 py-8 rounded-3xl shadow-2xl border-4 border-white"
                >
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="mx-auto mb-3"
                    >
                      <Timer size={48} strokeWidth={2.5} />
                    </motion.div>
                    <div className="text-4xl font-bold uppercase tracking-wide">
                      Tempo scaduto!
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Stop button for organizer (in navbar area) */}
        {isOrganizer && (
          <button
            onClick={onStop}
            className="p-1.5 rounded-lg text-retro-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Ferma timer"
          >
            <Square size={14} />
          </button>
        )}
      </>
    )
  }

  // Timer non attivo: solo organizzatore vede il pulsante
  if (!isOrganizer) return null

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setShowPopover((v) => !v)}
        className={`p-1.5 rounded-lg transition-colors ${
          showPopover
            ? 'bg-retro-primary-light text-indigo-600'
            : 'text-retro-text-secondary hover:bg-retro-sidebar hover:text-retro-text'
        }`}
        title="Timer fase"
      >
        <Timer size={16} />
      </button>

      {createPortal(
        <AnimatePresence>
          {showPopover && (
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              style={{ top: popoverPos.top, left: popoverPos.left }}
              className="fixed w-52 bg-white rounded-xl shadow-lg border border-retro-border z-[200] py-2"
            >
              <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-retro-text-secondary">
                Timer fase
              </div>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5 px-3 py-2">
                {PRESETS.map((p) => (
                  <button
                    key={p.seconds}
                    onClick={() => handleStartPreset(p.seconds)}
                    className="flex items-center justify-center gap-1.5 px-2 py-1.5 text-sm font-medium rounded-lg bg-retro-sidebar hover:bg-retro-primary-light hover:text-indigo-600 transition-colors"
                  >
                    <Play size={12} />
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Custom */}
              <div className="border-t border-retro-border mx-3 pt-2 mt-1">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={120}
                    placeholder="Min"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartCustom()}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-retro-border focus:outline-none focus:ring-1 focus:ring-retro-primary/50"
                  />
                  <Button size="sm" onClick={handleStartCustom} disabled={!customMinutes || parseInt(customMinutes, 10) <= 0}>
                    Avvia
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
