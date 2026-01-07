/**
 * Utility functions for date handling and calculations
 */

import { Transaction, TransactionType, MonthlySummary, CategorySummary } from '@/types'
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns'

/**
 * Filter transactions by month and year
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  year: number,
  month: number
): Transaction[] {
  return transactions.filter(transaction => {
    const transactionDate = parseISO(transaction.date)
    return (
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === month
    )
  })
}

/**
 * Calculate monthly summary (excludes transfers)
 */
export function calculateMonthlySummary(transactions: Transaction[]): MonthlySummary {
  return transactions.reduce(
    (summary, transaction) => {
      // Exclude transfers from income/expense calculations
      if (transaction.type === 'income') {
        summary.income += transaction.amount
      } else if (transaction.type === 'expense') {
        summary.expenses += transaction.amount
      }
      // Transfers are ignored in monthly summary
      return summary
    },
    { income: 0, expenses: 0, balance: 0 }
  )
}

/**
 * Calculate category summaries (excludes transfers)
 */
export function calculateCategorySummaries(transactions: Transaction[]): CategorySummary[] {
  const categoryMap = new Map<string, { amount: number; type: TransactionType }>()
  
  transactions.forEach(transaction => {
    // Exclude transfers from category summaries
    if (transaction.type === 'transfer') return
    
    const existing = categoryMap.get(transaction.category) || { amount: 0, type: transaction.type }
    categoryMap.set(transaction.category, {
      amount: existing.amount + transaction.amount,
      type: transaction.type,
    })
  })
  
  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    amount: data.amount,
    type: data.type,
  }))
}

/**
 * Format currency (Sri Lankan Rupees)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date for display
 */
export function formatDate(date: string): string {
  return format(parseISO(date), 'MMM dd, yyyy')
}

/**
 * Get current month start and end dates
 */
export function getCurrentMonthDates() {
  const now = new Date()
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
    year: now.getFullYear(),
    month: now.getMonth(),
  }
}

/**
 * Calculate credit card used amount and available credit
 * For credit cards: used = expenses - income (payments) + transfers out - transfers in
 * Available = credit limit - used
 */
export function calculateCreditCardInfo(accountId: string, transactions: Transaction[], creditLimit: number): {
  used: number
  available: number
  creditLimit: number
} {
  let used = 0
  
  // Expenses charged to this credit card (increases used)
  const expenses = transactions.filter(
    t => t.accountId === accountId && t.type === 'expense'
  )
  expenses.forEach(t => used += t.amount)
  
  // Income (payments) to this credit card (decreases used)
  const payments = transactions.filter(
    t => t.accountId === accountId && t.type === 'income'
  )
  payments.forEach(t => used -= t.amount)
  
  // Transfers out from this credit card (increases used)
  const transfersOut = transactions.filter(
    t => t.accountId === accountId && t.type === 'transfer' && t.toAccountId
  )
  transfersOut.forEach(t => used += t.amount)
  
  // Transfers in to this credit card (decreases used)
  const transfersIn = transactions.filter(
    t => t.type === 'transfer' && t.toAccountId === accountId
  )
  transfersIn.forEach(t => used -= t.amount)
  
  // Ensure used doesn't go negative (overpayment scenario)
  used = Math.max(0, used)
  
  const available = Math.max(0, creditLimit - used)
  
  return {
    used,
    available,
    creditLimit,
  }
}