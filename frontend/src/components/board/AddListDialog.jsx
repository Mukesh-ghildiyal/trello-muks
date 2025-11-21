import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'

const AddListDialog = ({ onAddList }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [listTitle, setListTitle] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (listTitle.trim()) {
      onAddList(listTitle)
      setListTitle('')
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <div className="flex-shrink-0 w-72">
        <div
          className="bg-gray-50 dark:bg-slate-800 border-dashed border-2 border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 hover:border-gray-400 dark:hover:border-slate-500 transition-colors h-fit min-h-[100px] flex items-center justify-center"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center">
            <Plus className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">Add List</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Enter list title"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            autoFocus
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            onBlur={() => {
              if (!listTitle.trim()) {
                setIsOpen(false)
              }
            }}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="default">
              Add List
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsOpen(false)
                setListTitle('')
              }}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddListDialog

