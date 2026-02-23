import { createContext, useContext, useState } from 'react'
import { cn } from '@/lib/utils'

const TabsContext = createContext()

function Tabs({ defaultValue, value, onValueChange, className, children, ...props }) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const activeValue = value ?? internalValue
  const setActiveValue = onValueChange ?? setInternalValue

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue }}>
      <div className={cn('', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, children, ...props }) {
  return (
    <div className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', className)} {...props}>
      {children}
    </div>
  )
}

function TabsTrigger({ value, className, children, ...props }) {
  const { activeValue, setActiveValue } = useContext(TabsContext)
  const isActive = activeValue === value

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        isActive && 'bg-background text-foreground shadow-sm',
        className
      )}
      onClick={() => setActiveValue(value)}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, className, children, ...props }) {
  const { activeValue } = useContext(TabsContext)
  if (activeValue !== value) return null

  return (
    <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)} {...props}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
