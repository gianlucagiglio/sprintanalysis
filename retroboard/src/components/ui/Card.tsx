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
          ? 'bg-white/80 backdrop-blur-lg border-white/20 shadow-soft'
          : 'bg-retro-card border-retro-border shadow-card'
        }
        ${hover ? 'hover:shadow-card-hover hover:scale-102 cursor-pointer' : ''}
        ${padding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
