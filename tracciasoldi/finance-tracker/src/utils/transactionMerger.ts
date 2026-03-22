import type { Transaction } from "@/types/Transaction"

export type MergeResult = {
  transactions: Transaction[]
  removedBankCharges: Transaction[]
  warnings: string[]
}

const CARD_CHARGE_PATTERNS = [
  /addebito\s+nexi/i,
  /nexi\s+payments/i,
  /nexi\s+spa/i,
  /carta\s+di\s+credito/i,
  /pagamento\s+carta/i,
  /addebito\s+carta/i,
  /pag\s+carta/i,
  /pag\.?\s*carta/i,
  /visa\s+europe/i,
  /mastercard/i,
  /\bamex\b/i,
  /american\s+express/i,
]

function isCardCharge(tx: Transaction): boolean {
  return CARD_CHARGE_PATTERNS.some((pattern) => pattern.test(tx.description))
}

function getYearMonth(dateStr: string): string {
  // Use string parsing to avoid timezone issues with new Date()
  return dateStr.substring(0, 7)
}

function shiftMonth(yearMonth: string, offset: number): string {
  const [y, m] = yearMonth.split("-").map(Number)
  const d = new Date(y, m - 1 + offset, 1)
  const ny = d.getFullYear()
  const nm = String(d.getMonth() + 1).padStart(2, "0")
  return `${ny}-${nm}`
}

function groupByMonth(txs: Transaction[]): Map<string, Transaction[]> {
  const map = new Map<string, Transaction[]>()
  for (const tx of txs) {
    const ym = getYearMonth(tx.date)
    const arr = map.get(ym) ?? []
    arr.push(tx)
    map.set(ym, arr)
  }
  return map
}

export function mergeTransactions(
  bankTxs: Transaction[],
  cardTxs: Transaction[],
): MergeResult {
  const warnings: string[] = []
  const removedBankCharges: Transaction[] = []

  // Edge case: no card data → return bank as-is
  if (cardTxs.length === 0) {
    return {
      transactions: [...bankTxs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
      removedBankCharges: [],
      warnings: [],
    }
  }

  // Separate bank transactions into card charges and others
  const bankCardCharges: Transaction[] = []
  const bankOther: Transaction[] = []

  for (const tx of bankTxs) {
    if (isCardCharge(tx)) {
      bankCardCharges.push(tx)
    } else {
      bankOther.push(tx)
    }
  }

  // Edge case: no card charges detected in bank → simple concat
  if (bankCardCharges.length === 0) {
    return {
      transactions: [...bankTxs, ...cardTxs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
      removedBankCharges: [],
      warnings: [],
    }
  }

  // Group card transactions by month
  const cardByMonth = groupByMonth(cardTxs)

  // For each bank card charge, check if we have card detail for that billing cycle
  for (const charge of bankCardCharges) {
    const chargeMonth = getYearMonth(charge.date)
    // Bank charge in month N typically covers card spending from month N-1
    const candidateMonths = [
      shiftMonth(chargeMonth, -1), // primary: previous month
      chargeMonth, // fallback: same month
      shiftMonth(chargeMonth, -2), // fallback: two months prior
    ]

    const matchedMonth = candidateMonths.find((m) => cardByMonth.has(m))

    if (matchedMonth) {
      // We have card detail → remove the bank charge
      removedBankCharges.push(charge)

      // Validate amounts
      const cardMonthTxs = cardByMonth.get(matchedMonth)!
      const cardTotal = Math.abs(
        cardMonthTxs.reduce((sum, tx) => sum + tx.amount, 0),
      )
      const chargeAmount = Math.abs(charge.amount)

      if (cardTotal > 0 && chargeAmount > 0) {
        const diff = Math.abs(chargeAmount - cardTotal)
        const pctDiff = (diff / chargeAmount) * 100

        if (pctDiff > 5 || diff > 10) {
          const fmt = (n: number) => n.toFixed(2)
          warnings.push(
            `Discrepanza per ${charge.description} (${charge.date}): ` +
              `addebito banca €${fmt(chargeAmount)} vs totale carta €${fmt(cardTotal)} ` +
              `(differenza: €${fmt(diff)}, ${pctDiff.toFixed(1)}%)`,
          )
        }
      }
    }
    // else: no card data for this period → keep the bank charge (it stays in bankOther implicitly by not being in removedBankCharges... but we need to re-add it)
  }

  // Build the final list: bankOther + non-removed bank card charges + all card txs
  const removedIds = new Set(removedBankCharges.map((tx) => tx.id))
  const keptBankCharges = bankCardCharges.filter((tx) => !removedIds.has(tx.id))

  const merged = [...bankOther, ...keptBankCharges, ...cardTxs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  return {
    transactions: merged,
    removedBankCharges,
    warnings,
  }
}
