'use client'

/**
 * Charts Component - Donut chart for categories and Bar chart for trends
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
  '#f97316', // orange
  '#6366f1', // indigo
]

export function Charts({ categorySummaries, transactions, currentYear, currentMonth }: ChartsProps) {
  // Prepare donut chart data with smart grouping
  const { pieData, totalExpenses } = useMemo(() => {
    const expenses = categorySummaries
      .filter(item => item.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
    
    if (expenses.length === 0) {
      return { pieData: [], totalExpenses: 0 }
    }
    
    const total = expenses.reduce((sum, item) => sum + item.amount, 0)
    const threshold = total * 0.03 // 3% threshold for grouping into "Other"
    
    const mainCategories: Array<{ name: string; value: number; originalName: string }> = []
    let otherAmount = 0
    const otherCategories: string[] = []
    
    expenses.forEach(item => {
      const categoryName = item.category.charAt(0).toUpperCase() + item.category.slice(1)
      if (item.amount >= threshold) {
        mainCategories.push({
          name: categoryName,
          value: item.amount,
          originalName: item.category,
        })
      } else {
        otherAmount += item.amount
        otherCategories.push(categoryName)
      }
    })
    
    // Limit to top 6 main categories to keep it clean
    const topCategories = mainCategories.slice(0, 6)
    const remainingMain = mainCategories.slice(6)
    
    // Add remaining main categories to "Other" if any
    remainingMain.forEach(cat => {
      otherAmount += cat.value
      otherCategories.push(cat.name)
    })
    
    const result = [...topCategories]
    
    // Add "Other" category if there are small categories
    if (otherAmount > 0) {
      result.push({
        name: `Other${otherCategories.length > 0 ? ` (${otherCategories.length})` : ''}`,
        value: otherAmount,
        originalName: 'other',
      })
    }
    
    return { pieData: result, totalExpenses: total }
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
      const data = payload[0].payload
      const percentage = totalExpenses > 0 ? ((data.value / totalExpenses) * 100).toFixed(1) : '0'
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
            {data.name}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {formatCurrency(data.value)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    // Only show labels for slices larger than 5%
    if (percent < 0.05) return null
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold pointer-events-none"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
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
      {/* Donut Chart */}
      {pieData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Expenses by Category
            </h3>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-shrink-0 w-48 space-y-2 max-h-[280px] overflow-y-auto pr-2">
              {pieData.map((entry, index) => {
                const percentage = totalExpenses > 0 ? ((entry.value / totalExpenses) * 100).toFixed(1) : '0'
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {entry.name}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatCurrency(entry.value)}
                        </p>
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {percentage}%
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
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