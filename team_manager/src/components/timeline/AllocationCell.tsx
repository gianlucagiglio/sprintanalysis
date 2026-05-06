import { useState, useRef, useEffect } from 'react'

interface AllocationCellProps {
  value: number
  isOverCapacity: boolean
  onChange: (value: number) => Promise<void>
}

export function AllocationCell({ value, isOverCapacity, onChange }: AllocationCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setInputValue(value.toString())
  }, [value])

  const handleSave = async () => {
    const numValue = parseFloat(inputValue) || 0
    const validated = Math.max(0, Math.min(5, Math.round(numValue * 100) / 100))

    if (validated !== value) {
      setIsSaving(true)
      try {
        await onChange(validated)
      } catch (error) {
        setInputValue(value.toString())
      } finally {
        setIsSaving(false)
      }
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setInputValue(value.toString())
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full h-full bg-[var(--accent-subtle)] border border-[var(--accent-primary)] text-xs font-mono font-semibold text-[var(--text-primary)] text-center outline-none"
        min="0"
        max="5"
        step="0.01"
        disabled={isSaving}
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`w-full h-full text-xs font-mono font-semibold transition-all cursor-pointer ${
        isOverCapacity
          ? 'bg-[var(--danger-bg)] text-[var(--danger)]'
          : value > 0
          ? 'text-[var(--text-primary)] hover:bg-[var(--accent-subtle)] hover:text-[var(--accent-primary)]'
          : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]'
      }`}
    >
      {isSaving ? '...' : value > 0 ? value : ''}
    </button>
  )
}
