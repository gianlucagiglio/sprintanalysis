import { useMemo } from "react"
import { Dashboard } from "@/components/Dashboard"
import { useFinanceStore } from "@/store/financeStore"
import { LayoutDashboard } from "lucide-react"

export function OverviewPage() {
  const bankTransactions = useFinanceStore((s) => s.bankTransactions)
  const creditCardTransactions = useFinanceStore((s) => s.creditCardTransactions)
  const allTransactions = useMemo(
    () => [...bankTransactions, ...creditCardTransactions],
    [bankTransactions, creditCardTransactions],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Panoramica Finanziaria</h1>
      </div>

      <Dashboard transactions={allTransactions} />
    </div>
  )
}
