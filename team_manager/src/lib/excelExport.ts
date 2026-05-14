import * as XLSX from 'xlsx'
import type {
  Feature,
  TeamMember,
  WeekColumn,
  Allocation,
  KTLOAllocation,
  NRTAllocation,
  TimeOff,
  FeatureMember,
  Sprint,
} from '@/types'
import { startOfWeek, format } from 'date-fns'

interface ExportData {
  features: Feature[]
  members: TeamMember[]
  featureMembers: FeatureMember[]
  weeks: WeekColumn[]
  allocations: Allocation[]
  ktloAllocations: KTLOAllocation[]
  nrtAllocations: NRTAllocation[]
  timeOffs: TimeOff[]
  sprints: Sprint[]
}

// Converti colore hex in RGB per Excel
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 }
}

// Converti RGB in formato Excel (hex senza #)
function rgbToExcelColor(r: number, g: number, b: number): string {
  return (
    'FF' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  ).toUpperCase()
}

// Ordina membri per ruolo
function sortMembersByRole(members: TeamMember[]): TeamMember[] {
  const roleOrder: Record<string, number> = { PA: 1, PD: 2, BE: 3, FE: 4, QA: 5, QAA: 6 }
  return [...members].sort((a, b) => {
    const orderA = roleOrder[a.role?.name || ''] || 999
    const orderB = roleOrder[b.role?.name || ''] || 999
    return orderA - orderB
  })
}

export function exportTimelineToExcel(data: ExportData) {
  const {
    features,
    members,
    featureMembers,
    weeks,
    allocations,
    ktloAllocations,
    nrtAllocations,
    timeOffs,
    sprints,
  } = data

  // Crea workbook
  const wb = XLSX.utils.book_new()
  const wsData: any[][] = []
  const merges: XLSX.Range[] = []
  let currentRow = 0

  // ============ HEADER ROW ============
  const headerRow = ['Member', 'Role', ...weeks.map((w) => w.label)]
  wsData.push(headerRow)

  // Style header
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
    fill: { fgColor: { rgb: 'FF2563EB' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'FF000000' } },
      bottom: { style: 'thin', color: { rgb: 'FF000000' } },
      left: { style: 'thin', color: { rgb: 'FF000000' } },
      right: { style: 'thin', color: { rgb: 'FF000000' } },
    },
  }

  currentRow++

  // ============ FEATURES ============
  features.forEach((feature) => {
    const featureAllocations = allocations.filter((a) => a.feature_id === feature.id)
    const assignedMemberIds = featureMembers
      .filter((fm) => fm.feature_id === feature.id)
      .map((fm) => fm.member_id)
    const assignedMembers = sortMembersByRole(
      members.filter((m) => assignedMemberIds.includes(m.id))
    )

    // Feature header row con totali
    const featureTotals = weeks.map((week) => {
      const total = featureAllocations
        .filter((a) => a.week_start === week.weekStart && assignedMemberIds.includes(a.member_id))
        .reduce((sum, a) => sum + a.days, 0)
      return Math.round(total * 100) / 100
    })

    wsData.push([feature.name, '', ...featureTotals.map((t) => (t > 0 ? t : ''))])

    // Merge feature name cell
    merges.push({
      s: { r: currentRow, c: 0 },
      e: { r: currentRow, c: 1 },
    })

    currentRow++

    // Member rows
    assignedMembers.forEach((member) => {
      const memberAllocations = weeks.map((week) => {
        const alloc = featureAllocations.find(
          (a) => a.member_id === member.id && a.week_start === week.weekStart
        )
        return alloc ? alloc.days : 0
      })

      wsData.push([member.name, member.role?.name || '', ...memberAllocations.map((a) => (a > 0 ? a : ''))])
      currentRow++
    })
  })

  // ============ KTLO ============
  wsData.push([]) // Empty row
  currentRow++

  const sortedMembers = sortMembersByRole(members)

  // KTLO header
  const ktloTotals = weeks.map((week) => {
    const total = sortedMembers.reduce((sum, member) => {
      const ktlo =
        ktloAllocations.find((k) => k.member_id === member.id && k.week_start === week.weekStart)
          ?.days ?? 0.75
      return sum + ktlo
    }, 0)
    return Math.round(total * 100) / 100
  })

  wsData.push(['KTLO', '', ...ktloTotals.map((t) => (t > 0 ? t : ''))])
  merges.push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 1 },
  })
  currentRow++

  // KTLO members
  sortedMembers.forEach((member) => {
    const ktloValues = weeks.map((week) => {
      return (
        ktloAllocations.find((k) => k.member_id === member.id && k.week_start === week.weekStart)
          ?.days ?? 0.75
      )
    })

    wsData.push([member.name, member.role?.name || '', ...ktloValues.map((v) => (v > 0 ? v : ''))])
    currentRow++
  })

  // ============ NRT ============
  wsData.push([]) // Empty row
  currentRow++

  // NRT header
  const nrtTotals = weeks.map((week) => {
    const total = sortedMembers.reduce((sum, member) => {
      const isQA = member.role?.name === 'QA' || member.role?.name === 'QAA'
      if (!isQA) return sum

      const allocation = nrtAllocations.find(
        (n) => n.member_id === member.id && n.week_start === week.weekStart
      )
      if (allocation) {
        return sum + allocation.days
      } else {
        const isFirstWeek = sprints.some((sprint) => {
          const sprintStart = startOfWeek(new Date(sprint.start_date), { weekStartsOn: 1 })
          return format(sprintStart, 'yyyy-MM-dd') === week.weekStart
        })
        return sum + (isFirstWeek ? 2 : 0)
      }
    }, 0)
    return Math.round(total * 100) / 100
  })

  wsData.push(['NRT', '', ...nrtTotals.map((t) => (t > 0 ? t : ''))])
  merges.push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 1 },
  })
  currentRow++

  // NRT members (solo QA)
  sortedMembers
    .filter((m) => m.role?.name === 'QA' || m.role?.name === 'QAA')
    .forEach((member) => {
      const nrtValues = weeks.map((week) => {
        const allocation = nrtAllocations.find(
          (n) => n.member_id === member.id && n.week_start === week.weekStart
        )
        if (allocation) {
          return allocation.days
        } else {
          const isFirstWeek = sprints.some((sprint) => {
            const sprintStart = startOfWeek(new Date(sprint.start_date), { weekStartsOn: 1 })
            return format(sprintStart, 'yyyy-MM-dd') === week.weekStart
          })
          return isFirstWeek ? 2 : 0
        }
      })

      wsData.push([member.name, member.role?.name || '', ...nrtValues.map((v) => (v > 0 ? v : ''))])
      currentRow++
    })

  // ============ TIME OFF ============
  wsData.push([]) // Empty row
  currentRow++

  // Time Off header
  const timeOffTotals = weeks.map((week) => {
    const total = sortedMembers.reduce((sum, member) => {
      const timeOff =
        timeOffs.find((t) => t.member_id === member.id && t.week_start === week.weekStart)?.days ||
        0
      return sum + timeOff
    }, 0)
    return Math.round(total * 100) / 100
  })

  wsData.push(['Time Off', '', ...timeOffTotals.map((t) => (t > 0 ? t : ''))])
  merges.push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 1 },
  })
  currentRow++

  // Time Off members (solo quelli con ferie)
  sortedMembers.forEach((member) => {
    const timeOffValues = weeks.map((week) => {
      return (
        timeOffs.find((t) => t.member_id === member.id && t.week_start === week.weekStart)?.days ||
        0
      )
    })

    // Aggiungi riga solo se ha almeno una settimana di ferie
    if (timeOffValues.some((v) => v > 0)) {
      wsData.push([member.name, member.role?.name || '', ...timeOffValues.map((v) => (v > 0 ? v : ''))])
      currentRow++
    }
  })

  // ============ CAPACITY SUMMARY ============
  wsData.push([]) // Empty row
  currentRow++

  wsData.push(['Capacity Summary', '', ...weeks.map(() => '')])
  merges.push({
    s: { r: currentRow, c: 0 },
    e: { r: currentRow, c: 1 },
  })
  currentRow++

  // Capacity per member
  sortedMembers.forEach((member) => {
    const capacityValues = weeks.map((week) => {
      // Features
      const features = allocations
        .filter((a) => a.member_id === member.id && a.week_start === week.weekStart)
        .reduce((sum, a) => sum + a.days, 0)

      // KTLO
      const ktlo =
        ktloAllocations.find((k) => k.member_id === member.id && k.week_start === week.weekStart)
          ?.days ?? 0.75

      // NRT
      const isQA = member.role?.name === 'QA' || member.role?.name === 'QAA'
      let nrt = 0
      if (isQA) {
        const allocation = nrtAllocations.find(
          (n) => n.member_id === member.id && n.week_start === week.weekStart
        )
        if (allocation) {
          nrt = allocation.days
        } else {
          const isFirstWeek = sprints.some((sprint) => {
            const sprintStart = startOfWeek(new Date(sprint.start_date), { weekStartsOn: 1 })
            return format(sprintStart, 'yyyy-MM-dd') === week.weekStart
          })
          nrt = isFirstWeek ? 2 : 0
        }
      }

      // Time Off
      const timeOff =
        timeOffs.find((t) => t.member_id === member.id && t.week_start === week.weekStart)?.days ||
        0

      const total = Math.round((features + ktlo + nrt + timeOff) * 100) / 100
      return total > 0 ? total : ''
    })

    wsData.push([member.name, member.role?.name || '', ...capacityValues])
    currentRow++
  })

  // Crea worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Applica merges
  ws['!merges'] = merges

  // Imposta larghezza colonne
  ws['!cols'] = [
    { wch: 20 }, // Member name
    { wch: 8 }, // Role
    ...weeks.map(() => ({ wch: 10 })), // Week columns
  ]

  // Aggiungi worksheet al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Timeline')

  // Genera file
  const fileName = `Timeline_Export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.xlsx`
  XLSX.writeFile(wb, fileName)
}
