import { useSession } from '@/hooks/useSession'
import { useParticipants } from '@/hooks/useParticipants'
import { useParkingLot } from '@/hooks/useParkingLot'
import { Button } from '@/components/ui/Button'
import { MoodVoting } from '@/components/mood/MoodVoting'
import { TeamMoodVoting } from '@/components/mood/TeamMoodVoting'
import { QuizGame } from '@/components/quiz/QuizGame'
import { RetroBoard } from '@/components/retro/RetroBoard'
import { GroupingPhase } from '@/components/retro/GroupingPhase'
import { VotingPhase } from '@/components/retro/VotingPhase'
import { BrainstormingPhase } from '@/components/retro/BrainstormingPhase'
import { ParkingLot } from '@/components/retro/ParkingLot'
import { ParkingLotButton } from '@/components/retro/ParkingLotButton'

import { PhaseTimer } from '@/components/session/PhaseTimer'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Badge } from '@/components/ui/Badge'
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Share2,
  ArrowRight,
  LogOut,
  PartyPopper,
  Users,
  Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface SessionWizardProps {
  sessionId: string
}

const retroPhaseLabels: Record<string, string> = {
  comments: 'Commenti',
  grouping: 'Raggruppamento',
  voting: 'Votazione',
  brainstorming: 'Brainstorming',
}

const retroPhaseOrder = ['comments', 'grouping', 'voting', 'brainstorming'] as const

const moodPhaseLabels: Record<string, string> = {
  personal: 'Personale',
  team: 'Team',
}

const moodPhaseOrder = ['personal', 'team'] as const

// Steps where Parking Lot is visible
const PARKING_LOT_STEPS = [1, 2, 3, 4]

export function SessionWizard({ sessionId }: SessionWizardProps) {
  const { session, isOrganizer, advanceStep, goToStep, setRetroPhase, setMoodPhase, markDone, resetDone, closeSession, startPhaseTimer, stopPhaseTimer } =
    useSession(sessionId)
  const { isDone, doneCount, totalParticipants, allDone, participants } = useParticipants()
  const { items } = useParkingLot(sessionId)
  const [copied, setCopied] = useState(false)
  const [showParticipantList, setShowParticipantList] = useState(false)
  const [showParkingLot, setShowParkingLot] = useState(false)
  const [prevStep, setPrevStep] = useState(session?.current_step || 1)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowParticipantList(false)
      }
    }
    if (showParticipantList) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [showParticipantList])

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || '?'
  const sortedParticipants = [...participants].sort((a, b) => Number(b.is_done) - Number(a.is_done))
  const progressPercent = totalParticipants > 0 ? (doneCount / totalParticipants) * 100 : 0

  if (!session) return null

  const currentStep = session.current_step

  const copyShareLink = () => {
    const link = `${window.location.origin}/session/${session.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const advanceRetroPhase = () => {
    const currentIdx = retroPhaseOrder.indexOf(session.retro_phase as typeof retroPhaseOrder[number])
    if (currentIdx < retroPhaseOrder.length - 1) {
      resetDone()
      setRetroPhase(retroPhaseOrder[currentIdx + 1])
    }
  }

  const goBackRetroPhase = () => {
    const currentIdx = retroPhaseOrder.indexOf(session.retro_phase as typeof retroPhaseOrder[number])
    if (currentIdx > 0) {
      setRetroPhase(retroPhaseOrder[currentIdx - 1])
    }
  }

  const advanceMoodPhase = () => {
    const currentIdx = moodPhaseOrder.indexOf(session.mood_phase as typeof moodPhaseOrder[number])
    if (currentIdx < moodPhaseOrder.length - 1) {
      resetDone()
      setMoodPhase(moodPhaseOrder[currentIdx + 1])
    }
  }

  const goBackMoodPhase = () => {
    const currentIdx = moodPhaseOrder.indexOf(session.mood_phase as typeof moodPhaseOrder[number])
    if (currentIdx > 0) {
      setMoodPhase(moodPhaseOrder[currentIdx - 1])
    }
  }

  const handleAdvanceStep = () => {
    setPrevStep(currentStep)
    resetDone()
    advanceStep()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        if (session.mood_phase === 'team') {
          return <TeamMoodVoting sessionId={sessionId} />
        }
        return <MoodVoting sessionId={sessionId} />
      case 2:
        return <QuizGame sessionId={sessionId} />
      case 3:
        switch (session.retro_phase) {
          case 'comments':
            return <RetroBoard sessionId={sessionId} />
          case 'grouping':
            return <GroupingPhase sessionId={sessionId} />
          case 'voting':
            return <VotingPhase sessionId={sessionId} />
          case 'brainstorming':
          case 'action_plan':
            return <BrainstormingPhase sessionId={sessionId} />
          default:
            return <RetroBoard sessionId={sessionId} />
        }
      case 4:
        return <KanbanBoard sessionId={sessionId} />
      default:
        return null
    }
  }

  const stepLabels = ['Mood', 'Icebreaker', 'Retro', 'Kanban']

  return (
    <div className="space-y-6">
      {/* Header - Compact layout */}
      <div className="flex flex-col gap-2">
        {/* Row 1: Title + Buttons */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-lg md:text-2xl font-bold text-retro-text">{session.title}</h1>

          {/* Right: Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              onClick={copyShareLink}
              className={`transition-all duration-300 ${
                copied
                  ? '!bg-emerald-500 !text-white !border-emerald-500 scale-105'
                  : 'hover:scale-105'
              }`}
            >
              <Share2 size={14} />
              <span className="font-medium">{copied ? '✓ Copiato!' : 'Condividi link'}</span>
            </Button>
            {isOrganizer && (
              <Button
                size="sm"
                variant="danger"
                onClick={closeSession}
                className={`${allDone && currentStep === 4 ? 'shadow-mad animate-pulse-glow' : ''}`}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Chiudi retro</span>
              </Button>
            )}
          </div>
        </div>

        {/* Row 2: Breadcrumb */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          {stepLabels.map((label, idx) => {
            const stepNum = idx + 1
            const isCurrent = stepNum === currentStep
            const isPast = stepNum < currentStep
            return (
              <div key={stepNum} className="flex items-center shrink-0">
                <Badge
                  variant={isCurrent ? 'primary' : isPast ? 'success' : 'default'}
                  className={`text-[10px] md:text-xs whitespace-nowrap ${
                    isCurrent ? 'ring-2 ring-indigo-200' : ''
                  }`}
                >
                  {isPast && <Check size={10} className="mr-1 inline" />}
                  {label}
                </Badge>
                {idx < stepLabels.length - 1 && (
                  <ArrowRight size={10} className="mx-0.5 md:mx-1 text-slate-400 shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* Copied feedback */}
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs text-emerald-600 font-medium"
          >
            ✓ Link negli appunti!
          </motion.span>
        )}
      </div>

      {/* Mood sub-phase indicator */}
      {currentStep === 1 && (
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          {moodPhaseOrder.map((phase, i) => (
            <div key={phase} className="flex items-center shrink-0">
              <Badge variant={session.mood_phase === phase ? 'primary' : 'default'} className="text-[10px] md:text-xs whitespace-nowrap">
                {moodPhaseLabels[phase]}
              </Badge>
              {i < moodPhaseOrder.length - 1 && (
                <ArrowRight size={10} className="mx-0.5 md:mx-1 text-retro-border shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Retro sub-phase indicator - Interactive */}
      {currentStep === 3 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
            {retroPhaseOrder.map((phase, i) => {
              const currentIdx = retroPhaseOrder.indexOf(session.retro_phase as typeof retroPhaseOrder[number])
              const isCompleted = i < currentIdx
              const isCurrent = session.retro_phase === phase
              return (
                <div key={phase} className="flex items-center shrink-0">
                  <button
                    onClick={() => isOrganizer && setRetroPhase(phase)}
                    disabled={!isOrganizer}
                    className={`group relative transition-all duration-200 ${isOrganizer ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <Badge
                      variant={isCurrent ? 'primary' : 'default'}
                      className={`text-[10px] md:text-xs whitespace-nowrap transition-all ${
                        isOrganizer && !isCurrent ? 'hover:scale-105 hover:shadow-sm' : ''
                      } ${isCompleted ? 'opacity-60' : ''}`}
                    >
                      {isCompleted && <Check size={10} className="mr-1 inline" />}
                      {retroPhaseLabels[phase]}
                    </Badge>
                  </button>
                  {i < retroPhaseOrder.length - 1 && (
                    <ArrowRight size={10} className="mx-0.5 md:mx-1 text-retro-border shrink-0" />
                  )}
                </div>
              )
            })}
            <div className="ml-auto shrink-0">
              <PhaseTimer
                sessionId={sessionId}
                isOrganizer={isOrganizer}
                timerDuration={session.phase_timer_duration}
                timerStartedAt={session.phase_timer_started_at}
                onStart={startPhaseTimer}
                onStop={stopPhaseTimer}
                onExpired={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast "Tutti pronti" con confetti — portal to body */}
      {createPortal(
        <AnimatePresence>
          {allDone && currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
              className="fixed top-4 right-4 z-[100] max-w-sm"
            >
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white px-5 py-4 shadow-float border-2 border-white/30">
                {/* Confetti animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(15)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 1, y: 0, x: '50%', rotate: 0 }}
                      animate={{
                        opacity: 0,
                        y: Math.random() * 150 - 75,
                        x: `${Math.random() * 200 - 50}%`,
                        rotate: Math.random() * 720 - 360,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: Math.random() * 0.2,
                        ease: [0.34, 1.56, 0.64, 1],
                        repeat: Infinity,
                        repeatDelay: 2
                      }}
                      className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: ['#FCD34D', '#34D399', '#60A5FA', '#F472B6', '#A78BFA'][
                          Math.floor(Math.random() * 5)
                        ],
                      }}
                    />
                  ))}
                </div>

                {/* Content */}
                <div className="relative flex items-start gap-3">
                  <PartyPopper size={24} className="shrink-0 mt-0.5 animate-bounce" />
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold text-base mb-1">
                      🎉 Tutti pronti!
                    </p>
                    <p className="text-sm text-white/90">
                      {totalParticipants} {totalParticipants === 1 ? 'persona ha' : 'persone hanno'} completato la fase
                    </p>
                    {isOrganizer && (
                      <p className="text-xs text-white/80 mt-2 font-medium">
                        Usa i controlli in basso per avanzare alla fase successiva
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}


      {/* Controls - glass floating action bar */}
      <div className="sticky bottom-4 md:static flex flex-wrap items-center gap-2 md:gap-3 glass-card rounded-2xl shadow-float p-3 md:p-4 border-2 border-white/40">
        {/* Left: "Ho finito" button or badge */}
        {!isDone && currentStep < 4 && (
          <Button
            variant="secondary"
            size="md"
            onClick={markDone}
            className={`${doneCount === totalParticipants - 1 ? '!bg-gradient-to-r !from-emerald-500 !to-teal-500 !text-white !border-0 animate-pulse !shadow-lg' : ''}`}
          >
            <CheckCircle2 size={16} />
            <span className="font-semibold">{doneCount === totalParticipants - 1 ? 'Sei l\'ultimo! 🎯' : 'Ho finito'}</span>
          </Button>
        )}
        {isDone && (
          <Badge variant="glad">
            <CheckCircle2 size={12} className="mr-1" /> Finito
          </Badge>
        )}

        {/* Enhanced Progress bar + milestone + avatar stack */}
        {currentStep < 4 && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-2.5 flex-1">
            {/* Milestone indicator */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`transition-all duration-300 ${
                      step < currentStep
                        ? 'w-2 h-2 rounded-full bg-emerald-500'
                        : step === currentStep
                        ? 'w-3 h-3 rounded-full bg-indigo-600 ring-2 ring-indigo-200 animate-pulse'
                        : 'w-2 h-2 rounded-full bg-slate-300'
                    }`}
                    title={`Step ${step}`}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                Fase {currentStep}/4
              </span>
            </div>

            {/* Progress bar participants */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex-1 md:w-24 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 ${
                    progressPercent === 100 ? 'shadow-glad' : ''
                  }`}
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                {doneCount}/{totalParticipants}
              </span>
            </div>

            {/* Avatar stack with pulse on completion */}
            <div className="flex items-center -space-x-1.5">
              {participants.slice(0, 8).map((p) => (
                <motion.div
                  key={p.id}
                  title={p.profiles?.name || 'Partecipante'}
                  animate={p.is_done ? { scale: [1, 1.2, 1] } : {}}
                  transition={p.is_done ? { duration: 0.4, ease: 'easeInOut' } : {}}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white transition-colors duration-200 ${
                    p.is_done
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {p.is_done ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Check size={12} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    getInitial(p.profiles?.name || '')
                  )}
                </motion.div>
              ))}
              {participants.length > 8 && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-100 text-slate-500 border-2 border-white">
                  +{participants.length - 8}
                </div>
              )}
            </div>

            {/* Popover toggle (moderatore) */}
            {isOrganizer && (
              <div className="relative" ref={popoverRef}>
                <button
                  onClick={() => setShowParticipantList((v) => !v)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    showParticipantList
                      ? 'bg-retro-primary-light text-indigo-600'
                      : 'text-retro-text-secondary hover:bg-retro-sidebar hover:text-retro-text'
                  }`}
                  title="Dettagli partecipanti"
                >
                  <Users size={16} />
                </button>

                {/* Popover lista partecipanti */}
                <AnimatePresence>
                  {showParticipantList && (
                    <motion.div
                      initial={{ opacity: 0, y: 4, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-retro-border z-50 py-2 max-h-64 overflow-y-auto"
                    >
                      <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-retro-text-secondary">
                        Partecipanti ({doneCount}/{totalParticipants})
                      </div>
                      {sortedParticipants.map((p) => (
                        <div key={p.id} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-retro-sidebar">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              p.is_done
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            {getInitial(p.profiles?.name || '')}
                          </div>
                          <span className="text-sm text-retro-text truncate flex-1">
                            {p.profiles?.name || 'Partecipante'}
                          </span>
                          <Badge variant={p.is_done ? 'glad' : 'default'} className="text-[10px] px-2 py-0.5">
                            {p.is_done ? 'Pronto' : 'In attesa'}
                          </Badge>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {/* Right: organizer controls */}
        {isOrganizer && (
          <div className="ml-auto flex gap-2 flex-wrap justify-end">
            {currentStep === 1 && session.mood_phase !== 'personal' && (
              <Button size="sm" variant="ghost" onClick={goBackMoodPhase}>
                <ChevronLeft size={14} /> Fase precedente
              </Button>
            )}
            {currentStep === 3 && session.retro_phase !== 'comments' && (
              <Button size="sm" variant="ghost" onClick={goBackRetroPhase}>
                <ChevronLeft size={14} /> Fase precedente
              </Button>
            )}
            {currentStep === 4 && (
              <Button size="sm" variant="ghost" onClick={() => goToStep(3)}>
                <ChevronLeft size={14} /> Torna alla retro
              </Button>
            )}
            {currentStep === 1 && session.mood_phase !== 'team' && (
              <Button size="sm" variant="secondary" onClick={advanceMoodPhase}>
                Fase successiva <ChevronRight size={14} />
              </Button>
            )}
            {currentStep === 3 && session.retro_phase !== 'brainstorming' && session.retro_phase !== 'action_plan' && (
              <Button size="sm" variant="secondary" onClick={advanceRetroPhase}>
                Fase successiva <ChevronRight size={14} />
              </Button>
            )}
            {currentStep < 4 && (
              <Button size="sm" onClick={handleAdvanceStep}>
                Passo successivo <ChevronRight size={14} />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentStep}-${session.retro_phase}`}
          initial={{ opacity: 0, x: currentStep > prevStep ? 60 : -60, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: currentStep > prevStep ? -60 : 60, scale: 0.95 }}
          transition={{
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
            opacity: { duration: 0.3 }
          }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>

      {/* Parking Lot */}
      {PARKING_LOT_STEPS.includes(currentStep) && (
        <>
          <ParkingLotButton
            onClick={() => setShowParkingLot(true)}
            count={items.filter((item) => !item.is_converted).length}
          />
          <ParkingLot
            sessionId={sessionId}
            isOpen={showParkingLot}
            onClose={() => setShowParkingLot(false)}
          />
        </>
      )}
    </div>
  )
}
