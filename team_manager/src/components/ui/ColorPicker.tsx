interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

const PRESET_COLORS = [
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // purple-500
  '#a855f7', // violet-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#64748b', // slate-500
]

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="grid grid-cols-8 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-md border-2 transition-all hover:scale-110 cursor-pointer ${
              value === color
                ? 'border-white shadow-lg scale-110'
                : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
      <div className="mt-3">
        <label className="text-xs text-[var(--text-tertiary)] block mb-1">Custom color</label>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 rounded-md cursor-pointer border border-[var(--border-primary)]"
          aria-label="Select custom color"
        />
      </div>
    </div>
  )
}
