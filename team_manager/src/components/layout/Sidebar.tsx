import { NavLink } from 'react-router-dom'
import { Calendar, Users, LayoutGrid, Palmtree } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutGrid, label: 'Timeline' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/sprints', icon: Calendar, label: 'Sprint' },
  { to: '/timeoff', icon: Palmtree, label: 'Ferie' },
]

export function Sidebar() {
  return (
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
      <div className="p-4 border-t border-[var(--border-primary)] text-xs text-[var(--text-tertiary)]">
        v1.0.0 • Team Resource Manager
      </div>
    </aside>
  )
}
