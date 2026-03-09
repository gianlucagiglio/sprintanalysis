import { useAuthStore } from '@/stores/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LayoutDashboard, LogOut, BarChart3, ListTodo, UsersRound, Trophy } from 'lucide-react'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/retrospettive', label: 'Retrospettive', icon: LayoutDashboard },
  { path: '/teams', label: 'Team', icon: UsersRound },
  { path: '/leaderboard', label: 'Classifiche', icon: Trophy },
  { path: '/actions', label: 'Azioni', icon: ListTodo },
]

export function Navbar() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <nav className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 font-bold text-lg"
        >
          <span className="text-xl">🔄</span>
          <span className="bg-gradient-to-r from-retro-primary to-violet-500 bg-clip-text text-transparent">
            RetroBoard
          </span>
        </button>
        {user && (
          <div className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path || location.pathname.startsWith(path.replace(/s$/, '/'))
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-retro-primary/10 text-retro-primary font-semibold'
                      : 'text-retro-text-secondary hover:text-retro-text hover:bg-slate-100'
                    }`}
                >
                  <Icon size={16} />
                  {label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-retro-primary" />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-retro-primary to-violet-500 flex items-center justify-center text-white text-sm font-semibold">
              {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="text-sm font-medium text-retro-text">{user.name}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut size={16} />
          </Button>
        </div>
      )}
    </nav>
  )
}
