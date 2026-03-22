import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Search } from "lucide-react"
import type { Transaction } from "@/types/Transaction"

interface TransactionTableProps {
  transactions: Transaction[]
}

type SortKey = "date" | "description" | "amount" | "category"
type SortDir = "asc" | "desc"

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(amount)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "-"
  const parts = dateStr.split("-")
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return dateStr
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = transactions

    if (q) {
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.category?.toLowerCase().includes(q)) ||
          t.date.includes(q),
      )
    }

    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "date":
          cmp = a.date.localeCompare(b.date)
          break
        case "description":
          cmp = a.description.localeCompare(b.description)
          break
        case "amount":
          cmp = a.amount - b.amount
          break
        case "category":
          cmp = (a.category || "").localeCompare(b.category || "")
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [transactions, search, sortKey, sortDir])

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Nessuna transazione caricata.</p>
        <p className="text-sm mt-1">Carica un file per visualizzare i dati.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca transazioni..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("date")}
              >
                <span className="inline-flex items-center gap-1">
                  Data <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("description")}
              >
                <span className="inline-flex items-center gap-1">
                  Descrizione <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => toggleSort("category")}
              >
                <span className="inline-flex items-center gap-1">
                  Categoria <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
              <TableHead
                className="cursor-pointer select-none text-right"
                onClick={() => toggleSort("amount")}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Importo <ArrowUpDown className="h-3 w-3" />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-mono text-sm whitespace-nowrap">
                  {formatDate(tx.date)}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {tx.description}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {tx.category || "Altro"}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-mono font-medium whitespace-nowrap ${
                    tx.amount >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {formatAmount(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground text-right">
        {filtered.length} di {transactions.length} transazioni
      </p>
    </div>
  )
}
