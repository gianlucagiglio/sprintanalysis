import { type HTMLAttributes } from 'react'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = '',
  ...props
}: SkeletonProps) {
  const variantClass = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }[variant]

  return (
    <div
      className={`animate-pulse ${variantClass} ${className}`}
      style={{
        backgroundColor: 'var(--ui-background-color)',
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      {...props}
    />
  )
}

export function SessionCardSkeleton() {
  return (
    <div
      className="rounded-2xl p-5 space-y-3"
      style={{
        backgroundColor: 'var(--primary-background-color)',
        border: '1px solid var(--layout-border-color)',
        boxShadow: 'var(--box-shadow-xs)',
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" height={20} />
          <Skeleton variant="text" width="50%" height={16} />
        </div>
        <Skeleton variant="rectangular" width={60} height={24} />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width="30%" />
      </div>
      <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--layout-border-color)' }}>
        <Skeleton variant="text" width={100} />
        <Skeleton variant="text" width={80} />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </>
  )
}
