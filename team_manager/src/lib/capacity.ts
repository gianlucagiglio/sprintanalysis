import { startOfWeek, addWeeks, format, differenceInWeeks } from 'date-fns'
import { it } from 'date-fns/locale'
import type {
  Sprint,
  TeamMember,
  Allocation,
  TimeOff,
  KTLOAllocation,
  WeekColumn,
  SprintSpan,
  CapacityInfo,
} from '@/types'

/**
 * Genera le colonne settimanali basate sugli sprint disponibili
 */
export function generateWeekColumns(sprints: Sprint[]): WeekColumn[] {
  if (sprints.length === 0) return []

  // Trova il range totale (dal primo sprint all'ultimo)
  const allDates = sprints.flatMap((s) => [
    new Date(s.start_date),
    new Date(s.end_date),
  ])
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())))

  // Trova il lunedì della settimana del minDate
  const firstMonday = startOfWeek(minDate, { weekStartsOn: 1 })
  const lastMonday = startOfWeek(maxDate, { weekStartsOn: 1 })

  const weeks: WeekColumn[] = []
  let currentMonday = firstMonday

  while (currentMonday <= lastMonday) {
    weeks.push({
      weekStart: format(currentMonday, 'yyyy-MM-dd'),
      label: format(currentMonday, 'd MMM', { locale: it }),
    })
    currentMonday = addWeeks(currentMonday, 1)
  }

  return weeks
}

/**
 * Calcola lo span delle colonne per ogni sprint
 */
export function getSprintSpans(
  sprints: Sprint[],
  weeks: WeekColumn[]
): SprintSpan[] {
  return sprints.map((sprint) => {
    const sprintStart = startOfWeek(new Date(sprint.start_date), {
      weekStartsOn: 1,
    })
    const sprintEnd = startOfWeek(new Date(sprint.end_date), { weekStartsOn: 1 })

    const startCol = weeks.findIndex(
      (w) => w.weekStart === format(sprintStart, 'yyyy-MM-dd')
    )
    const endCol = weeks.findIndex(
      (w) => w.weekStart === format(sprintEnd, 'yyyy-MM-dd')
    )

    return {
      sprint,
      startCol: startCol >= 0 ? startCol : 0,
      colSpan: endCol >= startCol ? endCol - startCol + 1 : 1,
    }
  })
}

/**
 * Calcola le informazioni di capacità per un membro in una settimana
 */
export function getCapacityInfo(
  member: TeamMember,
  weekStart: string,
  allocations: Allocation[],
  timeOffs: TimeOff[],
  ktloAllocations: KTLOAllocation[] = []
): CapacityInfo {
  // Allocazioni totali per questa settimana
  const allocated = allocations
    .filter((a) => a.member_id === member.id && a.week_start === weekStart)
    .reduce((sum, a) => sum + a.days, 0)

  // Ferie per questa settimana
  const timeOff =
    timeOffs.find((t) => t.member_id === member.id && t.week_start === weekStart)
      ?.days || 0

  // KTLO per questa settimana (default 1.5 se non specificato)
  const ktlo =
    ktloAllocations.find((k) => k.member_id === member.id && k.week_start === weekStart)
      ?.days ?? 1.5

  const total = member.weekly_capacity
  const available = total - timeOff - ktlo - allocated

  return {
    allocated,
    timeOff,
    available,
    total,
    isOverCapacity: allocated + timeOff + ktlo > total,
  }
}
