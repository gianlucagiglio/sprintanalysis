import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Users, Trash2, ArrowRight, Play, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { Session } from '@/types/database'

const stepLabels: Record<number, string> = {
  1: 'Mood',
  2: 'Icebreaker',
  3: 'Retrospettiva',
  4: 'Kanban',
  5: 'Conclusa',
}

const stepProgress: Record<number, number> = {
  1: 20,
  2: 40,
  3: 60,
  4: 80,
  5: 100,
}

function getSessionStatus(step: number): {
  label: string
  variant: 'default' | 'warning' | 'success'
  icon: typeof Play
  gradient: string
} {
  if (step === 1) return { label: 'Da iniziare', variant: 'default', icon: Play, gradient: 'from-slate-400 to-slate-500' }
  if (step >= 2 && step <= 4) return { label: 'In corso', variant: 'warning', icon: ArrowRight, gradient: 'from-amber-400 to-orange-500' }
  return { label: 'Conclusa', variant: 'success', icon: CheckCircle2, gradient: 'from-emerald-400 to-teal-500' }
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Adesso'
  if (diffMins < 60) return `${diffMins}m fa`
  if (diffHours < 24) return `${diffHours}h fa`
  if (diffDays < 7) return `${diffDays}g fa`
  return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
}

interface SessionCardProps {
  session: Session
  participantCount?: number
  onDelete?: (sessionId: string) => void
}

export function SessionCard({ session, participantCount, onDelete }: SessionCardProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin)
  const isOrganizer = user?.id === session.organizer_id || isSuperAdmin()
  const status = getSessionStatus(session.current_step)
  const StatusIcon = status.icon
  const progress = stepProgress[session.current_step] || 0

  return (
    <Card
      hover
      className="!p-0 !rounded-2xl overflow-hidden cursor-pointer group"
      onClick={() => navigate(`/session/${session.id}`)}
    >
      {/* Progress bar top */}
      <div className="h-1 bg-slate-100">
        <div
          className={`h-full bg-gradient-to-r ${status.gradient} transition-all duration-500`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5">
        {/* Top row: title + actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-retro-text group-hover:text-retro-primary transition-colors leading-snug">
            {session.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isOrganizer && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(session.id)
                }}
                className="p-1.5 rounded-lg text-retro-border hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                title="Elimina retrospettiva"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status + step */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r ${status.gradient} text-white`}>
            <StatusIcon size={11} />
            {status.label}
          </div>
          {session.current_step >= 2 && session.current_step <= 4 && (
            <Badge variant="primary" className="!text-[11px]">{stepLabels[session.current_step]}</Badge>
          )}
        </div>

        {/* Bottom row: metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-retro-text-secondary">
            <span className="flex items-center gap-1.5">
              <Calendar size={12} />
              {timeAgo(session.created_at)}
            </span>
            {participantCount !== undefined && (
              <span className="flex items-center gap-1.5">
                <Users size={12} />
                {participantCount}/{session.max_participants}
              </span>
            )}
          </div>
          <ArrowRight size={14} className="text-retro-border group-hover:text-retro-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Card>
  )
}
