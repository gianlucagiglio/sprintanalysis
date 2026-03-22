import * as XLSX from "xlsx"
import Papa from "papaparse"
import type { Transaction, TransactionSource } from "@/types/Transaction"
import { categorize } from "@/utils/categorizer"

function generateId(): string {
  return crypto.randomUUID()
}

function parseDate(value: unknown): string {
  if (!value) return ""

  if (typeof value === "number") {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(value)
    if (date) {
      const y = date.y
      const m = String(date.m).padStart(2, "0")
      const d = String(date.d).padStart(2, "0")
      return `${y}-${m}-${d}`
    }
  }

  const str = String(value).trim()

  // DD/MM/YYYY
  const dmy = str.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`
  }

  // YYYY-MM-DD
  const ymd = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (ymd) {
    return `${ymd[1]}-${ymd[2]}-${ymd[3]}`
  }

  return str
}

function parseAmount(value: unknown): number {
  if (typeof value === "number") return value
  if (!value) return 0

  const str = String(value)
    .replace(/[€$£\s]/g, "")
    .replace(/\./g, "") // remove thousands separator (Italian)
    .replace(",", ".") // convert decimal comma to dot
    .trim()

  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

// Header keywords used to detect the actual header row
const HEADER_KEYWORDS = [
  "data", "date", "valuta",
  "descri", "causale", "dettagli", "motivo", "operazione",
  "importo", "amount", "somma",
  "dare", "avere", "addebito", "accredito", "debit", "credit",
]

// Find the actual header row index by looking for rows with known keywords
function findHeaderRow(rows: unknown[][]): number {
  for (let i = 0; i < Math.min(rows.length, 20); i++) {
    const row = rows[i]
    if (!row || row.length < 2) continue

    const cellTexts = row.map((c) => (c || "").toString().toLowerCase().trim())
    const matches = cellTexts.filter((t) =>
      HEADER_KEYWORDS.some((kw) => t.includes(kw))
    )
    // At least 2 header keywords found = likely the header row
    if (matches.length >= 2) return i
  }
  return 0
}

// Try to detect which columns are date, description, and amount
function detectColumns(headers: string[]): {
  dateCol: number
  descCol: number
  amountCol: number
  creditCol: number
  debitCol: number
  statusCol: number
} {
  const lower = headers.map((h) => (h || "").toString().toLowerCase().trim())

  let dateCol = -1
  let descCol = -1
  let amountCol = -1
  let creditCol = -1
  let debitCol = -1
  let statusCol = -1

  for (let i = 0; i < lower.length; i++) {
    const h = lower[i]
    if (dateCol === -1 && (h.includes("data") || h.includes("date") || h.includes("valuta"))) {
      dateCol = i
    }
    if (descCol === -1 && (h.includes("descri") || h.includes("causale") || h.includes("dettagli") || h.includes("motivo") || h.includes("operazione"))) {
      descCol = i
    }
    // Prefer "importo (€)" or standalone "importo" over "importo originale"
    if (h.includes("importo") || h.includes("amount") || h.includes("somma")) {
      if (amountCol === -1 || !h.includes("originale")) {
        amountCol = i
      }
    }
    if (h.includes("dare") || h.includes("addebito") || h.includes("debit") || h.includes("uscit")) {
      debitCol = i
    }
    if (h.includes("avere") || h.includes("accredito") || h.includes("credit") || h.includes("entrat")) {
      creditCol = i
    }
    if (statusCol === -1 && (h.includes("stato") || h.includes("status"))) {
      statusCol = i
    }
  }

  // Fallback: first column = date, second = desc, third = amount
  if (dateCol === -1) dateCol = 0
  if (descCol === -1) descCol = Math.min(1, headers.length - 1)
  if (amountCol === -1 && creditCol === -1 && debitCol === -1) {
    amountCol = Math.min(2, headers.length - 1)
  }

  return { dateCol, descCol, amountCol, creditCol, debitCol, statusCol }
}

function rowsToTransactions(
  rows: unknown[][],
  source: TransactionSource,
): Transaction[] {
  if (rows.length < 2) return []

  const headerIdx = findHeaderRow(rows)
  const headers = rows[headerIdx] as string[]
  const { dateCol, descCol, amountCol, creditCol, debitCol, statusCol } = detectColumns(headers)

  const transactions: Transaction[] = []

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const row = rows[i]
    if (!row || row.length === 0) continue

    const description = String(row[descCol] || "").trim()
    if (!description) continue

    // Skip summary/total rows
    const descLower = description.toLowerCase()
    if (descLower.startsWith("totale") || descLower.startsWith("saldo")) continue

    const date = parseDate(row[dateCol])

    let amount: number
    if (amountCol !== -1) {
      amount = parseAmount(row[amountCol])
    } else {
      // Separate credit/debit columns
      const credit = creditCol !== -1 ? parseAmount(row[creditCol]) : 0
      const debit = debitCol !== -1 ? parseAmount(row[debitCol]) : 0
      amount = credit > 0 ? credit : -Math.abs(debit)
    }

    if (amount === 0 && !description) continue

    let status: string | undefined
    if (statusCol !== -1) {
      const rawStatus = String(row[statusCol] || "").trim().toLowerCase()
      if (rawStatus) {
        status = rawStatus
      } else if (source === "credit_card") {
        // In Nexi exports, empty status means contabilizzato
        status = "contabilizzato"
      }
    }

    transactions.push({
      id: generateId(),
      date,
      description,
      amount,
      category: categorize(description),
      source,
      ...(status ? { status } : {}),
    })
  }

  return transactions
}

export async function parseFile(
  file: File,
  source: TransactionSource,
): Promise<Transaction[]> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "csv" || ext === "txt") {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        complete: (results) => {
          const rows = results.data as unknown[][]
          resolve(rowsToTransactions(rows, source))
        },
        error: (err) => reject(err),
        skipEmptyLines: true,
      })
    })
  }

  // Excel file (xls, xlsx)
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]

  return rowsToTransactions(rows, source)
}
