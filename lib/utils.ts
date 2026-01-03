/**
 * Utility functions for date handling and calculations
 */

import { Transaction, MonthlySummary, CategorySummary } from '@/types'
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