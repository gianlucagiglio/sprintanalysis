import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-primary)] hover:bg-[var(--bg-hover)] transition-all group"
      aria-label={`Passa a tema ${theme === 'dark' ? 'chiaro' : 'scuro'}`}
      title={`Passa a tema ${theme === 'dark' ? 'chiaro' : 'scuro'}`}
    >
      {/* Sun Icon (visible in dark mode) */}
      <Sun
        size={18}
        className={`transition-all ${
          theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-90 scale-0 absolute'
        }`}
        style={{ color: 'var(--accent-primary)' }}
      />

      {/* Moon Icon (visible in light mode) */}
      <Moon
        size={18}
        className={`transition-all ${
          theme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-90 scale-0 absolute'
        }`}
        style={{ color: 'var(--accent-primary)' }}
      />

      <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
        {theme === 'dark' ? 'Chiaro' : 'Scuro'}
      </span>
    </button>
  )
}
