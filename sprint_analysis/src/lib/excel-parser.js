import * as XLSX from 'xlsx'
import { parseDate, toISO } from './date-utils'

/**
 * Convert Excel date value (serial number or string) to ISO date string.
 */
export function parseExcelDate(val) {
  if (val == null || val === '' || val === 'null') return null
  const d = parseDate(val)
  return d ? toISO(d) : null
}

const COLUMN_MAP = {
  'ID': 'id',
  'Work Item Type': 'type',
  'Title': 'title',
  'State': 'state',
  'Effort': 'effort',
  'Iteration Path': 'iterationPath',
  'Parent': 'parent',
  'Business Value': 'businessValue',
  'Value Area': 'valueArea',
  'Tags': 'tags',
  'Area Path': 'areaPath',
  'Product Area': 'productArea',
  // Date columns
  'Created Date': 'createdDate',
  'Changed Date': 'changedDate',
  'Closed Date': 'closedDate',
  // Legacy date columns
  'Start Date': 'startDate',
  'Finish Date': 'finishDate',
  // Bug-specific fields
  'Severity': 'severity',
  'Priority': 'priority',
  'Frequence': 'frequence',
  'Prevalence': 'prevalence',
  // Effort-per-family columns
  'Effort Analysis': 'effortAnalysis',
  'Effort Automation': 'effortAutomation',
  'Effort BE': 'effortBE',
  'Effort Design': 'effortDesign',
  'Effort FE': 'effortFE',
  'Effort QA': 'effortQA',
  'Effort Native': 'effortNative',
  'Effort Platform Eng': 'effortPlatformEng',
}

// Title columns by hierarchy level (Azure DevOps tree-view export format)
const TITLE_COLUMNS = ['Title 1', 'Title 2', 'Title 3', 'Title 4', 'Title 5']

function mapRow(row) {
  const mapped = {}
  for (const [excelCol, internalKey] of Object.entries(COLUMN_MAP)) {
    let val = row[excelCol]
    if (val === 'null' || val === 'undefined' || val === undefined) val = null
    mapped[internalKey] = val
  }

  // Resolve title: support both single "Title" column and "Title 1"–"Title 5" hierarchy columns
  if (!mapped.title) {
    for (const tc of TITLE_COLUMNS) {
      if (row[tc] != null && row[tc] !== '') {
        mapped.title = row[tc]
        break
      }
    }
  }
  mapped.title = mapped.title ? String(mapped.title) : ''

  // Parse numeric fields
  mapped.id = mapped.id != null ? Number(mapped.id) : null
  // Keep raw parent - will be resolved after all rows are parsed (could be ID or title)
  mapped._rawParent = mapped.parent
  const parentNum = mapped.parent != null ? Number(mapped.parent) : NaN
  mapped.parent = isNaN(parentNum) ? null : parentNum
  mapped.effort = parseFloat(mapped.effort) || 0
  mapped.businessValue = parseFloat(mapped.businessValue) || 0
  mapped.priority = mapped.priority != null ? Number(mapped.priority) : null
  mapped.effortAnalysis = parseFloat(mapped.effortAnalysis) || 0
  mapped.effortAutomation = parseFloat(mapped.effortAutomation) || 0
  mapped.effortBE = parseFloat(mapped.effortBE) || 0
  mapped.effortDesign = parseFloat(mapped.effortDesign) || 0
  mapped.effortFE = parseFloat(mapped.effortFE) || 0
  mapped.effortQA = parseFloat(mapped.effortQA) || 0
  mapped.effortNative = parseFloat(mapped.effortNative) || 0
  mapped.effortPlatformEng = parseFloat(mapped.effortPlatformEng) || 0

  // Parse date fields (support both old and new column names)
  mapped.createdDate = parseExcelDate(mapped.createdDate)
  mapped.changedDate = parseExcelDate(mapped.changedDate)
  mapped.closedDate = parseExcelDate(mapped.closedDate)
  mapped.startDate = parseExcelDate(mapped.startDate) || mapped.createdDate
  mapped.finishDate = parseExcelDate(mapped.finishDate) || mapped.closedDate

  return mapped
}

/**
 * Hierarchy rank used for parent disambiguation when titles are duplicated.
 * A Feature's parent should be an Epic, a User Story's parent a Feature, etc.
 */
const TYPE_RANK = { 'Epic': 0, 'Feature': 1, 'User Story': 2, 'Tech Story': 2, 'Bug': 2, 'Issue': 2, 'Task': 3, 'Incident Analysis': 2, 'Ticket': 2 }

function expectedParentType(childType) {
  const rank = TYPE_RANK[childType]
  if (rank == null || rank === 0) return null
  // Return the type(s) one level above
  if (rank === 1) return 'Epic'
  if (rank === 2) return 'Feature'
  // Tasks can be under User Story, Tech Story, Bug, or Feature
  return null
}

/**
 * After all rows are parsed, resolve string parents (titles) to numeric IDs.
 * Handles both numeric IDs and title-based parent references.
 */
function resolveParentsByTitle(items) {
  // If all parents are already numeric, nothing to do
  const needsResolution = items.some(i => i.parent == null && i._rawParent != null && i._rawParent !== '')
  if (!needsResolution) {
    items.forEach(i => { delete i._rawParent })
    return items
  }

  // Build title -> items lookup
  const titleToItems = new Map()
  const idSet = new Set()
  items.forEach(item => {
    idSet.add(item.id)
    if (item.title) {
      if (!titleToItems.has(item.title)) titleToItems.set(item.title, [])
      titleToItems.get(item.title).push(item)
    }
  })

  items.forEach(item => {
    // Already resolved (was numeric)
    if (item.parent != null) {
      delete item._rawParent
      return
    }

    const raw = item._rawParent
    delete item._rawParent

    if (raw == null || raw === '') return

    const rawStr = String(raw).trim()
    if (!rawStr) return

    const candidates = titleToItems.get(rawStr)
    if (!candidates || candidates.length === 0) return

    if (candidates.length === 1) {
      item.parent = candidates[0].id
      return
    }

    // Multiple candidates - disambiguate by expected parent type
    const expected = expectedParentType(item.type)
    if (expected) {
      const match = candidates.find(c => c.type === expected)
      if (match) {
        item.parent = match.id
        return
      }
    }

    // Fallback: pick the candidate whose type rank is closest above this item
    const childRank = TYPE_RANK[item.type] ?? 99
    let best = null
    let bestDist = 99
    for (const c of candidates) {
      const cRank = TYPE_RANK[c.type] ?? 99
      const dist = childRank - cRank
      if (dist > 0 && dist < bestDist) {
        bestDist = dist
        best = c
      }
    }
    item.parent = best ? best.id : candidates[0].id
  })

  return items
}

export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json(worksheet)

        // Filter out header dupes and rows without Work Item Type (junk/empty rows)
        const filtered = rawRows.filter(r => r['ID'] !== 'ID' && r['Work Item Type'])
        const items = resolveParentsByTitle(
          filtered.map(mapRow).filter(item => item.id != null)
        )

        resolve(items)
      } catch (err) {
        reject(new Error(`Errore parsing Excel: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Errore lettura file'))
    reader.readAsArrayBuffer(file)
  })
}

export function parseExcelFromArray(arrayBuffer) {
  const data = new Uint8Array(arrayBuffer)
  const workbook = XLSX.read(data, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json(worksheet)

  const filtered = rawRows.filter(r => r['ID'] !== 'ID' && r['Work Item Type'])
  return resolveParentsByTitle(
    filtered.map(mapRow).filter(item => item.id != null)
  )
}
