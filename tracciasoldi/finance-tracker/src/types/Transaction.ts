export type TransactionSource = "bank" | "credit_card"

export type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  category?: string
  source: TransactionSource
  status?: string
}
