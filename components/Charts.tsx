'use client'

/**
 * Charts Component - Pie chart for categories and Bar chart for trends
 */

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CategorySummary, Transaction } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useMemo } from 'react'

interface ChartsProps {
  categorySummaries: CategorySummary[]
  transactions: Transaction[]
  currentYear: number
  currentMonth: number
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
]

export function Charts({ categorySummaries, transactions, currentYear, currentMonth }: ChartsProps) {
  // Prepare pie chart data (expenses only)
  const pieData = useMemo(() => {
    return categorySummaries
      .filter(item => item.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
      .map(item => ({
        name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
        value: item.amount,
      }))
  }, [categorySummaries])

  // Prepare bar chart data (last 6 months)
  const barData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date)
        return tDate.getFullYear() === date.getFullYear() && tDate.getMonth() === date.getMonth()
      })
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        Income: income,
        Expenses: expenses,
      })
    }
    return months
  }, [transactions, currentYear, currentMonth])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {payload[0].name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  if (pieData.length === 0 && barData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p>No data available for charts</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Bar Chart */}
      {barData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Income vs Expenses (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
              <XAxis dataKey="month" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}