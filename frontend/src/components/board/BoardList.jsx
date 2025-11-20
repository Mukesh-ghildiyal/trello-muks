import React, { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import CardItem from './CardItem'

const BoardList = ({ list, onAddCard }) => {
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
    <div className="flex-shrink-0 w-80">
      <Card className="bg-card h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{list.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div ref={setNodeRef} className="min-h-[100px]">
            <SortableContext items={list.cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
              {list.cards.map((card) => (
                <CardItem key={card.id} card={card} />
              ))}
            </SortableContext>
          </div>

          {isAddingCard ? (
            <form onSubmit={handleSubmit} className="mt-3 space-y-2">
              <Input
                placeholder="Card title"
                value={cardTitle}
                onChange={(e) => setCardTitle(e.target.value)}
                autoFocus
                className="text-sm"
              />
              <Input
                placeholder="Description (optional)"
                value={cardDescription}
                onChange={(e) => setCardDescription(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" variant="default" className="flex-1">
                  Add Card
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
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 justify-start text-muted-foreground hover:text-foreground"
              onClick={() => setIsAddingCard(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add a card
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BoardList

