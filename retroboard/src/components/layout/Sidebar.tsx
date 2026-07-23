import { useParticipants } from '@/hooks/useParticipants'
import { Badge } from '@/components/ui/Badge'
import { Clock, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'

function nameToColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const colors = [
    'from-indigo-400 to-indigo-600',
    'from-emerald-400 to-emerald-600',
    'from-amber-400 to-amber-600',
    'from-rose-400 to-rose-600',
    'from-sky-400 to-sky-600',
    'from-violet-400 to-violet-600',
    'from-teal-400 to-teal-600',
    'from-pink-400 to-pink-600',
  ]
  return colors[Math.abs(hash) % colors.length]
}

export function Sidebar() {
  const { participants, doneCount, totalParticipants } = useParticipants()
  const [open, setOpen] = useState(false)

  const progressPercent = useMemo(() => {
    if (totalParticipants === 0) return 0
    return Math.round((doneCount / totalParticipants) * 100)
  }, [doneCount, totalParticipants])

  const sidebarContent = (
    <>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="relative overflow-hidden">
          <div className="h-1.5 rounded-full bg-retro-border overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-retro-primary to-violet-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {progressPercent > 0 && progressPercent < 100 && (
            <div className="absolute inset-0 animate-shine" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-retro-text-secondary" />
        <h3 className="text-sm font-semibold text-retro-text">
          Partecipanti ({totalParticipants})
        </h3>
      </div>
      <div className="text-xs text-retro-text-secondary mb-3">
        {doneCount}/{totalParticipants} hanno finito
      </div>
      <div className="space-y-1.5">
        {participants.map((p) => {
          const name = p.profiles?.name || 'Utente'
          const colorClass = nameToColor(name)
          return (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/60 transition-colors duration-200"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-xs font-semibold shadow-soft`}>
                {name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-retro-text truncate flex-1">
                {name}
              </span>
              {p.role === 'organizer' && (
                <Badge className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5">Host</Badge>
              )}
              {p.is_done ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
                </span>
              ) : (
                <Clock size={14} className="text-retro-text-secondary" />
              )}
            </div>
          )
        })}
      </div>
    </>
  )

  return (
    <>
      {/* Mobile: floating pill button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed bottom-16 right-3 z-30 bg-white shadow-card border border-retro-border rounded-full px-3 py-2 flex items-center gap-1.5"
      >
        <Users size={14} className="text-retro-primary" />
        <span className="text-xs font-semibold text-retro-text">{doneCount}/{totalParticipants}</span>
      </button>

      {/* Mobile: slide-over drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-64 bg-retro-sidebar border-l border-retro-border p-4 overflow-y-auto shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-retro-border/30 text-retro-text-secondary"
            >
              <X size={18} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop: fixed sidebar */}
      <aside className="hidden md:block w-60 bg-retro-sidebar border-r border-retro-border p-4 overflow-y-auto scrollbar-thin">
        {sidebarContent}
      </aside>
    </>
  )
}
