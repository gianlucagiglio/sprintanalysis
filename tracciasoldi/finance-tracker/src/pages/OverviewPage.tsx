import { useMemo, useState } from "react"
import { Dashboard } from "@/components/Dashboard"
import { useFinanceStore } from "@/store/financeStore"
import { mergeTransactions } from "@/utils/transactionMerger"
import { LayoutDashboard, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react"

export function OverviewPage() {
  const bankTransactions = useFinanceStore((s) => s.bankTransactions)
  const creditCardTransactions = useFinanceStore((s) => s.creditCardTransactions)
  const [showDetails, setShowDetails] = useState(false)

  const mergeResult = useMemo(
    () => mergeTransactions(bankTransactions, creditCardTransactions),
    [bankTransactions, creditCardTransactions],
  )

  const hasRemovedCharges = mergeResult.removedBankCharges.length > 0
  const hasWarnings = mergeResult.warnings.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Panoramica Finanziaria</h1>
      </div>

      {hasWarnings && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-yellow-500">Attenzione</p>
            {mergeResult.warnings.map((w, i) => (
              <p key={i} className="text-muted-foreground">{w}</p>
            ))}
          </div>
        </div>
      )}

      {hasRemovedCharges && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
          <div className="flex-1 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                <span className="font-medium text-blue-500">
                  {mergeResult.removedBankCharges.length} addebito/i carta
                </span>{" "}
                rimossi dal conto corrente per evitare doppi conteggi
              </p>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1 text-blue-500 hover:text-blue-400"
              >
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
            {showDetails && (
              <ul className="space-y-1 text-muted-foreground">
                {mergeResult.removedBankCharges.map((tx) => (
                  <li key={tx.id} className="font-mono text-xs">
                    {tx.date} — {tx.description} — €{Math.abs(tx.amount).toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <Dashboard transactions={mergeResult.transactions} />
    </div>
  )
}
