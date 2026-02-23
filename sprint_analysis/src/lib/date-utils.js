/**
 * Date utilities for sprint analysis
 */

/**
 * Parse a date value into a Date object.
 * Handles ISO strings, Excel serial numbers, and Date objects.
 */
export function parseDate(val) {
  if (!val) return null
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val
  if (typeof val === 'number') {
    // Excel serial number: days since 1900-01-01 (with the off-by-one bug)
    const epoch = new Date(1899, 11, 30) // Dec 30, 1899
    const ms = epoch.getTime() + val * 86400000
    const d = new Date(ms)
    return isNaN(d.getTime()) ? null : d
  }
  if (typeof val === 'string') {
    const d = new Date(val)
    return isNaN(d.getTime()) ? null : d
  }
  return null
}

/**
 * Difference in calendar days between two dates.
 * Returns null if either date is invalid.
 */
export function diffDays(start, end) {
  const a = parseDate(start)
  const b = parseDate(end)
  if (!a || !b) return null
  const msPerDay = 86400000
  return Math.round((b.getTime() - a.getTime()) / msPerDay)
}

/**
 * Get the date range for a sprint number.
 * Base: sprint 133 starts 2025-01-06, each sprint is 14 days.
 */
export function sprintDateRange(sprintNum) {
  const baseSprint = 133
  const baseDate = new Date(2025, 0, 6) // 2025-01-06
  const offset = (sprintNum - baseSprint) * 14
  const start = new Date(baseDate.getTime() + offset * 86400000)
  const end = new Date(start.getTime() + 13 * 86400000) // 14-day sprint, last day inclusive
  return {
    start,
    end,
    startISO: toISO(start),
    endISO: toISO(end),
  }
}

/**
 * Format a Date to ISO date string (YYYY-MM-DD)
 */
export function toISO(date) {
  if (!date) return null
  const d = parseDate(date)
  if (!d) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
