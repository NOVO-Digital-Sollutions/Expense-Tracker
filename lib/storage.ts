/**
 * localStorage helper functions for CRUD operations
 */

import { Transaction } from '@/types'
import { getAccountById, updateAccount } from './accounts'

const STORAGE_KEY = 'novo_expense_tracker_transactions'

/**
 * Get all transactions from localStorage
 */
export function getTransactions(): Transaction[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const transactions = JSON.parse(data)
    // Migrate old transactions without accountId
    const migrated = transactions.map((t: Transaction) => {
      if (!t.accountId) {
        // For backward compatibility, assign to first account or skip
        // We'll handle this in the UI by requiring account selection
        return t
      }
      return t
    })
    return migrated
  } catch (error) {
    console.error('Error reading transactions from localStorage:', error)
    return []
  }
}

/**
 * Save all transactions to localStorage
 */
export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch (error) {
    console.error('Error saving transactions to localStorage:', error)
  }
}

/**
 * Recalculate account balance from all transactions
 * Balance = initialBalance + (sum of income - sum of expenses + transfers in - transfers out)
 */
function recalculateAccountBalance(accountId: string): void {
  const account = getAccountById(accountId)
  if (!account) return
  
  const transactions = getTransactions()
  
  // Calculate balance change from transactions
  let balanceChange = 0
  
  // Transactions from this account (income adds, expense subtracts, transfer out subtracts)
  const outgoingTransactions = transactions.filter(t => t.accountId === accountId)
  outgoingTransactions.forEach(transaction => {
    if (transaction.type === 'income') {
      balanceChange += transaction.amount
    } else if (transaction.type === 'expense') {
      balanceChange -= transaction.amount
    } else if (transaction.type === 'transfer' && transaction.toAccountId) {
      balanceChange -= transaction.amount
    }
  })
  
  // Transfers to this account (transfer in adds)
  const incomingTransfers = transactions.filter(t => t.type === 'transfer' && t.toAccountId === accountId)
  incomingTransfers.forEach(transaction => {
    balanceChange += transaction.amount
  })
  
  // Current balance = initial balance + transaction changes
  const currentBalance = (account.initialBalance || 0) + balanceChange
  updateAccount(accountId, { balance: currentBalance })
}

/**
 * Add a new transaction
 */
export function addTransaction(transaction: Omit<Transaction, 'id'>): Transaction {
  const transactions = getTransactions()
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  }
  transactions.push(newTransaction)
  saveTransactions(transactions)
  
  // Recalculate account balances (both accounts if it's a transfer)
  if (newTransaction.accountId) {
    recalculateAccountBalance(newTransaction.accountId)
  }
  if (newTransaction.toAccountId) {
    recalculateAccountBalance(newTransaction.toAccountId)
  }
  
  return newTransaction
}

/**
 * Update an existing transaction
 */
export function updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id'>>): Transaction | null {
  const transactions = getTransactions()
  const index = transactions.findIndex(t => t.id === id)
  
  if (index === -1) return null
  
  const oldTransaction = transactions[index]
  transactions[index] = { ...transactions[index], ...updates }
  const newTransaction = transactions[index]
  saveTransactions(transactions)
  
  // Recalculate account balances (old and new account if changed)
  const accountsToUpdate = new Set<string>()
  if (oldTransaction.accountId) {
    accountsToUpdate.add(oldTransaction.accountId)
  }
  if (newTransaction.accountId) {
    accountsToUpdate.add(newTransaction.accountId)
  }
  
  accountsToUpdate.forEach(accountId => {
    recalculateAccountBalance(accountId)
  })
  
  return newTransaction
}

/**
 * Delete a transaction
 */
export function deleteTransaction(id: string): boolean {
  const transactions = getTransactions()
  const transactionToDelete = transactions.find(t => t.id === id)
  const filtered = transactions.filter(t => t.id !== id)
  
  if (filtered.length === transactions.length) return false
  
  saveTransactions(filtered)
  
  // Recalculate account balances (both accounts if it's a transfer)
  if (transactionToDelete?.accountId) {
    recalculateAccountBalance(transactionToDelete.accountId)
  }
  if (transactionToDelete?.toAccountId) {
    recalculateAccountBalance(transactionToDelete.toAccountId)
  }
  
  return true
}

/**
 * Get transaction by ID
 */
export function getTransactionById(id: string): Transaction | null {
  const transactions = getTransactions()
  return transactions.find(t => t.id === id) || null
}