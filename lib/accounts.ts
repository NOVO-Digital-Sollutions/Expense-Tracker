/**
 * Account storage helper functions for CRUD operations
 */

import { Account } from '@/types'

const STORAGE_KEY = 'novo_expense_tracker_accounts'

/**
 * Get all accounts from localStorage
 */
export function getAccounts(): Account[] {
  if (typeof window === 'undefined') return []
  
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading accounts from localStorage:', error)
    return []
  }
}

/**
 * Save all accounts to localStorage
 */
export function saveAccounts(accounts: Account[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
  } catch (error) {
    console.error('Error saving accounts to localStorage:', error)
  }
}

/**
 * Add a new account
 */
export function addAccount(account: Omit<Account, 'id' | 'createdAt' | 'initialBalance'> & { initialBalance?: number }): Account {
  const accounts = getAccounts()
  const initialBalance = account.initialBalance ?? account.balance ?? 0
  const newAccount: Account = {
    ...account,
    balance: initialBalance,
    initialBalance: initialBalance,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  }
  accounts.push(newAccount)
  saveAccounts(accounts)
  return newAccount
}

/**
 * Update an existing account
 */
export function updateAccount(id: string, updates: Partial<Omit<Account, 'id' | 'createdAt'>>): Account | null {
  const accounts = getAccounts()
  const index = accounts.findIndex(a => a.id === id)
  
  if (index === -1) return null
  
  accounts[index] = { ...accounts[index], ...updates }
  saveAccounts(accounts)
  return accounts[index]
}

/**
 * Delete an account
 */
export function deleteAccount(id: string): boolean {
  const accounts = getAccounts()
  const filtered = accounts.filter(a => a.id !== id)
  
  if (filtered.length === accounts.length) return false
  
  saveAccounts(filtered)
  return true
}

/**
 * Get account by ID
 */
export function getAccountById(id: string): Account | null {
  const accounts = getAccounts()
  return accounts.find(a => a.id === id) || null
}