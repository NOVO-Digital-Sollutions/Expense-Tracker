'use client'

/**
 * Reusable Modal component
 */

import { ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 dark:bg-opacity-70"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}