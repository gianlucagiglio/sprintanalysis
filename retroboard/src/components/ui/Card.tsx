import { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
  hover?: boolean
}

export function Card({ padding = true, hover = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-retro-card rounded-2xl border border-retro-border shadow-card
        transition-all duration-200
        ${hover ? 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer' : ''}
        ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
