interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-center gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 ${
              value === color
                ? 'border-white shadow-lg scale-110'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md cursor-pointer border border-[var(--border-primary)]"
        />
      </div>
    </div>
  )
}
