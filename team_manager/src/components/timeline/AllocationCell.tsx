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

  const handleClick = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  const handleSave = async () => {
    const numValue = parseFloat(inputValue) || 0

    // Validazione: 0-5, step 0.5
    const validated = Math.max(0, Math.min(5, Math.round(numValue * 2) / 2))

    if (validated !== value) {
      setIsSaving(true)
      try {
        await onChange(validated)
      } catch (error) {
        // Rollback in caso di errore
        setInputValue(value.toString())
      } finally {
        setIsSaving(false)
      }
    }

    setIsEditing(false)
  }

  const handleCancel = () => {
    setInputValue(value.toString())
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleSave()
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
        className="w-full h-full bg-[var(--accent-primary)]20 border border-[var(--accent-primary)] text-xs font-mono text-[var(--text-primary)] text-center outline-none"
        min="0"
        max="5"
        step="0.5"
        disabled={isSaving}
      />
    )
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full h-full text-xs font-mono transition-colors hover:bg-[var(--bg-hover)] ${
        isOverCapacity
          ? 'bg-[var(--danger)]20 text-[var(--danger)]'
          : 'text-[var(--text-secondary)]'
      }`}
    >
      {value > 0 ? value : ''}
    </button>
  )
}
