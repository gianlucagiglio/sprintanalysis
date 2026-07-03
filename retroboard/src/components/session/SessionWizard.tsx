import { useSession } from '@/hooks/useSession'
import { useParticipants } from '@/hooks/useParticipants'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Button } from '@/components/ui/Button'
import { MoodVoting } from '@/components/mood/MoodVoting'
import { TeamMoodVoting } from '@/components/mood/TeamMoodVoting'
import { QuizGame } from '@/components/quiz/QuizGame'
import { RetroBoard } from '@/components/retro/RetroBoard'
import { VotingPhase } from '@/components/retro/VotingPhase'
import { GroupingPhase } from '@/components/retro/GroupingPhase'
import { BrainstormingPhase } from '@/components/retro/BrainstormingPhase'

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
  Eye,
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
  voting: 'Votazione',
  grouping: 'Raggruppamento',
  brainstorming: 'Brainstorming',
}

const retroPhaseOrder = ['comments', 'grouping', 'voting', 'brainstorming'] as const

const moodPhaseLabels: Record<string, string> = {
  personal: 'Personale',
  team: 'Team',
}

const moodPhaseOrder = ['personal', 'team'] as const

export function SessionWizard({ sessionId }: SessionWizardProps) {
  const { session, isOrganizer, advanceStep, goToStep, setRetroPhase, setMoodPhase, revealRetro, markDone, resetDone, closeSession, startPhaseTimer, stopPhaseTimer } =
    useSession(sessionId)
  const { isDone, doneCount, totalParticipants, allDone, participants } = useParticipants()
  const [copied, setCopied] = useState(false)
  const [showParticipantList, setShowParticipantList] = useState(false)
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
          case 'voting':
            return <VotingPhase sessionId={sessionId} />
          case 'grouping':
            return <GroupingPhase sessionId={sessionId} />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold text-retro-text truncate">{session.title}</h1>
            <button
              onClick={copyShareLink}
              className="inline-flex items-center gap-1.5 text-xs text-retro-text-secondary hover:text-retro-primary mt-1 px-2 py-1 rounded-full hover:bg-retro-primary-light transition-all duration-200"
            >
              <Share2 size={12} />
              {copied ? 'Copiato!' : 'Condividi'}
            </button>
          </div>
          {isOrganizer && (
            <Button size="sm" variant="danger" onClick={closeSession} className="shrink-0">
              <LogOut size={14} />
              <span className="hidden sm:inline">Chiudi retro</span>
            </Button>
          )}
        </div>
        <StepIndicator currentStep={currentStep} onStepClick={isOrganizer ? goToStep : undefined} />
      </div>

      {/* Mood sub-phase indicator */}
      {currentStep === 1 && (
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-thin">
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

      {/* Retro sub-phase indicator */}
      {currentStep === 3 && (
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {retroPhaseOrder.map((phase, i) => (
            <div key={phase} className="flex items-center shrink-0">
              <Badge variant={session.retro_phase === phase ? 'primary' : 'default'} className="text-[10px] md:text-xs whitespace-nowrap">
                {retroPhaseLabels[phase]}
              </Badge>
              {i < retroPhaseOrder.length - 1 && (
                <ArrowRight size={10} className="mx-0.5 md:mx-1 text-retro-border shrink-0" />
              )}
            </div>
          ))}
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
      )}

      {/* Toast "Tutti pronti" — portal to body */}
      {createPortal(
        <AnimatePresence>
          {allDone && currentStep < 4 && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-4 right-4 z-[100] flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-4 py-3 shadow-lg max-w-xs"
            >
              <PartyPopper size={18} className="shrink-0" />
              <span className="text-sm font-medium">Tutti pronti! Avanza allo step successivo.</span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}


      {/* Controls - floating action bar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 bg-white rounded-2xl shadow-soft p-3 md:p-4">
        {/* Left: "Ho finito" button or badge */}
        {!isDone && currentStep < 4 && (
          <Button variant="secondary" size="sm" onClick={markDone}>
            <CheckCircle2 size={14} />
            Ho finito
          </Button>
        )}
        {isDone && (
          <Badge variant="glad">
            <CheckCircle2 size={12} className="mr-1" /> Finito
          </Badge>
        )}

        {/* Progress bar + avatar stack */}
        {currentStep < 4 && (
          <div className="flex items-center gap-2.5">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
              <span className="text-xs font-medium text-retro-text-secondary whitespace-nowrap">
                {doneCount}/{totalParticipants}
              </span>
            </div>

            {/* Avatar stack */}
            <div className="flex items-center -space-x-1.5">
              {participants.slice(0, 8).map((p) => (
                <div
                  key={p.id}
                  title={p.profiles?.name || 'Partecipante'}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white transition-colors duration-200 ${
                    p.is_done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {p.is_done ? (
                    <Check size={12} strokeWidth={3} />
                  ) : (
                    getInitial(p.profiles?.name || '')
                  )}
                </div>
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
            {currentStep === 3 && (session.retro_phase === 'comments' || session.retro_phase === 'grouping') && !session.retro_revealed && (
              <Button size="sm" variant="secondary" onClick={revealRetro}>
                <Eye size={14} /> Mostra risultati
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
