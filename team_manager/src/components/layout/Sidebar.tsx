import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Calendar, Users, LayoutGrid, Palmtree, Layers, BarChart3, ScrollText, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { SettingsModal } from '@/components/settings/SettingsModal'

const NAV_ITEMS = [
  { to: '/', icon: LayoutGrid, label: 'Timeline' },
  { to: '/gantt', icon: BarChart3, label: 'Gantt' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/sprints', icon: Calendar, label: 'Sprint' },
  { to: '/features', icon: Layers, label: 'Feature' },
  { to: '/timeoff', icon: Palmtree, label: 'Ferie' },
  { to: '/changelog', icon: ScrollText, label: 'Changelog' },
]

export function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
    <aside className="w-[var(--sidebar-width)] h-screen bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border-primary)]">
        <h1 className="text-xl font-bold text-[var(--text-primary)]">
          Resource Manager
        </h1>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Team Planning
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <>
              <item.icon size={20} />
              <span>{item.label}</span>
            </>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-primary)] space-y-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Settings size={18} />
          <span className="text-sm">Impostazioni Colori</span>
        </button>
        <ThemeToggle />
        <div className="text-xs text-[var(--text-tertiary)]">
          v1.8.3 • Team Resource Manager
        </div>
      </div>
    </aside>

    <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
