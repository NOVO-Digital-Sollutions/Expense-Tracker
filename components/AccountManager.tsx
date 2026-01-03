'use client'

/**
 * Account Manager Component - List and manage accounts
 */

import { useState, useEffect } from 'react'
import { Account } from '@/types'
import { getAccounts, deleteAccount } from '@/lib/accounts'
import { formatCurrency } from '@/lib/utils'
import { Button } from './Button'
import { Modal } from './Modal'
import { AccountForm } from './AccountForm'
import { Edit, Trash2, Wallet, CreditCard, Plus, Banknote } from 'lucide-react'

interface AccountManagerProps {
  isOpen: boolean
  onClose: () => void
  onAccountChange: () => void
}

export function AccountManager({ isOpen, onClose, onAccountChange }: AccountManagerProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadAccounts()
    }
  }, [isOpen])

  const loadAccounts = () => {
    setAccounts(getAccounts())
  }

  const handleAddAccount = () => {
    setSelectedAccount(null)
    setIsFormOpen(true)
  }

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setIsFormOpen(true)
  }

  const handleDeleteAccount = (id: string) => {
    if (confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      deleteAccount(id)
      loadAccounts()
      onAccountChange()
    }
  }

  const handleFormSuccess = () => {
    setIsFormOpen(false)
    setSelectedAccount(null)
    loadAccounts()
    onAccountChange()
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setSelectedAccount(null)
  }

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Manage Accounts">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Balance: <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(totalBalance)}</span>
              </p>
            </div>
            <Button variant="primary" onClick={handleAddAccount} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Account
            </Button>
          </div>

          {accounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p>No accounts yet</p>
              <p className="text-sm mt-2">Create your first account to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map(account => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      account.type === 'wallet'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : account.type === 'bank'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    }`}>
                      {account.type === 'wallet' ? (
                        <Wallet className="w-5 h-5" />
                      ) : account.type === 'bank' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <Banknote className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{account.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className={`font-semibold ${
                        account.balance >= 0
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAccount(account)}
                        className="p-1.5"
                        aria-label="Edit account"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                        className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Delete account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={handleFormCancel}
        title={selectedAccount ? 'Edit Account' : 'Add Account'}
      >
        <AccountForm
          account={selectedAccount}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  )
}