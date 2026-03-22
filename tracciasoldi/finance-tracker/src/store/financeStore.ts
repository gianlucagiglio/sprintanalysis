import { create } from "zustand"
import type { Transaction } from "@/types/Transaction"
import { mergeTransactions } from "@/utils/transactionMerger"

interface FinanceState {
  bankTransactions: Transaction[]
  creditCardTransactions: Transaction[]
  addBankTransactions: (txs: Transaction[]) => void
  addCreditCardTransactions: (txs: Transaction[]) => void
  clearBank: () => void
  clearCreditCard: () => void
  clearAll: () => void
  allTransactions: () => Transaction[]
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  bankTransactions: [],
  creditCardTransactions: [],

  addBankTransactions: (txs) =>
    set((state) => ({ bankTransactions: [...state.bankTransactions, ...txs] })),

  addCreditCardTransactions: (txs) =>
    set((state) => ({ creditCardTransactions: [...state.creditCardTransactions, ...txs] })),

  clearBank: () => set({ bankTransactions: [] }),

  clearCreditCard: () => set({ creditCardTransactions: [] }),

  clearAll: () => set({ bankTransactions: [], creditCardTransactions: [] }),

  allTransactions: () =>
    mergeTransactions(get().bankTransactions, get().creditCardTransactions).transactions,
}))
