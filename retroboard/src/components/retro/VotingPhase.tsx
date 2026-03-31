import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { CommentCard } from './CommentCard'
import { useSessionStore } from '@/stores/sessionStore'
import { useMemo } from 'react'
import { Heart, EyeOff } from 'lucide-react'

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
  const { toggleVote, getVoteCount, hasUserVoted, getVoterNames, remainingVotes } = useVotes(commentIds, sessionId, maxVotes)

  // Only show parent comments (not grouped)
  const parentComments = comments.filter((c) => !c.group_id)
  const getGrouped = (parentId: string) => comments.filter((c) => c.group_id === parentId)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-retro-text mb-2">Vota i commenti</h2>
        {maxVotes === 0 ? (
          <p className="text-sm text-retro-text-secondary">Votazione disabilitata per questa sessione.</p>
        ) : (
          <>
            <p className="text-sm text-retro-text-secondary">Hai {maxVotes} voti a disposizione. Clicca per votare o togliere il voto.</p>
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
          </>
        )}
        {!revealed && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-retro-text-secondary mt-2">
            <EyeOff size={12} />
            I voti degli altri saranno visibili dopo la rivelazione
          </p>
        )}
      </div>

      {sections.map((section, idx) => {
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
      })}
    </div>
  )
}
