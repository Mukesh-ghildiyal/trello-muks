import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'

const CardItem = ({ card, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    disabled: isOverlay,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  if (isOverlay) {
    return (
      <Card className="mb-3 p-4 bg-card shadow-2xl rotate-3 w-80">
        <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
        {card.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
        )}
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`mb-3 p-4 cursor-grab active:cursor-grabbing bg-card hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <h3 className="font-semibold text-foreground mb-2">{card.title}</h3>
      {card.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{card.description}</p>
      )}
    </Card>
  )
}

export default CardItem

