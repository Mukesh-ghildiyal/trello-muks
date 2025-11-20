import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'

const Dialog = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [open])

  // Always render all children, but only show content overlay when open
  return (
    <>
      {React.Children.map(children, child => {
        // Always render trigger with onOpenChange handler
        if (child && child.type === DialogTrigger) {
          return React.cloneElement(child, { onOpenChange })
        }
        // Only render content when open
        if (child && child.type === DialogContent && open) {
          return (
            <div key="dialog-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => onOpenChange(false)}
              />
              <div className="relative z-50 w-full max-w-md">
                {child}
              </div>
            </div>
          )
        }
        return null
      })}
    </>
  )
}

const DialogTrigger = ({ asChild, children, onClick, onOpenChange, ...props }) => {
  const handleClick = (e) => {
    if (onClick) onClick(e)
    if (onOpenChange) onOpenChange(true)
  }

  if (asChild) {
    return React.cloneElement(children, { ...props, onClick: handleClick })
  }
  return <div {...props} onClick={handleClick}>{children}</div>
}

const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white text-gray-900 rounded-lg shadow-2xl border border-gray-200 p-6 w-full max-w-md',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
})
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }) => {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)}
      {...props}
    />
  )
}

const DialogTitle = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
})
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
DialogDescription.displayName = 'DialogDescription'

export { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger }

