'use client'

/**
 * Header Component with theme toggle
 */

import { Moon, Sun, Plus, Wallet } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { Button } from './Button'

interface HeaderProps {
  onAddTransaction: () => void
  onManageAccounts: () => void
}

export function Header({ onAddTransaction, onManageAccounts }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              NOVO Expense Tracker
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Offline-first expense management
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={onManageAccounts}
              className="flex items-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Accounts</span>
            </Button>
            
            <Button
              variant="primary"
              onClick={onAddTransaction}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Transaction</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}