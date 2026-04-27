interface BadgeProps {
  label: string
  color: string
  small?: boolean
  maxWidth?: string
}

export function Badge({ label, color, small = false, maxWidth }: BadgeProps) {
  const shouldTruncate = !!maxWidth

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      } ${shouldTruncate ? 'overflow-hidden' : ''}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
        ...(maxWidth && { maxWidth }),
      }}
      title={shouldTruncate ? label : undefined}
    >
      <span
        className={shouldTruncate ? 'truncate' : ''}
        style={shouldTruncate ? { display: 'block', minWidth: 0 } : undefined}
      >
        {label}
      </span>
    </span>
  )
}
