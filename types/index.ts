/**
 * Transaction types and interfaces
 */

export type TransactionType = 'income' | 'expense' | 'transfer'
export type AccountType = 'wallet' | 'bank' | 'credit'

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number // Current balance (initialBalance + transaction changes)
  initialBalance: number // Balance at account creation
  createdAt: string // ISO date string
}

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string // ISO date string
  accountId: string // Reference to Account (source account for transfers)
  toAccountId?: string // Destination account for transfers
}

export interface MonthlySummary {
  income: number
  expenses: number
  balance: number
}

export interface CategorySummary {
  category: string
  amount: number
  type: TransactionType
}