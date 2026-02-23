import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const CLASSIFICATION_COLORS = {
  Strategic: '#3b82f6',
  KTLO: '#f59e0b',
  'Small Change': '#22c55e',
  Other: '#a855f7',
  Unclassified: '#6b7280',
}

export const CLASSIFICATION_BG = {
  Strategic: 'bg-blue-100 text-blue-800',
  KTLO: 'bg-amber-100 text-amber-800',
  'Small Change': 'bg-green-100 text-green-800',
  Other: 'bg-purple-100 text-purple-800',
  Unclassified: 'bg-gray-100 text-gray-800',
}

export const PROFESSIONAL_FAMILIES = [
  'BE', 'FE', 'Design', 'Analysis', 'QA', 'Automation', 'Native', 'Platform Eng'
]

export const EFFORT_FIELDS = [
  'Effort Analysis',
  'Effort Automation',
  'Effort BE',
  'Effort Design',
  'Effort FE',
  'Effort QA',
  'Effort Native',
  'Effort Platform Eng',
]

export function formatNumber(n, decimals = 0) {
  if (n == null || isNaN(n)) return '0'
  return n.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatSP(n) {
  if (n == null || isNaN(n)) return '0 SP'
  return `${formatNumber(n)} SP`
}

/**
 * Parse tags string into array of individual tags
 */
export function parseTags(tags) {
  if (!tags || typeof tags !== 'string') return []
  return tags.split(';').map(t => t.trim()).filter(Boolean)
}

/**
 * Color palette for dimension analysis charts
 */
export const DIMENSION_COLORS = [
  '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#a855f7',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
  '#14b8a6', '#e11d48', '#8b5cf6', '#0ea5e9', '#d946ef',
]

export function getDimensionColor(index) {
  return DIMENSION_COLORS[index % DIMENSION_COLORS.length]
}
