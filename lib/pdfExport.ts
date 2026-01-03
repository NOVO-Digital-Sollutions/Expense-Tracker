/**
 * PDF Export functionality using jsPDF and jsPDF-AutoTable
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Transaction, Account } from '@/types'
import { formatCurrency, formatDate } from './utils'
import { format } from 'date-fns'

export function exportToPDF(
  transactions: Transaction[],
  summary: { income: number; expenses: number; balance: number },
  month: number,
  year: number,
  accounts: Account[]
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Header
  doc.setFontSize(20)
  doc.text('NOVO Expense Tracker', pageWidth / 2, 20, { align: 'center' })
  
  doc.setFontSize(12)
  doc.text(
    `Report for ${format(new Date(year, month, 1), 'MMMM yyyy')}`,
    pageWidth / 2,
    30,
    { align: 'center' }
  )

  let currentY = 45

  // Account Summary Section
  if (accounts.length > 0) {
    doc.setFontSize(14)
    doc.text('Account Summary', 14, currentY)
    currentY += 10

    doc.setFontSize(10)
    const accountData = accounts.map(account => [
      account.name,
      account.type.charAt(0).toUpperCase() + account.type.slice(1),
      formatCurrency(account.balance),
    ])

    autoTable(doc, {
      startY: currentY,
      head: [['Account', 'Type', 'Balance']],
      body: accountData,
      theme: 'striped',
      headStyles: {
        fillColor: [139, 92, 246], // purple
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        2: { halign: 'right' },
      },
    })

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    currentY = (doc as any).lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text(`Total Balance: ${formatCurrency(totalBalance)}`, 14, currentY)
    doc.setFont(undefined, 'normal')
    currentY += 15
  }

  // Monthly Summary Section
  doc.setFontSize(14)
  doc.text('Monthly Summary', 14, currentY)
  currentY += 10
  
  doc.setFontSize(10)
  doc.text(`Total Income: ${formatCurrency(summary.income)}`, 14, currentY)
  currentY += 7
  doc.text(`Total Expenses: ${formatCurrency(summary.expenses)}`, 14, currentY)
  currentY += 7
  doc.text(`Monthly Balance: ${formatCurrency(summary.balance)}`, 14, currentY)
  currentY += 15

  // Transactions Table
  const getAccountName = (accountId: string): string => {
    const account = accounts.find(a => a.id === accountId)
    return account?.name || 'Unknown Account'
  }

  const getTransferDisplay = (transaction: Transaction): string => {
    if (transaction.type === 'transfer' && transaction.toAccountId) {
      const toAccount = accounts.find(a => a.id === transaction.toAccountId)
      return `${getAccountName(transaction.accountId)} → ${toAccount?.name || 'Unknown'}`
    }
    return getAccountName(transaction.accountId)
  }

  const tableData = transactions.map(transaction => [
    formatDate(transaction.date),
    transaction.type,
    transaction.type === 'transfer' ? getTransferDisplay(transaction) : getAccountName(transaction.accountId),
    transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1),
    transaction.description,
    transaction.type === 'transfer' 
      ? formatCurrency(transaction.amount)
      : `${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}`,
  ])

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Type', 'Account', 'Category', 'Description', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246], // blue
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      5: { halign: 'right' },
    },
  })

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || currentY
  doc.setFontSize(8)
  doc.text(
    `Generated on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  // Save the PDF
  const fileName = `expense-report-${format(new Date(year, month, 1), 'yyyy-MM')}.pdf`
  doc.save(fileName)
}