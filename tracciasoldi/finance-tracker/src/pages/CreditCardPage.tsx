import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/FileUploader"
import { TransactionTable } from "@/components/TransactionTable"
import { useFinanceStore } from "@/store/financeStore"
import { CreditCard, Trash2 } from "lucide-react"

export function CreditCardPage() {
  const transactions = useFinanceStore((s) => s.creditCardTransactions)
  const clearCard = useFinanceStore((s) => s.clearCreditCard)

  const stats = useMemo(() => {
    // Credit card: positive = expense, negative = refund
    const expenses = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)

    const refunds = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Monthly breakdown (only expenses, excluding refunds)
    const monthMap = new Map<string, number>()
    for (const tx of transactions) {
      if (tx.amount <= 0) continue
      const month = tx.date.substring(0, 7)
      if (month) {
        monthMap.set(month, (monthMap.get(month) || 0) + tx.amount)
      }
    }
    const months = Array.from(monthMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))

    return { expenses, refunds, months, count: transactions.length }
  }, [transactions])

  const formatEUR = (v: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(v)

  const formatMonth = (ym: string) => {
    const monthNames = [
      "Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno",
      "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre",
    ]
    const [y, m] = ym.split("-")
    return `${monthNames[parseInt(m, 10) - 1]} ${y}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Carta di Credito</h1>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={clearCard}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Cancella dati
          </button>
        )}
      </div>

      <FileUploader source="credit_card" label="della carta di credito" />

      {transactions.length > 0 && (
        <>
          <div className={`grid grid-cols-1 gap-4 ${stats.refunds > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Spesa Totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono text-red-500">
                  {formatEUR(stats.expenses)}
                </p>
              </CardContent>
            </Card>
            {stats.refunds > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">
                    Rimborsi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xl font-bold font-mono text-green-500">
                    {formatEUR(stats.refunds)}
                  </p>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Transazioni
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold font-mono">{stats.count}</p>
              </CardContent>
            </Card>
          </div>

          {stats.months.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Riepilogo Mensile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.months.map(([month, amount]) => (
                    <div
                      key={month}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-sm">{formatMonth(month)}</span>
                      <span className="font-mono font-medium text-red-500">
                        {formatEUR(amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <TransactionTable transactions={transactions} />
    </div>
  )
}
