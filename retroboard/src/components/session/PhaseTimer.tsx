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
  const [customSeconds, setCustomSeconds] = useState('')
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
    const mins = parseInt(customMinutes, 10) || 0
    const secs = parseInt(customSeconds, 10) || 0
    const totalSeconds = mins * 60 + secs
    if (totalSeconds > 0 && totalSeconds <= 7200) { // max 2 hours
      onStart(totalSeconds)
      setShowPopover(false)
      setCustomMinutes('')
      setCustomSeconds('')
    }
  }

  // Timer attivo: mostra countdown flottante + pulsante stop
  if (isActive && remaining > 0) {
    const shouldPulse = remaining <= 10 && remaining > 0
    const isLowTime = remaining <= 60
    const isCritical = remaining <= 15

    return (
      <>
        {/* Full-width countdown bar at top */}
        {createPortal(
          <AnimatePresence>
            {!showExpired && remaining > 0 && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="fixed top-0 left-0 right-0 z-[100]"
              >
                <div className={`
                  relative backdrop-blur-xl border-b-2 transition-all duration-500 shadow-xl
                  ${isCritical
                    ? 'bg-white/95 border-red-400/60 shadow-red-500/20'
                    : isLowTime
                      ? 'bg-white/95 border-amber-400/60 shadow-amber-500/20'
                      : 'bg-white/95 border-emerald-400/60 shadow-emerald-500/20'
                  }
                `}>
                  {/* Glow effect */}
                  <div className={`absolute inset-0 blur-2xl opacity-30 -z-10 ${
                    isCritical ? 'bg-red-400' : isLowTime ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />

                  <div className="h-14 md:h-16 max-w-7xl mx-auto px-3 md:px-6">
                    <div className="h-full flex items-center justify-between">
                      {/* Left: Icon + Time */}
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shadow-lg
                          ${isCritical
                            ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/50'
                            : isLowTime
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/50'
                              : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/50'
                          }
                        `}>
                          <motion.div
                            animate={shouldPulse ? { rotate: [0, 10, -10, 0] } : {}}
                            transition={shouldPulse ? { duration: 1, repeat: Infinity } : {}}
                          >
                            <Clock size={24} className="text-white" strokeWidth={2.5} />
                          </motion.div>
                        </div>

                        <div>
                          <div className={`
                            text-4xl font-black tracking-tight leading-none tabular-nums
                            bg-gradient-to-br bg-clip-text text-transparent
                            ${isCritical
                              ? 'from-red-600 to-rose-700'
                              : isLowTime
                                ? 'from-amber-600 to-orange-700'
                                : 'from-emerald-600 to-teal-700'
                            }
                          `}>
                            {formatTime(remaining)}
                          </div>
                          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                            Tempo rimanente
                          </div>
                        </div>
                      </div>

                      {/* Right: Progress indicator */}
                      <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-bold text-slate-700">
                              {Math.round((remaining / timerDuration) * 100)}%
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                              Completato
                            </div>
                          </div>
                          <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                              className="h-full rounded-full"
                              style={{
                                width: `${(remaining / timerDuration) * 100}%`,
                                background: isCritical
                                  ? 'linear-gradient(90deg, #ef4444, #f43f5e)'
                                  : isLowTime
                                    ? 'linear-gradient(90deg, #f59e0b, #fb923c)'
                                    : 'linear-gradient(90deg, #10b981, #14b8a6)',
                              }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>

                        {/* Extend +5min and Stop buttons for organizer */}
                        {isOrganizer && (
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => onStart(timerDuration + 300)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transition-all duration-200"
                              title="Aggiungi 5 minuti"
                            >
                              <span className="text-sm font-bold">+5</span>
                              <Clock size={14} strokeWidth={2.5} />
                            </motion.button>
                            <motion.button
                              onClick={onStop}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gradient-to-br from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 transition-all duration-200"
                            >
                              <Square size={14} strokeWidth={2.5} fill="currentColor" />
                              <span className="text-sm font-semibold hidden sm:inline">Stop</span>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tempo scaduto message - top right corner */}
            {showExpired && (
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="fixed top-5 right-5 z-[150]"
              >
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="bg-gradient-to-br from-rose-500 to-red-600 text-white px-5 py-3 rounded-2xl shadow-xl border-2 border-red-300"
                >
                  <div className="flex items-center gap-2">
                    <Timer size={20} strokeWidth={2.5} />
                    <div className="text-lg font-bold">
                      Tempo scaduto!
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </>
    )
  }

  // Timer non attivo: solo organizzatore vede il pulsante
  if (!isOrganizer) return null

  return (
    <>
      <motion.button
        ref={triggerRef}
        onClick={() => setShowPopover((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          group relative inline-flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-200
          ${showPopover
            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200'
            : 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 hover:border-indigo-300 hover:shadow-md'
          }
        `}
        title="Timer fase"
      >
        <motion.div
          animate={{ rotate: showPopover ? 360 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Timer size={18} strokeWidth={2.5} />
        </motion.div>
        <span className="text-sm font-semibold">Timer</span>
        {!showPopover && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        )}
      </motion.button>

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
                <div className="text-[10px] font-semibold uppercase tracking-wider text-retro-text-secondary mb-1.5">
                  Personalizzato
                </div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    placeholder="Min"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartCustom()}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-retro-border focus:outline-none focus:ring-1 focus:ring-retro-primary/50"
                  />
                  <span className="text-xs text-retro-text-secondary">:</span>
                  <input
                    type="number"
                    min={0}
                    max={59}
                    placeholder="Sec"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartCustom()}
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-retro-border focus:outline-none focus:ring-1 focus:ring-retro-primary/50"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleStartCustom}
                  disabled={!customMinutes && !customSeconds}
                  className="w-full"
                >
                  Avvia
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
