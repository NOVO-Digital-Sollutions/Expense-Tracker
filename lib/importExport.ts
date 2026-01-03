/**
 * Import/Export functionality for syncing data across devices
 */

import { Transaction, Account } from '@/types'
import { getTransactions, saveTransactions } from './storage'
import { getAccounts, saveAccounts, updateAccount } from './accounts'

export interface ExportData {
  version: string
  exportDate: string
  accounts: Account[]
  transactions: Transaction[]
}

/**
 * Export all data (accounts and transactions) as JSON
 */
export function exportData(): ExportData {
  const accounts = getAccounts()
  const transactions = getTransactions()

  const exportData: ExportData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    accounts,
    transactions,
  }

  return exportData
}

/**
 * Download data as JSON file
 */
export function downloadExport(): void {
  const data = exportData()
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `novo-expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Validate imported data structure
 */
export function validateImportData(data: any): data is ExportData {
  if (!data || typeof data !== 'object') {
    return false
  }

  // Check for required fields
  if (!data.accounts || !Array.isArray(data.accounts)) {
    return false
  }

  if (!data.transactions || !Array.isArray(data.transactions)) {
    return false
  }

  // Validate accounts structure
  for (const account of data.accounts) {
    if (
      !account.id ||
      !account.name ||
      typeof account.balance !== 'number' ||
      typeof account.initialBalance !== 'number' ||
      !account.type ||
      !account.createdAt
    ) {
      return false
    }
  }

  // Validate transactions structure
  for (const transaction of data.transactions) {
    if (
      !transaction.id ||
      !transaction.type ||
      typeof transaction.amount !== 'number' ||
      !transaction.category ||
      !transaction.description ||
      !transaction.date ||
      !transaction.accountId
    ) {
      return false
    }
  }

  return true
}

/**
 * Import data from JSON
 * @param data - The data to import
 * @param merge - If true, merge with existing data. If false, replace all data.
 */
export function importData(data: ExportData, merge: boolean = false): {
  success: boolean
  message: string
  accountsCount: number
  transactionsCount: number
} {
  try {
    // Validate data structure
    if (!validateImportData(data)) {
      return {
        success: false,
        message: 'Invalid data format. Please ensure you are importing a valid backup file.',
        accountsCount: 0,
        transactionsCount: 0,
      }
    }

    if (merge) {
      // Merge: combine existing and imported data
      const existingAccounts = getAccounts()
      const existingTransactions = getTransactions()

      // Create a map of existing account IDs
      const existingAccountIds = new Set(existingAccounts.map(a => a.id))

      // Merge accounts (keep existing if ID matches, add new ones)
      const mergedAccounts = [...existingAccounts]
      for (const account of data.accounts) {
        if (!existingAccountIds.has(account.id)) {
          mergedAccounts.push(account)
        }
      }

      // Merge transactions (combine all, duplicates will be handled by IDs)
      const mergedTransactions = [...existingTransactions, ...data.transactions]

      // Remove duplicate transactions based on ID
      const uniqueTransactions = Array.from(
        new Map(mergedTransactions.map(t => [t.id, t])).values()
      )

      saveAccounts(mergedAccounts)
      saveTransactions(uniqueTransactions)

      // Recalculate all account balances
      mergedAccounts.forEach(account => {
        const transactions = getTransactions()
        let balanceChange = 0
        
        // Transactions from this account
        const outgoingTransactions = transactions.filter(t => t.accountId === account.id)
        outgoingTransactions.forEach(transaction => {
          if (transaction.type === 'income') {
            balanceChange += transaction.amount
          } else if (transaction.type === 'expense') {
            balanceChange -= transaction.amount
          } else if (transaction.type === 'transfer' && transaction.toAccountId) {
            balanceChange -= transaction.amount
          }
        })
        
        // Transfers to this account
        const incomingTransfers = transactions.filter(t => t.type === 'transfer' && t.toAccountId === account.id)
        incomingTransfers.forEach(transaction => {
          balanceChange += transaction.amount
        })
        
        const currentBalance = (account.initialBalance || 0) + balanceChange
        updateAccount(account.id, { balance: currentBalance })
      })

      return {
        success: true,
        message: `Successfully merged ${data.accounts.length} account(s) and ${data.transactions.length} transaction(s) with existing data.`,
        accountsCount: mergedAccounts.length,
        transactionsCount: uniqueTransactions.length,
      }
    } else {
      // Replace: clear existing data and import new data
      saveAccounts(data.accounts)
      saveTransactions(data.transactions)

      // Recalculate all account balances
      data.accounts.forEach(account => {
        const transactions = getTransactions()
        let balanceChange = 0
        
        // Transactions from this account
        const outgoingTransactions = transactions.filter(t => t.accountId === account.id)
        outgoingTransactions.forEach(transaction => {
          if (transaction.type === 'income') {
            balanceChange += transaction.amount
          } else if (transaction.type === 'expense') {
            balanceChange -= transaction.amount
          } else if (transaction.type === 'transfer' && transaction.toAccountId) {
            balanceChange -= transaction.amount
          }
        })
        
        // Transfers to this account
        const incomingTransfers = transactions.filter(t => t.type === 'transfer' && t.toAccountId === account.id)
        incomingTransfers.forEach(transaction => {
          balanceChange += transaction.amount
        })
        
        const currentBalance = (account.initialBalance || 0) + balanceChange
        updateAccount(account.id, { balance: currentBalance })
      })

      return {
        success: true,
        message: `Successfully imported ${data.accounts.length} account(s) and ${data.transactions.length} transaction(s).`,
        accountsCount: data.accounts.length,
        transactionsCount: data.transactions.length,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Error importing data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      accountsCount: 0,
      transactionsCount: 0,
    }
  }
}

/**
 * Read file and parse as JSON
 */
export function readImportFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const data = JSON.parse(text) as ExportData
        resolve(data)
      } catch (error) {
        reject(new Error('Failed to parse JSON file. Please ensure the file is valid JSON.'))
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file.'))
    }

    reader.readAsText(file)
  })
}
