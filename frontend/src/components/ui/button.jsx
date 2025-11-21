import React from 'react'
import { cn } from '@/lib/utils'

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    // Light mode: black button with white text
    // Dark mode: yellow button with white text
    default: 'bg-black dark:bg-yellow-500 text-white hover:bg-gray-800 dark:hover:bg-yellow-600 shadow-sm transition-colors',
    hero: 'bg-black dark:bg-yellow-500 text-white hover:bg-gray-800 dark:hover:bg-yellow-600 shadow-lg hover:shadow-xl transition-all',
    outline: 'border-2 border-gray-300 dark:border-yellow-400 bg-transparent dark:bg-transparent hover:bg-gray-100 dark:hover:bg-yellow-500/20 hover:border-gray-400 dark:hover:border-yellow-500 text-foreground dark:text-white shadow-sm hover:shadow-md transition-all',
    ghost: 'hover:bg-gray-100 dark:hover:bg-yellow-500/20 hover:text-foreground dark:hover:text-white text-muted-foreground dark:text-gray-300 transition-colors',
    secondary: 'bg-gray-200 dark:bg-yellow-500/20 text-foreground dark:text-white hover:bg-gray-300 dark:hover:bg-yellow-500/30 border border-gray-300 dark:border-yellow-400 shadow-sm hover:shadow-md transition-all',
    destructive: 'bg-red-600 dark:bg-red-600 text-white hover:bg-red-700 dark:hover:bg-red-700 shadow-sm transition-colors',
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

