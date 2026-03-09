import { useMemo } from 'react'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'
import { CommentCard } from './CommentCard'
import { CommentInput } from './CommentInput'
import { Card } from '@/components/ui/Card'
import { EyeOff } from 'lucide-react'

interface RetroBoardProps {
  sessionId: string
}

const sectionStyles = [
  { border: 'border-l-emerald-400', bg: 'bg-emerald-50/50', pill: 'bg-emerald-100 text-emerald-700' },
  { border: 'border-l-rose-400', bg: 'bg-rose-50/50', pill: 'bg-rose-100 text-rose-700' },
  { border: 'border-l-sky-400', bg: 'bg-sky-50/50', pill: 'bg-sky-100 text-sky-700' },
]

export function RetroBoard({ sessionId }: RetroBoardProps) {
  const sections = useSessionStore((s) => s.sections)
  const session = useSessionStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const revealed = session?.retro_revealed ?? true
  const { comments, addComment } = useComments(sessionId, sections)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount } = useVotes(commentIds, sessionId)

  const visibleComments = useMemo(
    () => revealed ? comments : comments.filter((c) => c.user_id === user?.id),
    [comments, revealed, user?.id]
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-retro-text mb-2">Retrospettiva</h2>
        <p className="text-sm text-retro-text-secondary">Aggiungi i tuoi commenti in ogni sezione</p>
        {!revealed && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-retro-text-secondary mt-2">
            <EyeOff size={12} />
            I commenti degli altri saranno visibili dopo la rivelazione
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section, i) => {
          const style = sectionStyles[i % sectionStyles.length]
          const sectionComments = visibleComments.filter(
            (c) => c.section_id === section.id && !c.group_id
          )
          return (
            <Card
              key={section.id}
              className={`!p-4 border-l-4 ${style.border} ${style.bg}`}
            >
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-3 ${style.pill}`}>
                {section.name}
              </span>
              <div className="space-y-2 mb-3">
                {sectionComments.map((comment) => (
                  <CommentCard
                    key={comment.id}
                    comment={comment}
                    voteCount={getVoteCount(comment.id)}
                  />
                ))}
              </div>
              <CommentInput
                onSubmit={(text) => addComment(section.id, text)}
                placeholder={`Aggiungi a "${section.name}"...`}
              />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
