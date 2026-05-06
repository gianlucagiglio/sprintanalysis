import { ChevronsDown, ChevronsUp } from 'lucide-react'

interface ExpandCollapseButtonsProps {
  onExpandAll: () => void
  onCollapseAll: () => void
}

export function ExpandCollapseButtons({ onExpandAll, onCollapseAll }: ExpandCollapseButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onExpandAll}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-lg transition-colors"
        title="Espandi tutto"
      >
        <ChevronsDown size={14} />
        <span>Espandi tutto</span>
      </button>
      <button
        onClick={onCollapseAll}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-[var(--border-primary)] rounded-lg transition-colors"
        title="Collassa tutto"
      >
        <ChevronsUp size={14} />
        <span>Collassa tutto</span>
      </button>
    </div>
  )
}
