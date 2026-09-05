import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { CommentCard } from './CommentCard'
import { LiveVotingChart } from './LiveVotingChart'
import { useSessionStore } from '@/stores/sessionStore'
import { useMemo, useState } from 'react'
import { Heart, EyeOff, Vote, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'

interface VotingPhaseProps {
  sessionId: string
}

const sectionPills = [
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

export function VotingPhase({ sessionId }: VotingPhaseProps) {
  const sections = useSessionStore((s) => s.sections)
  const session = useSessionStore((s) => s.session)
  const revealed = session?.retro_revealed ?? true
  const { comments } = useComments(sessionId, sections)
  const maxVotes = session?.max_votes ?? 3
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { votes, toggleVote, getVoteCount, hasUserVoted, getVoterNames, remainingVotes } = useVotes(commentIds, sessionId, maxVotes)
  const [showChart, setShowChart] = useState(false)

  // Only show parent comments (not grouped)
  const parentComments = comments.filter((c) => !c.group_id)
  const getGrouped = (parentId: string) => comments.filter((c) => c.group_id === parentId)

  // Build voter names map for chart
  const voterNamesMap = useMemo(() => {
    const map = new Map<string, string[]>()
    commentIds.forEach((commentId) => {
      map.set(commentId, getVoterNames(commentId))
    })
    return map
  }, [commentIds, getVoterNames])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        variant="centered"
        title="Vota i commenti"
        description={
          maxVotes === 0
            ? "Votazione disabilitata per questa sessione."
            : `Hai ${maxVotes} voti a disposizione. Clicca per votare o togliere il voto.`
        }
        gradient="primary"
      >
        {maxVotes > 0 && (
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {maxVotes <= 6 ? (
              Array.from({ length: maxVotes }).map((_, i) => (
                <Heart
                  key={i}
                  size={18}
                  className={i < remainingVotes ? 'text-rose-500 fill-rose-500' : 'text-retro-border'}
                />
              ))
            ) : (
              <Heart size={18} className={remainingVotes > 0 ? 'text-rose-500 fill-rose-500' : 'text-retro-border'} />
            )}
            <span className="text-sm text-retro-text-secondary ml-2">
              {remainingVotes} voti rimanenti
            </span>
          </div>
        )}
        {!revealed && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-retro-text-secondary mt-2">
            <EyeOff size={12} />
            I voti degli altri saranno visibili dopo la rivelazione
          </p>
        )}
      </PageHeader>

      {/* Toggle chart button */}
      {maxVotes > 0 && parentComments.length > 0 && (
        <div className="flex justify-center mb-4">
          <Button
            variant={showChart ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowChart(!showChart)}
          >
            <BarChart3 size={16} />
            {showChart ? 'Nascondi risultati' : 'Mostra risultati'}
          </Button>
        </div>
      )}

      {/* Live chart */}
      {showChart && (
        <div className="mb-6 glass-card rounded-2xl p-5">
          <LiveVotingChart
            comments={parentComments}
            votes={votes}
            sections={sections}
            revealed={revealed}
            voterNames={voterNamesMap}
          />
        </div>
      )}

      {parentComments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4 shadow-sm">
            <Vote size={32} className="text-rose-500" />
          </div>
          <h3 className="text-lg font-heading font-semibold text-slate-800 mb-2">
            Nessun commento da votare
          </h3>
          <p className="text-sm text-slate-600 max-w-md">
            Non ci sono ancora commenti nelle sezioni. Torna alla fase precedente per aggiungere idee!
          </p>
        </div>
      ) : (
        sections.map((section, idx) => {
          const sectionComments = parentComments.filter((c) => c.section_id === section.id)
          if (!sectionComments.length) return null
          return (
            <div key={section.id}>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-3 ${sectionPills[idx % sectionPills.length]}`}>
                {section.name}
              </span>
              <div className="space-y-2">
                {sectionComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    votingMode
                    hasVoted={hasUserVoted(comment.id)}
                    voteCount={revealed ? getVoteCount(comment.id) : (hasUserVoted(comment.id) ? 1 : 0)}
                    canVote={remainingVotes > 0}
                    onToggleVote={() => toggleVote(comment.id)}
                    voterNames={revealed ? getVoterNames(comment.id) : []}
                    grouped={getGrouped(comment.id)}
                    groupCount={getGrouped(comment.id).length}
                  />
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
