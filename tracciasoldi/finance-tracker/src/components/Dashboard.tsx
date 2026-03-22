import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowRightLeft,
  Store,
  Repeat,
  CalendarDays,
  Percent,
  Target,
  CreditCard,
  Undo2,
  Landmark,
} from "lucide-react"
import type { Transaction } from "@/types/Transaction"

interface DashboardProps {
  transactions: Transaction[]
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#2563eb",
]

function formatEUR(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatEUR2(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value)
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function Dashboard({ transactions }: DashboardProps) {
  const isExpense = (t: Transaction) =>
    t.source === "credit_card" ? t.amount > 0 : t.amount < 0
  const isIncome = (t: Transaction) =>
    t.source !== "credit_card" && t.amount > 0
  const isRefund = (t: Transaction) =>
    t.source === "credit_card" && t.amount < 0

  const stats = useMemo(() => {
    const income = transactions
      .filter(isIncome)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const grossExpenses = transactions
      .filter(isExpense)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const refunds = transactions
      .filter(isRefund)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Net expenses = gross expenses - card refunds
    const expenses = grossExpenses - refunds

    const net = income - expenses

    // Category breakdown (expenses only)
    const categoryMap = new Map<string, number>()
    for (const tx of transactions) {
      if (isExpense(tx)) {
        const cat = tx.category || "Altro"
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(tx.amount))
      }
    }
    const byCategory = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    // Monthly breakdown
    const monthMap = new Map<string, { income: number; expenses: number }>()
    for (const tx of transactions) {
      const month = tx.date.substring(0, 7)
      if (!month) continue
      const entry = monthMap.get(month) || { income: 0, expenses: 0 }
      if (isIncome(tx)) {
        entry.income += Math.abs(tx.amount)
      } else if (isRefund(tx)) {
        // Card refunds reduce expenses, not increase income
        entry.expenses -= Math.abs(tx.amount)
      } else if (isExpense(tx)) {
        entry.expenses += Math.abs(tx.amount)
      }
      monthMap.set(month, entry)
    }
    const byMonth = Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month: formatMonth(month),
        rawMonth: month,
        Entrate: Math.round(data.income),
        Uscite: Math.round(data.expenses),
      }))
      .sort((a, b) => a.rawMonth.localeCompare(b.rawMonth))

    return { income, expenses, net, byCategory, byMonth, monthMap }
  }, [transactions])

  // 1. Top 10 Esercenti
  const topMerchants = useMemo(() => {
    const map = new Map<string, number>()
    for (const tx of transactions) {
      if (!isExpense(tx)) continue
      const name = tx.description.trim().toLowerCase()
      if (!name) continue
      map.set(name, (map.get(name) || 0) + Math.abs(tx.amount))
    }
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
    const max = sorted[0]?.[1] || 1
    return sorted.map(([name, total]) => ({ name, total, pct: (total / max) * 100 }))
  }, [transactions])

  // 2. Spese Ricorrenti
  const recurring = useMemo(() => {
    const descMonths = new Map<string, Set<string>>()
    const descAmounts = new Map<string, number[]>()
    for (const tx of transactions) {
      if (!isExpense(tx)) continue
      const name = tx.description.trim().toLowerCase()
      const month = tx.date.substring(0, 7)
      if (!name || !month) continue
      if (!descMonths.has(name)) descMonths.set(name, new Set())
      descMonths.get(name)!.add(month)
      if (!descAmounts.has(name)) descAmounts.set(name, [])
      descAmounts.get(name)!.push(Math.abs(tx.amount))
    }
    const items: { name: string; frequency: number; avg: number; annualized: number }[] = []
    for (const [name, months] of descMonths) {
      if (months.size < 2) continue
      const amounts = descAmounts.get(name)!
      const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length
      items.push({ name, frequency: months.size, avg, annualized: avg * 12 })
    }
    return items.sort((a, b) => b.annualized - a.annualized)
  }, [transactions])

  // 3. Trend Spesa vs Mese Precedente
  const monthlyTrend = useMemo(() => {
    const sorted = Array.from(stats.monthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
    const trends: { month: string; expenses: number; change: number | null }[] = []
    for (let i = 0; i < sorted.length; i++) {
      const [month, data] = sorted[i]
      const prevExpenses = i > 0 ? sorted[i - 1][1].expenses : null
      const change = prevExpenses !== null && prevExpenses > 0
        ? ((data.expenses - prevExpenses) / prevExpenses) * 100
        : null
      trends.push({ month, expenses: data.expenses, change })
    }
    return trends
  }, [stats.monthMap])

  // 4. Media Giornaliera di Spesa
  const dailyAvg = useMemo(() => {
    const dates = transactions.map((t) => t.date).filter(Boolean).sort()
    if (dates.length === 0) return 0
    const first = new Date(dates[0])
    const last = new Date(dates[dates.length - 1])
    const days = Math.max(1, Math.round((last.getTime() - first.getTime()) / 86400000) + 1)
    return stats.expenses / days
  }, [transactions, stats.expenses])

  // 5. Rapporto Entrate/Uscite
  const spendingRatio = useMemo(() => {
    if (stats.income === 0) return 0
    return (stats.expenses / stats.income) * 100
  }, [stats.income, stats.expenses])

  // 6. Proiezione Fine Mese
  const projection = useMemo(() => {
    const sortedMonths = Array.from(stats.monthMap.keys()).sort()
    if (sortedMonths.length === 0) return null
    const lastMonth = sortedMonths[sortedMonths.length - 1]
    const [y, m] = lastMonth.split("-").map(Number)
    const totalDays = daysInMonth(y, m)

    // Get the days in this month that have transactions
    const monthTxs = transactions.filter(
      (t) => t.date.substring(0, 7) === lastMonth && isExpense(t)
    )
    const uniqueDays = new Set(monthTxs.map((t) => t.date))
    const daysWithData = uniqueDays.size || 1

    const currentSpend = monthTxs.reduce((s, t) => s + Math.abs(t.amount), 0)
    const dailyRate = currentSpend / daysWithData
    const projected = dailyRate * totalDays

    return {
      month: lastMonth,
      monthLabel: formatMonth(lastMonth),
      currentSpend,
      projected,
      totalDays,
      daysWithData,
    }
  }, [transactions, stats.monthMap])

  // 7. Split Contabilizzato vs Non Contabilizzato
  const statusSplit = useMemo(() => {
    const cardTxs = transactions.filter((t) => t.source === "credit_card" && t.status)
    if (cardTxs.length === 0) return null

    let contabilizzato = 0
    let nonContabilizzato = 0
    for (const tx of cardTxs) {
      const s = tx.status?.toLowerCase() || ""
      if (s.includes("non") || s.includes("pending") || s.includes("attesa")) {
        nonContabilizzato += Math.abs(tx.amount)
      } else {
        contabilizzato += Math.abs(tx.amount)
      }
    }
    if (contabilizzato === 0 && nonContabilizzato === 0) return null
    return { contabilizzato, nonContabilizzato }
  }, [transactions])

  // 8. Rimborsi (carta: importi negativi)
  const refunds = useMemo(() => {
    const items = transactions.filter(
      (t) => t.source === "credit_card" && t.amount < 0
    )
    const total = items.reduce((s, t) => s + Math.abs(t.amount), 0)
    return { items, total, count: items.length }
  }, [transactions])

  // 9. Confronto Banca vs Carta
  const sourceComparison = useMemo(() => {
    let bank = 0
    let card = 0
    for (const tx of transactions) {
      if (!isExpense(tx)) continue
      if (tx.source === "bank") bank += Math.abs(tx.amount)
      else card += Math.abs(tx.amount)
    }
    const total = bank + card
    return {
      bank,
      card,
      total,
      bankPct: total > 0 ? (bank / total) * 100 : 0,
      cardPct: total > 0 ? (card / total) * 100 : 0,
    }
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nessun dato disponibile.</p>
        <p className="text-sm mt-1">
          Carica i file del conto e della carta per vedere la panoramica.
        </p>
      </div>
    )
  }

  const ratioColor = spendingRatio < 70 ? "bg-green-500" : spendingRatio < 90 ? "bg-yellow-500" : "bg-red-500"
  const ratioTextColor = spendingRatio < 70 ? "text-green-500" : spendingRatio < 90 ? "text-yellow-500" : "text-red-500"

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Entrate"
          value={formatEUR(stats.income)}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          color="text-green-500"
        />
        <SummaryCard
          title="Uscite"
          value={formatEUR(stats.expenses)}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          color="text-red-500"
        />
        <SummaryCard
          title="Saldo Netto"
          value={formatEUR(stats.net)}
          icon={<Wallet className="h-5 w-5 text-primary" />}
          color={stats.net >= 0 ? "text-green-500" : "text-red-500"}
        />
        <SummaryCard
          title="Transazioni"
          value={String(transactions.length)}
          icon={<ArrowRightLeft className="h-5 w-5 text-primary" />}
          color="text-foreground"
        />
      </div>

      {/* Mini insight cards: Media Giornaliera + Rapporto Entrate/Uscite */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 4. Media Giornaliera di Spesa */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Media Giornaliera di Spesa</span>
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold font-mono text-red-500">{formatEUR2(dailyAvg)}</p>
            <p className="text-xs text-muted-foreground mt-1">al giorno nel periodo analizzato</p>
          </CardContent>
        </Card>

        {/* 5. Rapporto Entrate/Uscite */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Rapporto Entrate/Uscite</span>
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <p className={`text-2xl font-bold font-mono ${ratioTextColor}`}>
              {spendingRatio.toFixed(1)}%
            </p>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all ${ratioColor}`}
                style={{ width: `${Math.min(spendingRatio, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Spendi il {spendingRatio.toFixed(0)}% delle tue entrate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Bar Chart */}
        {stats.byMonth.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Andamento Mensile</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => formatEUR(Number(value))}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="Entrate" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Uscite" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Pie Chart */}
        {stats.byCategory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spese per Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {stats.byCategory.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(value: any) => formatEUR(Number(value))}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 3. Trend Spesa vs Mese Precedente */}
      {monthlyTrend.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trend Spesa Mensile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {monthlyTrend.map((item, i) => {
                const isLast = i === monthlyTrend.length - 1
                return (
                  <div
                    key={item.month}
                    className={`p-3 rounded-lg border ${isLast ? "border-primary bg-primary/5" : "border-border"}`}
                  >
                    <p className="text-xs text-muted-foreground">{formatMonth(item.month)}</p>
                    <p className="font-mono font-semibold text-sm">{formatEUR(item.expenses)}</p>
                    {item.change !== null && (
                      <div className={`flex items-center gap-1 text-xs mt-1 ${item.change > 0 ? "text-red-500" : "text-green-500"}`}>
                        {item.change > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{item.change > 0 ? "+" : ""}{item.change.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 6. Proiezione Fine Mese */}
      {projection && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Proiezione Fine Mese — {projection.monthLabel}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Spesa attuale</p>
                <p className="text-xl font-bold font-mono text-foreground">
                  {formatEUR(projection.currentSpend)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {projection.daysWithData} giorni su {projection.totalDays}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Proiezione a fine mese</p>
                <p className="text-xl font-bold font-mono text-orange-500">
                  {formatEUR(projection.projected)}
                </p>
                <p className="text-xs text-muted-foreground">
                  media {formatEUR2(projection.currentSpend / projection.daysWithData)}/giorno
                </p>
              </div>
              <div className="flex-1">
                <div className="w-full bg-muted rounded-full h-3 mt-2">
                  <div
                    className="h-3 rounded-full bg-primary transition-all"
                    style={{
                      width: `${Math.min((projection.currentSpend / projection.projected) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {((projection.currentSpend / projection.projected) * 100).toFixed(0)}% della proiezione
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 1. Top 10 Esercenti */}
      {topMerchants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="h-4 w-4" />
              Top 10 Esercenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topMerchants.map((m, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm truncate max-w-[60%] capitalize">{m.name}</span>
                    <span className="font-mono text-sm font-semibold">{formatEUR(m.total)}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${m.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Spese Ricorrenti */}
      {recurring.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Spese Ricorrenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left py-2 pr-4">Descrizione</th>
                    <th className="text-right py-2 px-4">Mesi</th>
                    <th className="text-right py-2 px-4">Media</th>
                    <th className="text-right py-2 pl-4">Annualizzato</th>
                  </tr>
                </thead>
                <tbody>
                  {recurring.slice(0, 15).map((r, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-2 pr-4 capitalize truncate max-w-[200px]">{r.name}</td>
                      <td className="py-2 px-4 text-right font-mono">{r.frequency}</td>
                      <td className="py-2 px-4 text-right font-mono">{formatEUR2(r.avg)}</td>
                      <td className="py-2 pl-4 text-right font-mono font-semibold text-red-500">
                        {formatEUR(r.annualized)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bottom section: side by side cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 9. Confronto Banca vs Carta */}
        {sourceComparison.total > 0 && sourceComparison.bank > 0 && sourceComparison.card > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Confronto Banca vs Carta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Banca</span>
                    </div>
                    <span className="font-mono text-sm">
                      {formatEUR(sourceComparison.bank)} ({sourceComparison.bankPct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${sourceComparison.bankPct}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Carta</span>
                    </div>
                    <span className="font-mono text-sm">
                      {formatEUR(sourceComparison.card)} ({sourceComparison.cardPct.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="h-3 rounded-full bg-purple-500 transition-all"
                      style={{ width: `${sourceComparison.cardPct}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7. Split Contabilizzato vs Non Contabilizzato */}
        {statusSplit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contabilizzato vs Non Contabilizzato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Contabilizzato</p>
                  <p className="text-xl font-bold font-mono text-green-500">
                    {formatEUR(statusSplit.contabilizzato)}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-muted-foreground mb-1">Non Contabilizzato</p>
                  <p className="text-xl font-bold font-mono text-yellow-500">
                    {formatEUR(statusSplit.nonContabilizzato)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 8. Rimborsi */}
        {refunds.count > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Undo2 className="h-4 w-4" />
                Rimborsi Carta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Totale rimborsi</p>
                  <p className="text-xl font-bold font-mono text-green-500">
                    {formatEUR(refunds.total)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Numero</p>
                  <p className="text-xl font-bold font-mono text-foreground">{refunds.count}</p>
                </div>
              </div>
              {refunds.items.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {refunds.items.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between text-sm border-b border-border/50 pb-1">
                      <div>
                        <span className="truncate block max-w-[250px]">{tx.description}</span>
                        <span className="text-xs text-muted-foreground">{tx.date}</span>
                      </div>
                      <span className="font-mono text-green-500 font-semibold">
                        +{formatEUR2(Math.abs(tx.amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          {icon}
        </div>
        <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function formatMonth(ym: string): string {
  const months = [
    "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
    "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
  ]
  const [y, m] = ym.split("-")
  const idx = parseInt(m, 10) - 1
  return `${months[idx] || m} ${y}`
}
