'use client'

/**
 * Month Filter Component
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './Button'
import { format } from 'date-fns'

interface MonthFilterProps {
  year: number
  month: number
  onMonthChange: (year: number, month: number) => void
}

export function MonthFilter({ year, month, onMonthChange }: MonthFilterProps) {
  const currentDate = new Date(year, month, 1)

  const goToPreviousMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    onMonthChange(newDate.getFullYear(), newDate.getMonth())
  }

  const goToNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    onMonthChange(newDate.getFullYear(), newDate.getMonth())
  }

  const goToCurrentMonth = () => {
    const now = new Date()
    onMonthChange(now.getFullYear(), now.getMonth())
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPreviousMonth}
          className="p-2"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNextMonth}
          className="p-2"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
      
      <Button variant="secondary" size="sm" onClick={goToCurrentMonth}>
        Today
      </Button>
    </div>
  )
}