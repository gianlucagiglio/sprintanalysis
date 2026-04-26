interface BadgeProps {
  label: string
  color: string
  small?: boolean
}

export function Badge({ label, color, small = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${
        small ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  )
}
