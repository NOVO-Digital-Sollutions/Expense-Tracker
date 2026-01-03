'use client'

/**
 * Import/Export Component for data synchronization
 */

import { useState, useRef } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { downloadExport, importData, readImportFile } from '@/lib/importExport'
import { Upload, Download, AlertCircle, CheckCircle, X } from 'lucide-react'

interface ImportExportProps {
  onDataChanged: () => void
}

export function ImportExport({ onDataChanged }: ImportExportProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
  } | null>(null)
  const [mergeMode, setMergeMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    try {
      downloadExport()
      setIsOpen(false)
    } catch (error) {
      alert('Error exporting data. Please try again.')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const data = await readImportFile(file)
      const result = importData(data, mergeMode)

      setImportResult({
        success: result.success,
        message: result.message,
      })

      if (result.success) {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // Notify parent to refresh data
        onDataChanged()
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setImportResult(null)
    setMergeMode(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Sync</span>
      </Button>

      <Modal isOpen={isOpen} onClose={handleClose} title="Import/Export Data">
        <div className="space-y-6">
          {/* Export Section */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Export Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Download all your accounts and transactions as a JSON file. You can use this file to
              restore your data on another device.
            </p>
            <Button
              variant="primary"
              onClick={handleExport}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>

          {/* Import Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Import Data
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Import data from a previously exported backup file.
            </p>

            {/* Merge/Replace Toggle */}
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeMode}
                  onChange={(e) => setMergeMode(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Merge with existing data
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {mergeMode
                      ? 'New data will be added to your existing data (recommended)'
                      : 'All existing data will be replaced with imported data'}
                  </p>
                </div>
              </label>
            </div>

            {!mergeMode && (
              <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Warning:</strong> Replacing data will permanently delete all your
                    current accounts and transactions. Consider using &quot;Merge&quot; mode instead.
                  </div>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              variant="secondary"
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Importing...' : 'Import Data'}
            </Button>

            {/* Import Result */}
            {importResult && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  importResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {importResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        importResult.success
                          ? 'text-green-800 dark:text-green-200'
                          : 'text-red-800 dark:text-red-200'
                      }`}
                    >
                      {importResult.message}
                    </p>
                  </div>
                  <button
                    onClick={() => setImportResult(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}
