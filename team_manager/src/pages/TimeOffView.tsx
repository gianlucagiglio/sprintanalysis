import { Calendar, Users } from 'lucide-react'
import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { useAllocations } from '@/hooks/useAllocations'
import { generateWeekColumns } from '@/lib/capacity'
import { TimeOffCell } from '@/components/timeline/TimeOffCell'
import { EmptyState } from '@/components/ui/EmptyState'

export function TimeOffView() {
  const { members } = useTeam()
  const { sprints } = useSprints()
  const { timeOffs, upsertTimeOff } = useAllocations()

  const weeks = generateWeekColumns(sprints)

  const roleOrder: Record<string, number> = { PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }
  const sortedMembers = [...members].sort((a, b) => {
    const orderA = roleOrder[a.role?.name || ''] || 999
    const orderB = roleOrder[b.role?.name || ''] || 999
    return orderA - orderB
  })

  const getMemberTimeOff = (memberId: string, weekStart: string) => {
    return timeOffs.find((t) => t.member_id === memberId && t.week_start === weekStart)?.days || 0
  }

  if (sprints.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ferie & Assenze</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Gestione ferie e assenze del team</p>
        </div>
        <EmptyState
          icon={Calendar}
          title="Nessuno sprint creato"
          description="Crea sprint nella sezione Sprint per gestire le ferie."
          action={{ label: 'Vai a Sprint', onClick: () => (window.location.href = '/sprints') }}
        />
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ferie & Assenze</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Gestione ferie e assenze del team</p>
        </div>
        <EmptyState
          icon={Users}
          title="Nessun membro nel team"
          description="Aggiungi membri nella sezione Team per gestire le loro ferie."
          action={{ label: 'Vai a Team', onClick: () => (window.location.href = '/team') }}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ferie & Assenze</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Gestione ferie e assenze per settimana</p>
      </div>

      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="timeline-header">
            <div className="flex border-b border-[var(--border-secondary)]">
              <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-2.5">
                <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">Membro</span>
              </div>
              <div className="flex" style={{ width: `${weeks.length * 72}px` }}>
                {weeks.map((week) => (
                  <div key={week.weekStart} className={`relative border-r border-[var(--border-primary)] px-2 py-2 text-center transition-colors ${week.isCurrentWeek ? 'timeline-week-current' : ''}`} style={{ width: '72px' }}>
                    <span className={`text-xs font-medium ${week.isCurrentWeek ? 'text-[var(--accent-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}>
                      {week.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {sortedMembers.map((member) => (
            <div key={member.id} className="flex hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-primary)]">
              <div className="timeline-sticky-col bg-[var(--bg-primary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: member.role?.color || 'var(--warning)' }} />
                <span className="text-sm text-[var(--text-primary)]">{member.name}</span>
              </div>

              <div className="flex" style={{ width: `${weeks.length * 72}px` }}>
                {weeks.map((week) => {
                  const days = getMemberTimeOff(member.id, week.weekStart)
                  return (
                    <div key={week.weekStart} className={`border-r border-[var(--border-primary)] ${week.isCurrentWeek ? 'timeline-week-current' : ''}`} style={{ width: '72px', height: '32px' }}>
                      <TimeOffCell value={days} onChange={(newValue) => upsertTimeOff(member.id, week.weekStart, newValue)} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
