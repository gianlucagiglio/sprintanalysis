import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
  hover?: boolean
  glass?: boolean
}

export function Card({ padding = true, hover = false, glass = false, className = '', children, style, ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ease-out
        ${glass ? 'glass-card' : ''}
        ${hover && glass ? 'hover:opacity-90 cursor-pointer' : ''}
        ${hover && !glass ? 'hover:scale-102 cursor-pointer' : ''}
        ${padding ? 'p-6' : ''} ${className}`}
      style={glass ? style : {
        backgroundColor: 'var(--primary-background-color)',
        borderColor: 'var(--layout-border-color)',
        boxShadow: hover ? undefined : 'var(--box-shadow-xs)',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
