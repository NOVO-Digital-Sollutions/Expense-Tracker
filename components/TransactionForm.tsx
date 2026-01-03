'use client'

/**
 * Transaction Form Component - Add/Edit transactions
 */

import { useState, useEffect } from 'react'
import { Transaction, TransactionType } from '@/types'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { addTransaction, updateTransaction } from '@/lib/storage'
import { getAccounts } from '@/lib/accounts'
import { formatCurrency } from '@/lib/utils'

interface TransactionFormProps {
  transaction?: Transaction | null
  onSuccess: () => void
  onCancel: () => void
}

const CATEGORIES = {
  income: [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'investment', label: 'Investment' },
    { value: 'gift', label: 'Gift' },
    { value: 'other', label: 'Other' },
  ],
  expense: [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'bills', label: 'Bills & Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health & Fitness' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ],
}

export function TransactionForm({ transaction, onSuccess, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction?.amount.toString() || '')
  const [category, setCategory] = useState(transaction?.category || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [accountId, setAccountId] = useState(transaction?.accountId || '')
  const [toAccountId, setToAccountId] = useState(transaction?.toAccountId || '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [accounts, setAccounts] = useState(getAccounts())

  useEffect(() => {
    setAccounts(getAccounts())
  }, [])

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setAmount(transaction.amount.toString())
      setCategory(transaction.category)
      setDescription(transaction.description)
      setDate(new Date(transaction.date).toISOString().split('T')[0])
      setAccountId(transaction.accountId || '')
      setToAccountId(transaction.toAccountId || '')
    } else {
      // Set first account as default if available
      if (accounts.length > 0 && !accountId) {
        setAccountId(accounts[0].id)
      }
    }
  }, [transaction, accounts])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!accountId) {
      newErrors.accountId = 'Please select an account'
    }

    if (type === 'transfer') {
      if (!toAccountId) {
        newErrors.toAccountId = 'Please select destination account'
      }
      if (accountId === toAccountId) {
        newErrors.toAccountId = 'Source and destination accounts must be different'
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    } else {
      // Check for negative balance on expense or transfer
      if ((type === 'expense' || type === 'transfer') && accountId) {
        const selectedAccount = accounts.find(a => a.id === accountId)
        if (selectedAccount && selectedAccount.balance - parseFloat(amount) < 0) {
          const proceed = confirm(
            `This ${type === 'transfer' ? 'transfer' : 'expense'} will result in a negative balance (${formatCurrency(selectedAccount.balance - parseFloat(amount))}). Do you want to continue?`
          )
          if (!proceed) {
            return false
          }
        }
      }
    }

    if (type !== 'transfer' && !category) {
      newErrors.category = 'Please select a category'
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const transactionData = {
      type,
      amount: parseFloat(amount),
      category: type === 'transfer' ? 'transfer' : category,
      description: description.trim(),
      date: new Date(date).toISOString(),
      accountId,
      ...(type === 'transfer' && toAccountId ? { toAccountId } : {}),
    }

    if (transaction) {
      updateTransaction(transaction.id, transactionData)
    } else {
      addTransaction(transactionData)
    }

    onSuccess()
  }

  const selectedAccount = accounts.find(a => a.id === accountId)
  const selectedToAccount = accounts.find(a => a.id === toAccountId)
  const accountOptions = accounts.map(account => ({
    value: account.id,
    label: `${account.name} (${formatCurrency(account.balance)})`,
  }))

  if (accounts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No accounts available</p>
        <p className="text-sm mt-2">Please create an account first</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Account"
        value={accountId}
        onChange={e => setAccountId(e.target.value)}
        options={accountOptions}
        error={errors.accountId}
      />

      {selectedAccount && (
        <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">
          Current balance: <span className="font-medium">{formatCurrency(selectedAccount.balance)}</span>
        </p>
      )}

      <Select
        label="Type"
        value={type}
        onChange={e => {
          setType(e.target.value as TransactionType)
          setCategory('') // Reset category when type changes
          if (e.target.value !== 'transfer') {
            setToAccountId('') // Clear toAccountId when not transfer
          }
        }}
        options={[
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' },
          { value: 'transfer', label: 'Transfer' },
        ]}
        error={errors.type}
      />

      {type === 'transfer' && (
        <>
          <Select
            label="To Account"
            value={toAccountId}
            onChange={e => setToAccountId(e.target.value)}
            options={accountOptions.filter(opt => opt.value !== accountId)}
            error={errors.toAccountId}
          />
          {selectedToAccount && (
            <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">
              Current balance: <span className="font-medium">{formatCurrency(selectedToAccount.balance)}</span>
            </p>
          )}
        </>
      )}

      {type !== 'transfer' && (
        <Select
          label="Category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          options={CATEGORIES[type]}
          error={errors.category}
        />
      )}

      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0.01"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        error={errors.amount}
        placeholder="0.00"
      />

      <Input
        label="Description"
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        error={errors.description}
        placeholder="Enter description"
      />

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        error={errors.date}
      />

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {transaction ? 'Update' : 'Add'} Transaction
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}