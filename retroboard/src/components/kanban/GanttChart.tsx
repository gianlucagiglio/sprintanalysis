import { useMemo, useState } from 'react'
import { AlertTriangle, FolderOpen } from 'lucide-react'
import type { ActionWithSession } from '@/hooks/useGlobalActions'
import type { Action } from '@/types/database'

type TimeScale = 'day' | 'week' | 'month' | 'quarter'

const timeScaleOptions: { value: TimeScale; label: string }[] = [
  { value: 'day', label: 'Giorno' },
  { value: 'week', label: 'Settimana' },
  { value: 'month', label: 'Mese' },
  { value: 'quarter', label: 'Quarter' },
]

const statusChips: { value: Action['status']; label: string; color: string }[] = [
  { value: 'todo', label: 'Da fare', color: 'bg-slate-400' },
  { value: 'in_progress', label: 'In corso', color: 'bg-retro-primary' },
  { value: 'done', label: 'Completato', color: 'bg-retro-glad' },
]

function formatDateForScale(date: Date, scale: TimeScale): string {
  if (scale === 'quarter') {
    const q = Math.floor(date.getMonth() / 3) + 1
    return `Q${q} ${date.getFullYear()}`
  }
  if (scale === 'month') {
    return date.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' })
  }
  return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)
}

function getBarColor(status: string, isOverdue: boolean): string {
  if (status === 'done') return 'bg-retro-glad'
  if (isOverdue) return 'bg-red-400'
  if (status === 'in_progress') return 'bg-retro-primary'
  return 'bg-slate-300'
}

function getStatusLabel(status: string): string {
  if (status === 'todo') return 'Da fare'
  if (status === 'in_progress') return 'In corso'
  return 'Completato'
}

export function GanttView({ actions }: { actions: ActionWithSession[] }) {
  const [timeScale, setTimeScale] = useState<TimeScale>('week')
  const [statusFilter, setStatusFilter] = useState<Set<Action['status']>>(
    () => new Set(['todo', 'in_progress', 'done'])
  )

  const toggleStatus = (status: Action['status']) => {
    setStatusFilter((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  const actionsWithDeadline = useMemo(
    () =>
      actions
        .filter((a) => a.deadline && statusFilter.has(a.status))
        .sort(
          (a, b) =>
            new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
        ),
    [actions, statusFilter]
  )

  const hasAnyDeadline = useMemo(
    () => actions.some((a) => a.deadline),
    [actions]
  )

  const { timelineStart, totalDays, dateMarkers, minWidth } = useMemo(() => {
    if (actionsWithDeadline.length === 0) {
      return { timelineStart: new Date(), timelineEnd: new Date(), totalDays: 1, dateMarkers: [], minWidth: '500px' }
    }

    const allDates = actionsWithDeadline.flatMap((a) => [
      new Date(a.created_at),
      new Date(a.deadline!),
    ])
    const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())))

    const start = new Date(minDate)
    start.setDate(start.getDate() - 2)
    start.setHours(0, 0, 0, 0)

    const end = new Date(maxDate)
    end.setDate(end.getDate() + 2)
    end.setHours(23, 59, 59, 999)

    const days = Math.max(1, Math.ceil(daysBetween(start, end)))

    // Generate date markers based on timeScale
    const markers: Date[] = []
    const cursor = new Date(start)

    const minWidthMap: Record<TimeScale, string> = {
      day: '800px',
      week: '500px',
      month: '400px',
      quarter: '300px',
    }

    switch (timeScale) {
      case 'day':
        while (cursor <= end) {
          markers.push(new Date(cursor))
          cursor.setDate(cursor.getDate() + 1)
        }
        break
      case 'week': {
        // Align to Monday
        const dow = cursor.getDay()
        const diffToMon = dow === 0 ? -6 : 1 - dow
        cursor.setDate(cursor.getDate() + diffToMon)
        while (cursor <= end) {
          markers.push(new Date(cursor))
          cursor.setDate(cursor.getDate() + 7)
        }
        break
      }
      case 'month':
        cursor.setDate(1)
        while (cursor <= end) {
          markers.push(new Date(cursor))
          cursor.setMonth(cursor.getMonth() + 1)
        }
        break
      case 'quarter':
        cursor.setDate(1)
        cursor.setMonth(Math.floor(cursor.getMonth() / 3) * 3)
        while (cursor <= end) {
          markers.push(new Date(cursor))
          cursor.setMonth(cursor.getMonth() + 3)
        }
        break
    }

    return { timelineStart: start, timelineEnd: end, totalDays: days, dateMarkers: markers, minWidth: minWidthMap[timeScale] }
  }, [actionsWithDeadline, timeScale])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayPosition = useMemo(() => {
    const pos = (daysBetween(timelineStart, today) / totalDays) * 100
    return pos >= 0 && pos <= 100 ? pos : null
  }, [timelineStart, totalDays, today])

  if (!hasAnyDeadline) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-retro-text-secondary">
        <p className="text-lg font-medium">Nessuna azione con scadenza</p>
        <p className="text-sm mt-1">Aggiungi una deadline alle azioni per visualizzarle qui</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-soft overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50/50">
        {/* Zoom temporale */}
        <div className="bg-slate-100 rounded-xl p-1 flex">
          {timeScaleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeScale(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                timeScale === opt.value
                  ? 'bg-white shadow-soft text-retro-text'
                  : 'text-retro-text-secondary hover:text-retro-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Filtro stato */}
        <div className="flex items-center gap-2">
          {statusChips.map((chip) => {
            const active = statusFilter.has(chip.value)
            return (
              <button
                key={chip.value}
                onClick={() => toggleStatus(chip.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-white border border-slate-200 shadow-soft text-retro-text'
                    : 'bg-transparent text-retro-text-secondary opacity-60 hover:opacity-80'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${chip.color}`} />
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {actionsWithDeadline.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-retro-text-secondary">
          <p className="text-base font-medium">Nessuna azione corrisponde ai filtri</p>
          <p className="text-sm mt-1">Prova ad attivare altri stati</p>
        </div>
      ) : <>
      {/* Header */}
      <div className="flex border-b border-slate-200">
        <div className="w-[200px] shrink-0 px-4 py-3 bg-slate-50 border-r border-slate-200">
          <span className="text-xs font-semibold text-retro-text-secondary uppercase tracking-wider">
            Azione
          </span>
        </div>
        <div className="flex-1 overflow-x-auto">
          <div className="relative h-full" style={{ minWidth }}>
            <div className="flex h-full">
              {dateMarkers.map((date, i) => {
                const pos = (daysBetween(timelineStart, date) / totalDays) * 100
                return (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-l border-slate-100 px-1 py-3"
                    style={{ left: `${pos}%` }}
                  >
                    <span className="text-[10px] text-retro-text-secondary whitespace-nowrap">
                      {formatDateForScale(date, timeScale)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Rows */}
      <div className="relative">
        {actionsWithDeadline.map((action) => {
          const createdAt = new Date(action.created_at)
          const deadline = new Date(action.deadline!)
          const isOverdue = action.status !== 'done' && deadline < today

          const startPos = Math.max(
            0,
            (daysBetween(timelineStart, createdAt) / totalDays) * 100
          )
          const endPos = Math.min(
            100,
            (daysBetween(timelineStart, deadline) / totalDays) * 100
          )
          const width = Math.max(1.5, endPos - startPos)

          return (
            <div
              key={action.id}
              className="flex border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
            >
              {/* Label column */}
              <div className="w-[200px] shrink-0 px-4 py-3 border-r border-slate-200 flex flex-col justify-center gap-1">
                <p className="text-sm text-retro-text truncate" title={action.text}>
                  {action.text}
                </p>
                <span className="inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold bg-retro-primary/10 text-retro-primary">
                  <FolderOpen size={9} />
                  {action.sessionTitle}
                </span>
              </div>

              {/* Bar area */}
              <div className="flex-1 overflow-x-auto">
                <div className="relative h-full py-3 px-1" style={{ minWidth }}>
                  {/* Grid lines */}
                  {dateMarkers.map((date, i) => {
                    const pos = (daysBetween(timelineStart, date) / totalDays) * 100
                    return (
                      <div
                        key={i}
                        className="absolute top-0 h-full border-l border-slate-50"
                        style={{ left: `${pos}%` }}
                      />
                    )
                  })}

                  {/* Today line */}
                  {todayPosition !== null && (
                    <div
                      className="absolute top-0 h-full border-l-2 border-dashed border-retro-primary/40 z-10"
                      style={{ left: `${todayPosition}%` }}
                    />
                  )}

                  {/* Bar */}
                  <div
                    className={`group absolute top-1/2 -translate-y-1/2 h-7 rounded-lg ${getBarColor(action.status, isOverdue)} transition-all duration-200 hover:brightness-110 cursor-default flex items-center px-2 gap-1 z-20`}
                    style={{
                      left: `${startPos}%`,
                      width: `${width}%`,
                      minWidth: '24px',
                    }}
                  >
                    {isOverdue && (
                      <AlertTriangle size={12} className="text-white shrink-0" />
                    )}
                    <span className="text-[11px] text-white font-medium truncate">
                      {width > 8 ? action.text : ''}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                      <div className="bg-retro-text text-white text-xs rounded-lg px-3 py-2 shadow-float whitespace-nowrap">
                        <p className="font-semibold">{action.text}</p>
                        <p className="text-white/70 mt-1">
                          Scadenza: {new Date(action.deadline!).toLocaleDateString('it-IT')}
                        </p>
                        <p className="text-white/70">Stato: {getStatusLabel(action.status)}</p>
                        <p className="text-white/70">Sessione: {action.sessionTitle}</p>
                        {isOverdue && (
                          <p className="text-red-300 font-semibold mt-1">In ritardo!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Today line in header area - label */}
        {todayPosition !== null && (
          <div
            className="absolute top-0 z-30 -translate-x-1/2 pointer-events-none"
            style={{ left: `calc(200px + (100% - 200px) * ${todayPosition / 100})` }}
          >
            <span className="bg-retro-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-b-md">
              OGGI
            </span>
          </div>
        )}
      </div>
      </>}
    </div>
  )
}
