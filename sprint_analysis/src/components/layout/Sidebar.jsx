import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Upload,
  TrendingUp,
  Table2,
  FolderTree,
  AlertCircle,
  UserCog,
  Gauge,
  BarChart3,
  Layers,
  Clock,
  HeartPulse,
  RefreshCw,
  AlertTriangle,
  Columns2,
  ShieldAlert,
  BookOpen,
  HelpCircle,
} from 'lucide-react'

const navGroups = [
  {
    label: 'Core',
    items: [
      { to: '/', icon: Upload, label: 'Upload' },
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/timeline', icon: TrendingUp, label: 'Timeline' },
      { to: '/velocity', icon: Gauge, label: 'Velocity & Costs' },
      { to: '/effort', icon: Table2, label: 'Effort Table' },
    ],
  },
  {
    label: 'Explorer',
    items: [
      { to: '/epics', icon: FolderTree, label: 'Epic Explorer' },
      { to: '/professional', icon: BarChart3, label: 'Professional' },
      { to: '/dimensions', icon: Layers, label: 'Dimensions' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/cycletime', icon: Clock, label: 'Cycle Time' },
      { to: '/health', icon: HeartPulse, label: 'Sprint Health' },
      { to: '/incidents', icon: ShieldAlert, label: 'Incidents' },
      { to: '/carryover', icon: RefreshCw, label: 'Carry-over' },
      { to: '/anomalies', icon: AlertTriangle, label: 'Anomalies' },
      { to: '/comparison', icon: Columns2, label: 'Comparison' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { to: '/team', icon: UserCog, label: 'Team & Costs' },
      { to: '/unclassified', icon: AlertCircle, label: 'Unclassified' },
      { to: '/guide', icon: BookOpen, label: 'Backlog Guide' },
      { to: '/how-it-works', icon: HelpCircle, label: 'Come Funziona' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside className="w-60 flex flex-col min-h-screen" style={{ background: 'var(--color-sidebar)' }}>
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Sprint Analysis</h1>
            <p className="text-[11px] text-slate-400">Dashboard</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navGroups.map(group => (
          <div key={group.label} className="mb-3">
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                      isActive
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={cn('h-4 w-4 shrink-0', isActive && 'text-blue-400')} />
                      <span className="truncate">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-white/10">
        <p className="text-[11px] text-slate-500">Sprint Analysis v2.0</p>
      </div>
    </aside>
  )
}
