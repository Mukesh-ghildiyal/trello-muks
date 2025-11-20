import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// Using native textarea since Textarea component may not exist
import { Trash2 } from 'lucide-react'
import { cardsAPI } from '@/services/api'

const EditCardDialog = ({ card, isOpen, onClose, onUpdate, onDelete }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (card && isOpen) {
      setTitle(card.title || '')
      setDescription(card.description || '')
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '')
      setError('')
    }
  }, [card, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      const updateData = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
      }
      const response = await cardsAPI.updateCard(card.id, updateData)
      if (response.success) {
        onUpdate(response.data.card)
        onClose()
      }
    } catch (error) {
      setError(error.message || 'Failed to update card')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this card?')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      await cardsAPI.deleteCard(card.id)
      onDelete(card.id)
      onClose()
    } catch (error) {
      setError(error.message || 'Failed to delete card')
    } finally {
      setLoading(false)
    }
  }

  if (!card) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left text-xl font-semibold">Edit Card</DialogTitle>
          <DialogDescription className="text-left text-gray-600 mt-2">
            Update card details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Card title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Card description"
              rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditCardDialog

