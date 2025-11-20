import React from 'react'
import { cn } from '@/lib/utils'

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-gray-500 text-white hover:bg-gray-600 shadow-sm',
    hero: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all',
    outline: 'border-2 border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-gray-400 text-foreground shadow-sm hover:shadow-md transition-all',
    ghost: 'hover:bg-gray-100 hover:text-foreground text-muted-foreground',
    secondary: 'bg-gray-200 text-foreground hover:bg-gray-300 border border-gray-300 shadow-sm hover:shadow-md transition-all',
  }

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 text-xs',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  }

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export { Button }

