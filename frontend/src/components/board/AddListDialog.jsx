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
      <div className="flex-shrink-0 w-80">
        <Card
          className="bg-accent border-dashed border-2 border-border cursor-pointer hover:bg-accent/80 transition-colors h-fit"
          onClick={() => setIsOpen(true)}
        >
          <div className="p-6 flex items-center justify-center">
            <Plus className="w-5 h-5 mr-2 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Add another list</span>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-shrink-0 w-80">
      <Card className="bg-card p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Enter list title"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            autoFocus
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
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default AddListDialog

