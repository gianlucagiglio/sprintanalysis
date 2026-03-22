import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploader } from "@/components/FileUploader"
import { TransactionTable } from "@/components/TransactionTable"
import { useFinanceStore } from "@/store/financeStore"
import { Landmark, Trash2 } from "lucide-react"

export function BankAccountPage() {
  const transactions = useFinanceStore((s) => s.bankTransactions)
  const clearBank = useFinanceStore((s) => s.clearBank)

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    const expenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    return { income, expenses, balance: income - expenses }
  }, [transactions])

  const formatEUR = (v: number) =>
    new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(v)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Landmark className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Conto Corrente</h1>
        </div>
        {transactions.length > 0 && (
          <button
            onClick={clearBank}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Cancella dati
          </button>
        )}
      </div>

      <FileUploader source="bank" label="del conto corrente" />

      {transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Entrate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold font-mono text-green-500">
                {formatEUR(totals.income)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Uscite</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold font-mono text-red-500">
                {formatEUR(totals.expenses)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xl font-bold font-mono ${
                  totals.balance >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {formatEUR(totals.balance)}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <TransactionTable transactions={transactions} />
    </div>
  )
}
