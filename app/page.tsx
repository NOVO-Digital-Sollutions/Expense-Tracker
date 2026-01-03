'use client'

/**
 * Main Dashboard Page
 */

import { useState, useEffect, useMemo } from 'react'
import { Transaction, Account } from '@/types'
import { getTransactions } from '@/lib/storage'
import { getAccounts } from '@/lib/accounts'
import {
  filterTransactionsByMonth,
  calculateMonthlySummary,
  calculateCategorySummaries,
  getCurrentMonthDates,
} from '@/lib/utils'
import { exportToPDF } from '@/lib/pdfExport'
import { Header } from '@/components/Header'
import { MonthFilter } from '@/components/MonthFilter'
import { SummaryCards } from '@/components/SummaryCards'
import { Charts } from '@/components/Charts'
import { TransactionTable } from '@/components/TransactionTable'
import { Modal } from '@/components/Modal'
import { TransactionForm } from '@/components/TransactionForm'
import { AccountManager } from '@/components/AccountManager'
import { Button } from '@/components/Button'
import { Download } from 'lucide-react'

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAccountManagerOpen, setIsAccountManagerOpen] = useState(false)
  const { year, month } = getCurrentMonthDates()
  const [selectedYear, setSelectedYear] = useState(year)
  const [selectedMonth, setSelectedMonth] = useState(month)

  // Load data on mount
  useEffect(() => {
    loadTransactions()
    loadAccounts()
  }, [])

  const loadTransactions = () => {
    setTransactions(getTransactions())
  }

  const loadAccounts = () => {
    setAccounts(getAccounts())
  }

  // Filter transactions by selected month
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByMonth(transactions, selectedYear, selectedMonth)
  }, [transactions, selectedYear, selectedMonth])

  // Calculate summary and category data
  const summary = useMemo(() => {
    const monthlySummary = calculateMonthlySummary(filteredTransactions)
    monthlySummary.balance = monthlySummary.income - monthlySummary.expenses
    return monthlySummary
  }, [filteredTransactions])

  const categorySummaries = useMemo(() => {
    return calculateCategorySummaries(filteredTransactions)
  }, [filteredTransactions])

  const totalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.balance, 0)
  }, [accounts])

  const handleAddTransaction = () => {
    setSelectedTransaction(null)
    setIsModalOpen(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTransaction(null)
  }

  const handleModalSuccess = () => {
    loadTransactions()
    loadAccounts() // Reload accounts to update balances
    handleModalClose()
  }

  const handleManageAccounts = () => {
    setIsAccountManagerOpen(true)
  }

  const handleAccountManagerClose = () => {
    setIsAccountManagerOpen(false)
  }

  const handleAccountChange = () => {
    loadAccounts()
    loadTransactions() // Reload transactions in case account was deleted
  }

  const handleExportPDF = () => {
    exportToPDF(filteredTransactions, summary, selectedMonth, selectedYear, accounts)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onAddTransaction={handleAddTransaction} onManageAccounts={handleManageAccounts} />
      
      <main className="container mx-auto px-4 py-8">
        <MonthFilter
          year={selectedYear}
          month={selectedMonth}
          onMonthChange={(year, month) => {
            setSelectedYear(year)
            setSelectedMonth(month)
          }}
        />

        <SummaryCards summary={summary} accounts={accounts} totalBalance={totalBalance} />

        <Charts
          categorySummaries={categorySummaries}
          transactions={transactions}
          currentYear={selectedYear}
          currentMonth={selectedMonth}
        />

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Transactions
          </h2>
          {filteredTransactions.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportPDF}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
          )}
        </div>

        <TransactionTable
          transactions={filteredTransactions}
          onEdit={handleEditTransaction}
          onDelete={loadTransactions}
        />
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedTransaction ? 'Edit Transaction' : 'Add Transaction'}
      >
        <TransactionForm
          transaction={selectedTransaction}
          onSuccess={handleModalSuccess}
          onCancel={handleModalClose}
        />
      </Modal>

      <AccountManager
        isOpen={isAccountManagerOpen}
        onClose={handleAccountManagerClose}
        onAccountChange={handleAccountChange}
      />
    </div>
  )
}