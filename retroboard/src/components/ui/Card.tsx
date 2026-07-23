import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
  hover?: boolean
  glass?: boolean
}

export function Card({ padding = true, hover = false, glass = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ease-out
        ${glass
          ? 'glass-card'
          : 'bg-retro-card border-retro-border shadow-card'
        }
        ${hover && glass ? 'hover:opacity-90 cursor-pointer' : ''}
        ${hover && !glass ? 'hover:shadow-card-hover hover:scale-102 cursor-pointer' : ''}
        ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
