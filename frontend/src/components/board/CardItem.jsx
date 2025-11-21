import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import EditCardDialog from './EditCardDialog'

const CardItem = ({ card, isOverlay = false, onUpdate, onDelete }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
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
      <div className="mb-2 p-3 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700 shadow-2xl rotate-3 w-72">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">{card.title}</h3>
        {card.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{card.description}</p>
        )}
      </div>
    )
  }

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && !card.completed

  const handleCardClick = (e) => {
    // Don't open dialog if dragging
    if (!isDragging && !isOverlay) {
      e.stopPropagation()
      setIsEditDialogOpen(true)
    }
  }

  const handleUpdate = (updatedCard) => {
    if (onUpdate) {
      onUpdate(updatedCard)
    }
  }

  const handleDelete = (cardId) => {
    if (onDelete) {
      onDelete(cardId)
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={handleCardClick}
        className={`mb-2 p-3 cursor-grab active:cursor-grabbing bg-white dark:bg-slate-800 rounded border ${
          isOverdue ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/30' : 'border-gray-200 dark:border-slate-700'
        } shadow-sm hover:shadow-md transition-shadow ${
          isDragging ? 'opacity-50' : ''
        } ${!isOverlay ? 'hover:border-blue-300 dark:hover:border-yellow-500' : ''}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1 text-sm">{card.title}</h3>
            {card.description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{card.description}</p>
            )}
          </div>
          {card.dueDate && (
            <div className={`text-xs px-2 py-1 rounded ${
              isOverdue 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium' 
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
            }`}>
              {new Date(card.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>

      {!isOverlay && (
        <EditCardDialog
          card={card}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}

export default CardItem

