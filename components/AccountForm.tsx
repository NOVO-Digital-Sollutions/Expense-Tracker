'use client'

/**
 * Account Form Component - Create/Edit accounts
 */

import { useState, useEffect } from 'react'
import { Account, AccountType } from '@/types'
import { Input } from './Input'
import { Select } from './Select'
import { Button } from './Button'
import { addAccount, updateAccount } from '@/lib/accounts'

interface AccountFormProps {
  account?: Account | null
  onSuccess: () => void
  onCancel: () => void
}

export function AccountForm({ account, onSuccess, onCancel }: AccountFormProps) {
  const [name, setName] = useState(account?.name || '')
  const [type, setType] = useState<AccountType>(account?.type || 'wallet')
  const [initialBalance, setInitialBalance] = useState(account?.initialBalance?.toString() || account?.balance?.toString() || '0')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (account) {
      setName(account.name)
      setType(account.type)
      setInitialBalance(account.initialBalance?.toString() || account.balance?.toString() || '0')
    }
  }, [account])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Account name is required'
    }

    const balance = parseFloat(initialBalance)
    if (isNaN(balance)) {
      newErrors.initialBalance = 'Initial balance must be a valid number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const balanceValue = parseFloat(initialBalance)

    if (account) {
      // For updates, we preserve initialBalance but update balance
      updateAccount(account.id, {
        name: name.trim(),
        type,
        // Note: balance updates happen through transactions
        // We don't update initialBalance on edit
      })
    } else {
      addAccount({
        name: name.trim(),
        type,
        balance: balanceValue,
        initialBalance: balanceValue,
      })
    }

    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Account Name"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        error={errors.name}
        placeholder="e.g., Wallet, Bank Account 1"
      />

      <Select
        label="Account Type"
        value={type}
        onChange={e => setType(e.target.value as AccountType)}
        options={[
          { value: 'wallet', label: 'Wallet' },
          { value: 'bank', label: 'Bank Account' },
          { value: 'credit', label: 'Credit Card' },
        ]}
        error={errors.type}
      />

      <Input
        label={account ? 'Current Balance' : 'Initial Balance'}
        type="number"
        step="0.01"
        value={initialBalance}
        onChange={e => setInitialBalance(e.target.value)}
        error={errors.initialBalance}
        placeholder="0.00"
        disabled={!!account} // Don't allow editing balance for existing accounts
      />

      {account && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Balance is automatically updated by transactions. To change the balance, add a transaction.
        </p>
      )}

      <div className="flex gap-3 pt-4">
        <Button type="submit" variant="primary" className="flex-1">
          {account ? 'Update' : 'Create'} Account
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}