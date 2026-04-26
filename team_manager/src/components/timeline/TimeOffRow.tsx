import { useState } from 'react'
import { TimeOffCell } from './TimeOffCell'
import type { TeamMember, WeekColumn, TimeOff } from '@/types'

interface TimeOffRowProps {
  members: TeamMember[]
  weeks: WeekColumn[]
  timeOffs: TimeOff[]
  onTimeOffChange: (memberId: string, weekStart: string, days: number) => Promise<void>
}

export function TimeOffRow({ members, weeks, timeOffs, onTimeOffChange }: TimeOffRowProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const getTotalTimeOff = (weekStart: string) => {
    return timeOffs
      .filter((t) => t.week_start === weekStart)
      .reduce((sum, t) => sum + t.days, 0)
  }

  const getMemberTimeOff = (memberId: string, weekStart: string) => {
    return timeOffs.find((t) => t.member_id === memberId && t.week_start === weekStart)?.days || 0
  }

  // Mostra riga aggregata se nessun membro è selezionato
  if (!selectedMember) {
    return (
      <div className="flex bg-[var(--warning)]10 border-t border-[var(--border-primary)]">
        <div className="sticky left-0 w-[220px] bg-[var(--warning)]20 border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3 z-10">
          <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
          <button
            onClick={() => setSelectedMember(members[0]?.id || null)}
            className="text-sm text-[var(--warning)] font-medium hover:underline"
          >
            Ferie/Assenze (click per dettaglio)
          </button>
        </div>

        <div className="flex-1 flex">
          {weeks.map((week) => {
            const total = getTotalTimeOff(week.weekStart)

            return (
              <div
                key={week.weekStart}
                className="border-r border-[var(--border-primary)] p-1 text-center bg-[var(--warning)]10"
                style={{ width: '72px', minWidth: '72px', height: '32px' }}
              >
                <span className="text-xs font-mono text-[var(--warning)] leading-[32px]">
                  {total > 0 ? total : ''}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Mostra righe per ogni membro
  return (
    <div className="bg-[var(--warning)]05 border-t-2 border-[var(--warning)]">
      {/* Header con bottone per chiudere */}
      <div className="flex bg-[var(--warning)]15">
        <div className="sticky left-0 w-[220px] bg-[var(--warning)]20 border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3 z-10">
          <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
          <button
            onClick={() => setSelectedMember(null)}
            className="text-sm text-[var(--warning)] font-medium hover:underline"
          >
            ✕ Chiudi dettaglio ferie
          </button>
        </div>

        <div className="flex-1 flex">
          {weeks.map((week) => (
            <div
              key={week.weekStart}
              className="border-r border-[var(--border-primary)]"
              style={{ width: '72px', minWidth: '72px', height: '32px' }}
            />
          ))}
        </div>
      </div>

      {/* Righe per ogni membro */}
      {members.map((member) => (
        <div key={member.id} className="flex hover:bg-[var(--warning)]10 transition-colors">
          <div className="sticky left-0 w-[220px] bg-[var(--bg-primary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3 z-10">
            <div className="w-2 h-2 rounded-full bg-[var(--warning)]" />
            <span className="text-sm text-[var(--text-secondary)]">{member.name}</span>
          </div>

          <div className="flex-1 flex">
            {weeks.map((week) => {
              const days = getMemberTimeOff(member.id, week.weekStart)

              return (
                <div
                  key={week.weekStart}
                  className="border-r border-[var(--border-primary)] bg-[var(--warning)]05"
                  style={{ width: '72px', minWidth: '72px', height: '32px' }}
                >
                  <TimeOffCell
                    value={days}
                    onChange={(newValue) => onTimeOffChange(member.id, week.weekStart, newValue)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
