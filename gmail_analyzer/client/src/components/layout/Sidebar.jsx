import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanSearch,
  Users,
  Settings,
  LogOut,
  Mail,
  Menu,
} from 'lucide-react';
import useAuthStore from '../../stores/authStore';
import useUiStore from '../../stores/uiStore';
import { cn } from '../ui/cn';

const navItems = [
  { to: '/scan', icon: ScanSearch, label: 'Scan' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/senders', icon: Users, label: 'Mittenti' },
];

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { sidebarOpen, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-surface border-r border-border flex flex-col z-40 transition-all duration-200',
        sidebarOpen ? 'w-56' : 'w-16'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={toggleSidebar} className="p-1 rounded-lg hover:bg-surface-hover cursor-pointer">
          <Menu size={20} className="text-text-muted" />
        </button>
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-accent" />
            <span className="font-semibold text-sm">Gmail Analyzer</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-muted hover:bg-surface-hover hover:text-text'
              )
            }
          >
            <Icon size={18} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-border">
        {sidebarOpen && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-7 h-7 rounded-full"
                referrerPolicy="no-referrer"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:bg-surface-hover hover:text-danger transition-colors w-full cursor-pointer',
          )}
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Esci</span>}
        </button>
      </div>
    </aside>
  );
}
