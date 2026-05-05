import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { useAllocations } from '@/hooks/useAllocations'
import { generateWeekColumns } from '@/lib/capacity'
import { TimeOffCell } from '@/components/timeline/TimeOffCell'

export function TimeOffView() {
  const { members } = useTeam()
  const { sprints } = useSprints()
  const { timeOffs, upsertTimeOff } = useAllocations()

  const weeks = generateWeekColumns(sprints)

  const getMemberTimeOff = (memberId: string, weekStart: string) => {
    return timeOffs.find((t) => t.member_id === memberId && t.week_start === weekStart)?.days || 0
  }

  // Empty states
  if (sprints.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ferie & Assenze</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Gestione ferie e assenze del team
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuno sprint creato. Vai alla sezione Sprint per iniziare!
          </p>
          <a href="/sprints" className="btn btn-primary inline-block">
            Vai a Sprint
          </a>
        </div>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ferie & Assenze</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Gestione ferie e assenze del team
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessun membro nel team. Vai alla sezione Team per aggiungerne!
          </p>
          <a href="/team" className="btn btn-primary inline-block">
            Vai a Team
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Ferie & Assenze</h2>
        <p className="text-[var(--text-secondary)] mt-1">
          Gestione ferie e assenze del team per settimana
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden">
          {/* Header Settimane */}
          <div className="flex border-b-2 border-[var(--border-secondary)] sticky top-0 z-20 bg-[var(--bg-primary)]">
            <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center">
              <span className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide">
                Membro
              </span>
            </div>

            <div className="flex-1 flex">
              {weeks.map((week) => (
                <div
                  key={week.weekStart}
                  className={`border-r px-2 py-2 text-center ${
                    week.isCurrentWeek
                      ? 'border-[var(--accent-primary)] border-l-2 border-r-2 bg-[var(--accent-primary)]10'
                      : 'border-[var(--border-primary)]'
                  }`}
                  style={{ width: '72px', minWidth: '72px' }}
                >
                  <span className={`text-xs font-medium ${
                    week.isCurrentWeek
                      ? 'text-[var(--accent-primary)] font-semibold'
                      : 'text-[var(--text-secondary)]'
                  }`}>
                    {week.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Righe Membri */}
          {members.map((member) => (
            <div key={member.id} className="flex hover:bg-[var(--bg-hover)] transition-colors border-b border-[var(--border-primary)]">
              <div className="timeline-sticky-col bg-[var(--bg-primary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
                <span className="text-sm text-[var(--text-primary)]">{member.name}</span>
              </div>

              <div className="flex-1 flex">
                {weeks.map((week) => {
                  const days = getMemberTimeOff(member.id, week.weekStart)

                  return (
                    <div
                      key={week.weekStart}
                      className={`border-r ${
                        week.isCurrentWeek
                          ? 'border-[var(--accent-primary)] border-l-2 border-r-2 bg-[var(--accent-primary)]05'
                          : 'border-[var(--border-primary)] bg-[var(--warning)]05'
                      }`}
                      style={{ width: '72px', minWidth: '72px', height: '40px' }}
                    >
                      <TimeOffCell
                        value={days}
                        onChange={(newValue) => upsertTimeOff(member.id, week.weekStart, newValue)}
                      />
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
