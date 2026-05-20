import { useEffect, useState } from 'react'

interface SelectionTooltipProps {
  totalValue: number
  cellCount: number
}

export function SelectionTooltip({ totalValue, cellCount }: SelectionTooltipProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX + 15, y: e.clientY + 15 })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  if (cellCount === 0) return null

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="bg-[var(--accent-primary)] text-white px-3 py-2 rounded-lg shadow-lg">
        <div className="text-xs font-semibold">
          {cellCount} {cellCount === 1 ? 'cella' : 'celle'} selezionate
        </div>
        <div className="text-sm font-mono font-bold mt-1">
          Totale: {totalValue.toFixed(1)}d
        </div>
      </div>
    </div>
  )
}
