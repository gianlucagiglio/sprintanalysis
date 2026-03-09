import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Users, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import type { Session } from '@/types/database'

const stepLabels: Record<number, string> = {
  1: 'Mood',
  2: 'Icebreaker',
  3: 'Retrospettiva',
  4: 'Kanban',
  5: 'Conclusa',
}

const statusBorderColors: Record<string, string> = {
  default: 'border-l-slate-300',
  warning: 'border-l-amber-400',
  success: 'border-l-emerald-400',
}

function getSessionStatus(step: number): { label: string; variant: 'default' | 'warning' | 'success' } {
  if (step === 1) return { label: 'Da iniziare', variant: 'default' }
  if (step >= 2 && step <= 4) return { label: 'In corso', variant: 'warning' }
  return { label: 'Conclusa', variant: 'success' }
}

interface SessionCardProps {
  session: Session
  participantCount?: number
  onDelete?: (sessionId: string) => void
}

export function SessionCard({ session, participantCount, onDelete }: SessionCardProps) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isOrganizer = user?.id === session.organizer_id
  const status = getSessionStatus(session.current_step)

  return (
    <Card
      hover
      className={`border-l-4 ${statusBorderColors[status.variant]}`}
      onClick={() => navigate(`/session/${session.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-retro-text">{session.title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant={status.variant}>
            <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${
              status.variant === 'default' ? 'bg-slate-400' :
              status.variant === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            {status.label}
          </Badge>
          {session.current_step >= 2 && session.current_step <= 4 && (
            <Badge variant="primary">{stepLabels[session.current_step]}</Badge>
          )}
          {isOrganizer && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(session.id)
              }}
              className="p-1.5 rounded-lg text-retro-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all duration-200"
              title="Elimina retrospettiva"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs text-retro-text-secondary">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {new Date(session.created_at).toLocaleDateString('it-IT')}
        </span>
        {participantCount !== undefined && (
          <span className="flex items-center gap-1.5">
            <div className="flex -space-x-1.5">
              {Array.from({ length: Math.min(participantCount, 3) }).map((_, i) => (
                <div key={i} className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-white flex items-center justify-center">
                  <Users size={8} className="text-slate-500" />
                </div>
              ))}
            </div>
            {participantCount}/{session.max_participants}
          </span>
        )}
      </div>
    </Card>
  )
}
