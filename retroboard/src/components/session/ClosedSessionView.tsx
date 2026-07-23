import { useMemo, useState } from 'react'
import { useComments } from '@/hooks/useComments'
import { useVotes } from '@/hooks/useVotes'
import { useActions } from '@/hooks/useActions'
import { useMood } from '@/hooks/useMood'
import { useTeamMood } from '@/hooks/useTeamMood'
import { useQuiz } from '@/hooks/useQuiz'
import { useSessionStore } from '@/stores/sessionStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { motion } from 'framer-motion'
import {
  Heart,
  User,
  Calendar,
  Trophy,
  Medal,
  Users,
  MessageSquare,
  ThumbsUp,
  Zap,
  Smile,
  Frown,
  Angry,
  Sparkles,
  Crown,
  PartyPopper,
} from 'lucide-react'
import type { Action } from '@/types/database'

const statusLabels: Record<Action['status'], string> = {
  todo: 'Da fare',
  in_progress: 'In corso',
  done: 'Completato',
}

const statusColors: Record<Action['status'], string> = {
  todo: 'bg-slate-400',
  in_progress: 'bg-retro-primary',
  done: 'bg-retro-glad',
}

const sectionStyles = [
  { border: 'border-l-emerald-400', bg: 'bg-emerald-50/50', pill: 'bg-emerald-100 text-emerald-700' },
  { border: 'border-l-rose-400', bg: 'bg-rose-50/50', pill: 'bg-rose-100 text-rose-700' },
  { border: 'border-l-sky-400', bg: 'bg-sky-50/50', pill: 'bg-sky-100 text-sky-700' },
]

const avatarColors = [
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-600',
  'bg-amber-100 text-amber-600',
  'bg-rose-100 text-rose-600',
  'bg-sky-100 text-sky-600',
  'bg-violet-100 text-violet-600',
  'bg-teal-100 text-teal-600',
  'bg-orange-100 text-orange-600',
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
  const { teamMoodCounts } = useTeamMood(sessionId)
  const { questions, getLeaderboard } = useQuiz(sessionId)
  const [applause, setApplause] = useState<Record<string, number>>({})

  const moodTotal = Object.values(moodCounts).reduce((a, b) => a + b, 0)
  const teamMoodTotal = Object.values(teamMoodCounts).reduce((a, b) => a + b, 0)
  const leaderboard = getLeaderboard()

  const parentComments = comments.filter((c) => !c.group_id)
  const totalVotes = parentComments.reduce((sum, c) => sum + (getVoteCount(c.id) || 0), 0)
  const organizer = participants.find((p) => p.role === 'organizer')

  const getName = (userId: string) =>
    participants.find((p) => p.user_id === userId)?.profiles?.name || 'Utente'

  // Get actions linked to a comment
  const getCommentActions = (commentId: string) =>
    actions.filter((a) => a.comment_id === commentId)

  const moodItems = [
    { key: 'glad', label: 'Contento', count: moodCounts.glad, icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200' },
    { key: 'sad', label: 'Triste', count: moodCounts.sad, icon: Frown, color: 'text-amber-500', bg: 'bg-amber-50', ring: 'ring-amber-200' },
    { key: 'mad', label: 'Arrabbiato', count: moodCounts.mad, icon: Angry, color: 'text-rose-500', bg: 'bg-rose-50', ring: 'ring-rose-200' },
    { key: 'custom', label: 'Altro', count: moodCounts.custom, icon: Sparkles, color: 'text-indigo-500', bg: 'bg-indigo-50', ring: 'ring-indigo-200' },
  ]

  const handleApplause = (userId: string) => {
    setApplause(prev => ({ ...prev, [userId]: (prev[userId] || 0) + 1 }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* ── Hero Header with Confetti ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 md:p-10 text-white"
      >
        {/* Animated confetti background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, y: -20, x: `${Math.random() * 100}%` }}
              animate={{
                opacity: [1, 1, 0],
                y: ['0%', '120%'],
                rotate: Math.random() * 720 - 360,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#FCD34D', '#34D399', '#60A5FA', '#F472B6', '#A78BFA', '#FFFFFF'][
                  Math.floor(Math.random() * 6)
                ],
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-2 mb-4"
          >
            <PartyPopper size={24} className="animate-bounce" />
            <Badge className="!bg-white/20 !text-white !backdrop-blur-sm">
              Retrospettiva completata
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-2xl md:text-3xl font-display font-bold mb-2"
          >
            🎉 {sessionTitle}
          </motion.h1>
          {organizer && (
            <p className="text-white/70 text-sm">
              Organizzata da {organizer.profiles?.name || 'Utente'}
            </p>
          )}

          {/* Participant avatars inline */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex -space-x-2">
              {participants.slice(0, 8).map((p) => (
                <div
                  key={p.user_id}
                  className="w-9 h-9 rounded-full border-2 border-white/30 flex items-center justify-center text-sm font-bold bg-white/20 backdrop-blur-sm"
                  title={p.profiles?.name || 'Utente'}
                >
                  {(p.profiles?.name || 'U').charAt(0).toUpperCase()}
                </div>
              ))}
              {participants.length > 8 && (
                <div className="w-9 h-9 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold bg-white/20 backdrop-blur-sm">
                  +{participants.length - 8}
                </div>
              )}
            </div>
            <span className="text-white/60 text-sm">{participants.length} partecipanti</span>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Row with Stagger Animation ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Partecipanti', value: participants.length, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
          { label: 'Commenti', value: parentComments.length, icon: MessageSquare, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Voti totali', value: totalVotes, icon: ThumbsUp, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Azioni', value: actions.length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                delay: 0.5 + i * 0.1,
                duration: 0.4,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            >
              <Card className="!p-4 !rounded-2xl text-center hover:scale-105 transition-transform duration-200">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}
                >
                  <Icon size={20} className={stat.color} />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-2xl font-bold text-retro-text"
                >
                  {stat.value}
                </motion.p>
                <p className="text-xs text-retro-text-secondary mt-0.5">{stat.label}</p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* ── Partecipanti ── */}
      <div>
        <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
          <Users size={18} className="text-indigo-500" />
          Partecipanti
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {participants.map((p, i) => (
            <motion.div
              key={p.user_id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2 + i * 0.05, duration: 0.3 }}
            >
              <Card className="!p-4 !rounded-2xl text-center group hover:scale-105 transition-all duration-200 relative">
                <div className={`w-12 h-12 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center mx-auto mb-2 text-lg font-bold`}>
                  {(p.profiles?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <p className="text-sm font-semibold text-retro-text truncate">{p.profiles?.name || 'Utente'}</p>
                {p.role === 'organizer' && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Crown size={10} className="text-amber-500" />
                    <span className="text-[10px] font-medium text-amber-600">Organizzatore</span>
                  </div>
                )}

                {/* Applause button */}
                <button
                  onClick={() => handleApplause(p.user_id)}
                  className="mt-2 w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 hover:from-amber-200 hover:to-orange-200 text-amber-700 text-xs font-medium transition-all hover:scale-105 flex items-center justify-center gap-1"
                >
                  <span>👏</span>
                  <span>{applause[p.user_id] || 0}</span>
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Mood del team ── */}
      {moodTotal > 0 && (
        <div>
          <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
            <Smile size={18} className="text-emerald-500" />
            Mood del team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {moodItems.map((item) => {
              const Icon = item.icon
              const percent = moodTotal > 0 ? Math.round((item.count / moodTotal) * 100) : 0
              return (
                <Card key={item.key} className={`!p-4 !rounded-2xl text-center ${item.count > 0 ? `ring-1 ${item.ring}` : ''}`}>
                  <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center mx-auto mb-2`}>
                    <Icon size={24} className={item.color} />
                  </div>
                  <p className="text-2xl font-bold text-retro-text">{item.count}</p>
                  <p className="text-xs text-retro-text-secondary">{item.label}</p>
                  {item.count > 0 && (
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.bg.replace('50', '400')}`}
                        style={{ width: `${percent}%`, backgroundColor: item.color.includes('emerald') ? '#10b981' : item.color.includes('amber') ? '#f59e0b' : item.color.includes('rose') ? '#ef4444' : '#6366f1' }}
                      />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Collaborazione Team ── */}
      {teamMoodTotal > 0 && (
        <div>
          <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
            <Users size={18} className="text-emerald-500" />
            Collaborazione Team
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'ottima', label: 'Ottima', emoji: '🤝💚', count: teamMoodCounts.ottima, bg: 'bg-emerald-50', ring: 'ring-emerald-200', barColor: '#10b981' },
              { key: 'buona', label: 'Buona', emoji: '🤝💙', count: teamMoodCounts.buona, bg: 'bg-sky-50', ring: 'ring-sky-200', barColor: '#0ea5e9' },
              { key: 'sufficiente', label: 'Sufficiente', emoji: '🤝⚠️', count: teamMoodCounts.sufficiente, bg: 'bg-amber-50', ring: 'ring-amber-200', barColor: '#f59e0b' },
              { key: 'scarsa', label: 'Scarsa', emoji: '🤝❌', count: teamMoodCounts.scarsa, bg: 'bg-red-50', ring: 'ring-red-200', barColor: '#ef4444' },
            ].map((item) => {
              const percent = teamMoodTotal > 0 ? Math.round((item.count / teamMoodTotal) * 100) : 0
              return (
                <Card key={item.key} className={`!p-4 !rounded-2xl text-center ${item.count > 0 ? `ring-1 ${item.ring}` : ''}`}>
                  <div className={`w-12 h-12 rounded-full ${item.bg} flex items-center justify-center mx-auto mb-2 text-2xl`}>
                    {item.emoji}
                  </div>
                  <p className="text-2xl font-bold text-retro-text">{item.count}</p>
                  <p className="text-xs text-retro-text-secondary">{item.label}</p>
                  {item.count > 0 && (
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${percent}%`, backgroundColor: item.barColor }}
                      />
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Quiz - Classifica ── */}
      {questions.length > 0 && leaderboard.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            Quiz - Classifica
          </h2>
          <Card className="!rounded-2xl !p-0 overflow-hidden">
            {/* Winner */}
            <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 p-5 border-b border-amber-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-200/50">
                  <Trophy size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Vincitore</p>
                  <p className="text-xl font-bold text-retro-text">{getName(leaderboard[0].userId)}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold font-mono text-retro-primary">{leaderboard[0].totalPoints}</p>
                  <p className="text-xs text-retro-text-secondary">punti</p>
                </div>
              </div>
            </div>
            {/* Others */}
            {leaderboard.length > 1 && (
              <div className="divide-y divide-slate-100">
                {leaderboard.slice(1).map((entry, i) => (
                  <div key={entry.userId} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      {i < 2 ? (
                        <Medal size={16} className={i === 0 ? 'text-gray-400' : 'text-amber-600'} />
                      ) : (
                        <span className="text-xs font-bold text-retro-text-secondary">{i + 2}</span>
                      )}
                    </div>
                    <span className="text-sm text-retro-text flex-1 font-medium">{getName(entry.userId)}</span>
                    <span className="font-mono text-sm font-bold text-retro-primary">{entry.totalPoints} pt</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ── Commenti per sezione ── */}
      <div>
        <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
          <MessageSquare size={18} className="text-emerald-500" />
          Commenti
        </h2>
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
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${style.pill}`}>
                    {section.name}
                  </span>
                  <span className="text-xs text-retro-text-secondary">{sectionComments.length}</span>
                </div>
                <div className="space-y-2">
                  {sectionComments.length === 0 && (
                    <p className="text-xs text-retro-text-secondary py-2">Nessun commento</p>
                  )}
                  {sectionComments.map((comment) => {
                    const votes = getVoteCount(comment.id) || 0
                    const children = grouped(comment.id)
                    const commentActions = getCommentActions(comment.id)
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
                            {/* Linked Actions */}
                            {commentActions.length > 0 && (
                              <div className="mt-2.5 space-y-1.5">
                                {commentActions.map((action) => {
                                  const assigneeNames = (action.assigned_to_multi || [])
                                    .map((id) => getName(id))
                                  return (
                                    <div
                                      key={action.id}
                                      className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-2 text-xs"
                                    >
                                      <div className="flex items-start gap-1.5">
                                        <Zap size={12} className="text-amber-600 mt-0.5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-retro-text font-medium leading-snug">{action.text}</p>
                                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            {assigneeNames.length > 0 && (
                                              <span className="text-[10px] text-retro-text-secondary">
                                                👤 {assigneeNames.join(', ')}
                                              </span>
                                            )}
                                            {action.deadline && (
                                              <span className="text-[10px] text-retro-text-secondary">
                                                📅 {new Date(action.deadline).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                                              </span>
                                            )}
                                            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                              action.status === 'done' ? 'bg-emerald-100 text-emerald-700' :
                                              action.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                              'bg-slate-100 text-slate-600'
                                            }`}>
                                              {statusLabels[action.status]}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                })}
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

      {/* ── Azioni ── */}
      {actions.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-retro-text mb-4 flex items-center gap-2">
            <Zap size={18} className="text-amber-500" />
            Azioni
          </h2>
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
                    {statusActions.length === 0 && (
                      <p className="text-xs text-retro-text-secondary text-center py-4">Nessuna azione</p>
                    )}
                    {statusActions.map((action) => {
                      const assigneeNames = (action.assigned_to_multi || [])
                        .map((id) => participants.find((p) => p.user_id === id)?.profiles?.name || 'Utente')
                      return (
                        <Card key={action.id} className="!p-3 !rounded-xl">
                          <p className="text-sm text-retro-text">{action.text}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {assigneeNames.map((name, i) => (
                              <Badge key={i} variant="primary">
                                <User size={10} className="mr-1" />
                                {name}
                              </Badge>
                            ))}
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
