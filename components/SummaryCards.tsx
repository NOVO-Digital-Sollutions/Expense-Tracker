'use client'

/**
 * Summary Cards Component - Display income, expenses, balance, and account balances
 */

import { TrendingUp, TrendingDown, Wallet, CreditCard, Banknote } from 'lucide-react'
import { MonthlySummary, Account } from '@/types'
import { formatCurrency, calculateCreditCardInfo } from '@/lib/utils'
import { getTransactions } from '@/lib/storage'

interface SummaryCardsProps {
  summary: MonthlySummary
  accounts: Account[]
  totalBalance: number
}

export function SummaryCards({ summary, accounts, totalBalance }: SummaryCardsProps) {
  const { income, expenses, balance } = summary

  const cards = [
    {
      title: 'Total Income',
      amount: income,
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Total Expenses',
      amount: expenses,
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Monthly Balance',
      amount: balance,
      icon: Wallet,
      color: balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400',
      bgColor: balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      title: 'Total Balance (All Accounts)',
      amount: totalBalance,
      icon: Wallet,
      color: totalBalance >= 0 ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400',
      bgColor: totalBalance >= 0 ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${card.color}`}>
                    {formatCurrency(card.amount)}
                  </p>
                </div>
                <div className={`${card.color} bg-white dark:bg-gray-800 rounded-full p-3`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {accounts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Account Balances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map(account => {
              const getAccountStyles = () => {
                switch (account.type) {
                  case 'wallet':
                    return {
                      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
                      iconColor: 'text-blue-600 dark:text-blue-400',
                      cardBg: 'bg-blue-50/50 dark:bg-blue-950/20',
                      borderColor: 'border-blue-200 dark:border-blue-800',
                    }
                  case 'bank':
                    return {
                      iconBg: 'bg-green-100 dark:bg-green-900/30',
                      iconColor: 'text-green-600 dark:text-green-400',
                      cardBg: 'bg-green-50/50 dark:bg-green-950/20',
                      borderColor: 'border-green-200 dark:border-green-800',
                    }
                  case 'credit':
                    return {
                      iconBg: 'bg-orange-100 dark:bg-orange-900/30',
                      iconColor: 'text-orange-600 dark:text-orange-400',
                      cardBg: 'bg-orange-50/50 dark:bg-orange-950/20',
                      borderColor: 'border-orange-200 dark:border-orange-800',
                    }
                  default:
                    return {
                      iconBg: 'bg-gray-100 dark:bg-gray-700',
                      iconColor: 'text-gray-600 dark:text-gray-400',
                      cardBg: 'bg-gray-50 dark:bg-gray-700/50',
                      borderColor: 'border-gray-200 dark:border-gray-600',
                    }
                }
              }

              const styles = getAccountStyles()
              const IconComponent = 
                account.type === 'wallet' ? Wallet :
                account.type === 'bank' ? CreditCard :
                Banknote

              // For credit cards, show credit limit and used amount
              const isCreditCard = account.type === 'credit'
              const allTransactions = getTransactions()
              const creditCardInfo = isCreditCard
                ? calculateCreditCardInfo(account.id, allTransactions, account.initialBalance)
                : null

              return (
                <div
                  key={account.id}
                  className={`group relative p-5 ${styles.cardBg} rounded-xl border-2 ${styles.borderColor} transition-all hover:shadow-md hover:scale-[1.02]`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`${styles.iconBg} ${styles.iconColor} p-2.5 rounded-xl`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                          {account.name}
                        </p>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-0.5">
                          {account.type}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isCreditCard && creditCardInfo ? (
                    <div className="mt-2 space-y-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Credit Limit</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                          {formatCurrency(creditCardInfo.creditLimit)}
                        </p>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Used</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                          {formatCurrency(creditCardInfo.used)}
                        </p>
                      </div>
                      <div className="pt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available</p>
                        <p className={`text-lg font-semibold ${
                          creditCardInfo.available > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formatCurrency(creditCardInfo.available)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className={`text-2xl font-bold ${
                        account.balance >= 0
                          ? 'text-gray-900 dark:text-gray-100'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}