import { cn } from '@/lib/utils'

const variants = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  outline: 'text-foreground',
  strategic: 'border-transparent bg-blue-100 text-blue-800',
  ktlo: 'border-transparent bg-amber-100 text-amber-800',
  smallchange: 'border-transparent bg-green-100 text-green-800',
  other: 'border-transparent bg-purple-100 text-purple-800',
  unclassified: 'border-transparent bg-gray-100 text-gray-800',
}

export function classificationToVariant(classification) {
  const map = {
    'Strategic': 'strategic',
    'KTLO': 'ktlo',
    'Small Change': 'smallchange',
    'Other': 'other',
    'Unclassified': 'unclassified',
  }
  return map[classification] || 'unclassified'
}

function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <div className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors', variants[variant], className)} {...props}>
      {children}
    </div>
  )
}

export { Badge }
