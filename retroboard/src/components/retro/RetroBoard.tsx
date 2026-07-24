import { useMemo } from 'react'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'
import { CommentCard } from './CommentCard'
import { CommentInput } from './CommentInput'
import { Card } from '@/components/ui/Card'
import { EyeOff, Lightbulb, MessageSquarePlus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'

interface RetroBoardProps {
  sessionId: string
}

const sectionStyles = [
  { border: 'border-l-emerald-500', bg: 'bg-gradient-to-br from-emerald-50 to-teal-50', pill: 'bg-emerald-500 text-white shadow-sm' },
  { border: 'border-l-rose-500', bg: 'bg-gradient-to-br from-rose-50 to-pink-50', pill: 'bg-rose-500 text-white shadow-sm' },
  { border: 'border-l-sky-500', bg: 'bg-gradient-to-br from-sky-50 to-blue-50', pill: 'bg-sky-500 text-white shadow-sm' },
]

export function RetroBoard({ sessionId }: RetroBoardProps) {
  const sections = useSessionStore((s) => s.sections)
  const session = useSessionStore((s) => s.session)
  const user = useAuthStore((s) => s.user)
  const revealed = session?.retro_revealed ?? true
  const { comments, addComment, editComment, deleteComment } = useComments(sessionId, sections)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount } = useVotes(commentIds, sessionId)

  const visibleComments = useMemo(
    () => revealed ? comments : comments.filter((c) => c.user_id === user?.id),
    [comments, revealed, user?.id]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        variant="centered"
        title="Retrospettiva"
        description="Aggiungi i tuoi commenti in ogni sezione"
        gradient="primary"
      >
        {!revealed && (
          <p className="flex items-center justify-center gap-1.5 text-xs text-retro-text-secondary mt-2">
            <EyeOff size={12} />
            I commenti degli altri saranno visibili dopo la rivelazione
          </p>
        )}
      </PageHeader>

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
                {sectionComments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mb-3 shadow-sm">
                      {i === 0 ? (
                        <Lightbulb size={24} className="text-emerald-500" />
                      ) : i === 1 ? (
                        <MessageSquarePlus size={24} className="text-rose-500" />
                      ) : (
                        <Lightbulb size={24} className="text-sky-500" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {i === 0 ? 'Ancora nessuna idea positiva' : i === 1 ? 'Nessun problema condiviso' : 'Nessun suggerimento'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Sii il primo ad aggiungere un commento!
                    </p>
                  </div>
                ) : (
                  sectionComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      voteCount={getVoteCount(comment.id)}
                      isOwn={comment.user_id === user?.id}
                      onEdit={editComment}
                      onDelete={deleteComment}
                    />
                  ))
                )}
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
