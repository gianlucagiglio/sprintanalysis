import { useAuthStore } from '@/stores/authStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { LayoutDashboard, LogOut, BarChart3, ListTodo, UsersRound, Trophy, Sparkles } from 'lucide-react'
import packageJson from '../../../package.json'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/retrospettive', label: 'Retro', icon: LayoutDashboard },
  { path: '/teams', label: 'Team', icon: UsersRound },
  { path: '/leaderboard', label: 'Classifica', icon: Trophy },
  { path: '/actions', label: 'Azioni', icon: ListTodo },
]

export function Navbar() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (e) {
      console.error('signOut error:', e)
    }
    navigate('/login')
  }

  return (
    <>
      {/* Desktop top navbar */}
      <nav className="h-14 md:h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg flex items-center justify-between px-3 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 md:gap-2 font-bold text-base md:text-lg"
            >
              <span className="text-lg md:text-xl">🔄</span>
              <span className="bg-gradient-to-r from-retro-primary to-violet-500 bg-clip-text text-transparent">
                RetroBoard
              </span>
            </button>
            <button
              onClick={() => navigate('/changelog')}
              className="group flex items-center gap-1 text-[10px] font-medium text-retro-text-secondary bg-slate-100 hover:bg-retro-primary-light hover:text-retro-primary rounded-full px-1.5 py-0.5 transition-all"
              title="Changelog"
            >
              <Sparkles size={10} className="group-hover:animate-pulse" />
              v{packageJson.version}
            </button>
          </div>
          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
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
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-retro-primary to-violet-500 flex items-center justify-center text-white text-xs md:text-sm font-semibold">
                {user.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-retro-text">{user.name}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </nav>

      {/* Mobile bottom tab bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-slate-200/60 flex justify-around items-center h-14 safe-area-pb">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path.replace(/s$/, '/'))
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0
                  ${isActive ? 'text-retro-primary' : 'text-retro-text-secondary'}`}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium truncate">{label}</span>
              </button>
            )
          })}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-0 text-retro-text-secondary"
          >
            <LogOut size={20} />
            <span className="text-[10px] font-medium truncate">Esci</span>
          </button>
        </div>
      )}
    </>
  )
}
