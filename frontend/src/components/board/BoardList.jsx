import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import CardItem from './CardItem'

const BoardList = ({ list, onAddCard, onUpdateCard, onDeleteCard }) => {
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [cardTitle, setCardTitle] = useState('')
  const [cardDescription, setCardDescription] = useState('')

  const { setNodeRef } = useDroppable({
    id: list.id,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (cardTitle.trim()) {
      onAddCard(list.id, cardTitle, cardDescription)
      setCardTitle('')
      setCardDescription('')
      setIsAddingCard(false)
    }
  }

  return (
    <div className="flex-shrink-0 w-72">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm h-full flex flex-col border border-gray-200 dark:border-slate-700">
        <div className="px-3 py-3 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">{list.title}</h3>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-2">
          <div ref={setNodeRef} className="min-h-[100px]">
            <SortableContext items={list.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
              {list.cards.map((card) => (
                <CardItem 
                  key={card.id} 
                  card={card} 
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard}
                />
              ))}
            </SortableContext>
          </div>

          {isAddingCard ? (
            <form onSubmit={handleSubmit} className="mt-2 space-y-2 bg-white dark:bg-slate-700 p-2 rounded border border-gray-200 dark:border-slate-600">
              <Input
                placeholder="Card title"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                autoFocus
                className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <Input
                placeholder="Description (optional)"
                value={cardDescription}
                onChange={(e) => setCardDescription(e.target.value)}
                className="text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex gap-2 pt-1">
                <Button type="submit" size="sm" variant="default" className="flex-1">
                  Add
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingCard(false)
                    setCardTitle('')
                    setCardDescription('')
                  }}
                  className="text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-yellow-500/20"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Card
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default BoardList

