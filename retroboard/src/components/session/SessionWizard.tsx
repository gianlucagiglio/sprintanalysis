import { useSession } from '@/hooks/useSession'
import { useParticipants } from '@/hooks/useParticipants'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { Button } from '@/components/ui/Button'
import { MoodVoting } from '@/components/mood/MoodVoting'
import { QuizGame } from '@/components/quiz/QuizGame'
import { RetroBoard } from '@/components/retro/RetroBoard'
import { VotingPhase } from '@/components/retro/VotingPhase'
import { GroupingPhase } from '@/components/retro/GroupingPhase'
import { BrainstormingPhase } from '@/components/retro/BrainstormingPhase'
import { ActionPlan } from '@/components/retro/ActionPlan'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'
import { Badge } from '@/components/ui/Badge'
import {
  ChevronRight,
  CheckCircle2,
  Share2,
  ArrowRight,
  LogOut,
  Eye,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface SessionWizardProps {
  sessionId: string
}

const retroPhaseLabels: Record<string, string> = {
  comments: 'Commenti',
  grouping: 'Raggruppamento',
  voting: 'Votazione',
  brainstorming: 'Brainstorming',
  action_plan: "Piano d'azione",
}

const retroPhaseOrder = ['comments', 'grouping', 'voting', 'brainstorming', 'action_plan'] as const

export function SessionWizard({ sessionId }: SessionWizardProps) {
  const { session, isOrganizer, advanceStep, setRetroPhase, revealRetro, markDone, resetDone, closeSession } =
    useSession(sessionId)
  const { isDone, doneCount, totalParticipants } = useParticipants()
  const [copied, setCopied] = useState(false)

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

  const handleAdvanceStep = () => {
    resetDone()
    advanceStep()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
            return <BrainstormingPhase sessionId={sessionId} />
          case 'action_plan':
            return <ActionPlan sessionId={sessionId} />
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-retro-text">{session.title}</h1>
          <button
            onClick={copyShareLink}
            className="inline-flex items-center gap-1.5 text-xs text-retro-text-secondary hover:text-retro-primary mt-1.5 px-3 py-1.5 rounded-full hover:bg-retro-primary-light transition-all duration-200"
          >
            <Share2 size={12} />
            {copied ? 'Link copiato!' : 'Condividi sessione'}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <StepIndicator currentStep={currentStep} />
          {isOrganizer && (
            <Button size="sm" variant="danger" onClick={closeSession}>
              <LogOut size={14} />
              Chiudi retro
            </Button>
          )}
        </div>
      </div>

      {/* Retro sub-phase indicator */}
      {currentStep === 3 && (
        <div className="flex items-center gap-2 flex-wrap">
          {retroPhaseOrder.map((phase, i) => (
            <div key={phase} className="flex items-center">
              <Badge variant={session.retro_phase === phase ? 'primary' : 'default'}>
                {retroPhaseLabels[phase]}
              </Badge>
              {i < retroPhaseOrder.length - 1 && (
                <ArrowRight size={12} className="mx-1 text-retro-border" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Controls - floating action bar */}
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-soft p-4">
        {!isDone && currentStep < 4 && (
          <Button variant="secondary" onClick={markDone}>
            <CheckCircle2 size={16} />
            Ho finito
          </Button>
        )}
        {isDone && (
          <Badge variant="glad">
            <CheckCircle2 size={12} className="mr-1" /> Hai finito
          </Badge>
        )}
        <span className="text-xs text-retro-text-secondary">
          {doneCount}/{totalParticipants} completati
        </span>
        {isOrganizer && (
          <div className="ml-auto flex gap-2">
            {currentStep === 3 && session.retro_phase !== 'action_plan' && (() => {
              const needsReveal = (session.retro_phase === 'comments' || session.retro_phase === 'voting') && !session.retro_revealed
              return needsReveal ? (
                <Button size="sm" variant="secondary" onClick={revealRetro}>
                  <Eye size={14} /> Mostra risultati
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={advanceRetroPhase}>
                  Fase successiva <ChevronRight size={14} />
                </Button>
              )
            })()}
            {(currentStep < 4 && (currentStep !== 3 || session.retro_phase === 'action_plan')) && (
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
