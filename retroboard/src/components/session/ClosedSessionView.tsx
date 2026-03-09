import { useMemo } from 'react'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { useActions } from '@/hooks/useActions'
import { useMood } from '@/hooks/useMood'
import { useQuiz } from '@/hooks/useQuiz'
import { useSessionStore } from '@/stores/sessionStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Heart, User, Calendar, Archive, Trophy, Medal } from 'lucide-react'
import type { Action } from '@/types/database'

const statusLabels: Record<Action['status'], string> = {
  todo: 'Da fare',
  in_progress: 'In corso',
  done: 'Completato',
}

const statusColors: Record<Action['status'], string> = {
  todo: 'bg-retro-text-secondary',
  in_progress: 'bg-retro-primary',
  done: 'bg-retro-glad',
}

const sectionStyles = [
  { border: 'border-l-emerald-400', bg: 'bg-emerald-50/50', pill: 'bg-emerald-100 text-emerald-700' },
  { border: 'border-l-rose-400', bg: 'bg-rose-50/50', pill: 'bg-rose-100 text-rose-700' },
  { border: 'border-l-sky-400', bg: 'bg-sky-50/50', pill: 'bg-sky-100 text-sky-700' },
]

interface ClosedSessionViewProps {
  sessionId: string
  sessionTitle: string
}

export function ClosedSessionView({ sessionId, sessionTitle }: ClosedSessionViewProps) {
  const sections = useSessionStore((s) => s.sections)
  const participants = useSessionStore((s) => s.participants)
  const { comments } = useComments(sessionId, sections)
  const commentIds = useMemo(() => comments.map((c) => c.id), [comments])
  const { getVoteCount } = useVotes(commentIds, sessionId)
  const { actions } = useActions(sessionId)
  const { moodCounts } = useMood(sessionId)
  const { questions, getLeaderboard } = useQuiz(sessionId)

  const moodTotal = Object.values(moodCounts).reduce((a, b) => a + b, 0)
  const leaderboard = getLeaderboard()
  const podiumColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']

  const getName = (userId: string) =>
    participants.find((p) => p.user_id === userId)?.profiles?.name || 'Utente'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-retro-sidebar flex items-center justify-center">
          <Archive size={24} className="text-retro-text-secondary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-retro-text">{sessionTitle}</h1>
          <p className="text-sm text-retro-text-secondary">Retrospettiva chiusa</p>
        </div>
      </div>

      {/* Mood del team */}
      {moodTotal > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-retro-text mb-4">Mood del team</h2>
          <Card className="!rounded-2xl">
            <div className="space-y-3">
              {[
                { label: 'Contento', count: moodCounts.glad, color: 'bg-retro-glad' },
                { label: 'Triste', count: moodCounts.sad, color: 'bg-retro-sad' },
                { label: 'Arrabbiato', count: moodCounts.mad, color: 'bg-retro-mad' },
                { label: 'Altro', count: moodCounts.custom, color: 'bg-retro-primary' },
              ].map((item) => {
                const percent = Math.round((item.count / moodTotal) * 100)
                return (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-retro-text-secondary w-20">{item.label}</span>
                    <div className="flex-1 h-6 bg-retro-sidebar rounded-xl overflow-hidden relative">
                      <div
                        className={`h-full ${item.color} rounded-xl flex items-center justify-end`}
                        style={{ width: `${percent}%` }}
                      >
                        {percent > 15 && (
                          <span className="text-[10px] font-bold text-white pr-2">{percent}%</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-retro-text w-6 text-right">{item.count}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Quiz - Classifica */}
      {questions.length > 0 && leaderboard.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-retro-text mb-4">Quiz - Classifica</h2>
          {/* Winner card */}
          <Card className="max-w-md !rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <Trophy size={24} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium">Vincitore</p>
                <p className="text-lg font-bold text-retro-text">{getName(leaderboard[0].userId)}</p>
                <p className="font-mono text-sm font-bold text-retro-primary">{leaderboard[0].totalPoints} pt</p>
              </div>
            </div>
          </Card>
          {leaderboard.length > 1 && (
            <Card className="max-w-md !rounded-2xl">
              <div className="space-y-2">
                {leaderboard.slice(1, 3).map((entry, i) => (
                  <div
                    key={entry.userId}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-retro-sidebar transition-colors"
                  >
                    <div className="w-7 h-7 flex items-center justify-center">
                      <Medal size={20} className={podiumColors[i + 1]} />
                    </div>
                    <span className="text-sm text-retro-text flex-1 font-medium">{getName(entry.userId)}</span>
                    <span className="font-mono font-bold text-retro-primary">{entry.totalPoints} pt</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Comments per section */}
      <div>
        <h2 className="text-lg font-semibold text-retro-text mb-4">Commenti</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((section, i) => {
            const style = sectionStyles[i % sectionStyles.length]
            const sectionComments = comments
              .filter((c) => c.section_id === section.id && !c.group_id)
              .sort((a, b) => (getVoteCount(b.id) || 0) - (getVoteCount(a.id) || 0))

            const grouped = (parentId: string) =>
              comments.filter((c) => c.group_id === parentId)

            return (
              <Card
                key={section.id}
                className={`!p-4 !rounded-2xl border-l-4 ${style.border} ${style.bg}`}
              >
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-3 ${style.pill}`}>
                  {section.name}
                </span>
                <div className="space-y-2">
                  {sectionComments.length === 0 && (
                    <p className="text-xs text-retro-text-secondary">Nessun commento</p>
                  )}
                  {sectionComments.map((comment) => {
                    const votes = getVoteCount(comment.id) || 0
                    const children = grouped(comment.id)
                    return (
                      <Card key={comment.id} className="!p-3 !rounded-xl">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-retro-text">{comment.text}</p>
                            {children.length > 0 && (
                              <div className="mt-2 pl-3 border-l-2 border-retro-border space-y-1">
                                {children.map((g) => (
                                  <p key={g.id} className="text-xs text-retro-text-secondary">{g.text}</p>
                                ))}
                              </div>
                            )}
                          </div>
                          {votes > 0 && (
                            <span className="flex items-center gap-1 text-xs text-retro-text-secondary whitespace-nowrap">
                              {votes} <Heart size={10} className="fill-rose-300 text-rose-300" />
                            </span>
                          )}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-retro-text mb-4">Azioni</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(['todo', 'in_progress', 'done'] as Action['status'][]).map((status) => {
              const statusActions = actions.filter((a) => a.status === status)
              return (
                <div key={status} className="bg-slate-50 rounded-2xl border border-slate-200 p-3">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
                    <h3 className="text-sm font-bold text-retro-text">{statusLabels[status]}</h3>
                    <span className="text-xs text-retro-text-secondary ml-auto bg-white rounded-full px-2 py-0.5 font-medium">{statusActions.length}</span>
                  </div>
                  <div className="space-y-2">
                    {statusActions.map((action) => {
                      const assignee = participants.find((p) => p.user_id === action.assigned_to)
                      return (
                        <Card key={action.id} className="!p-3 !rounded-xl">
                          <p className="text-sm text-retro-text">{action.text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {assignee && (
                              <Badge variant="primary">
                                <User size={10} className="mr-1" />
                                {assignee.profiles?.name}
                              </Badge>
                            )}
                            {action.deadline && (
                              <Badge variant="warning">
                                <Calendar size={10} className="mr-1" />
                                {new Date(action.deadline).toLocaleDateString('it-IT')}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
