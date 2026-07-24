import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { motion } from 'framer-motion'
import {
  Users,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import type { TeamStats, NoTeamStats } from '@/hooks/useTeamStats'

interface TeamStatsCardProps {
  stats: TeamStats
}

export function TeamStatsCard({ stats }: TeamStatsCardProps) {
  const navigate = useNavigate()

  const trendIcon =
    stats.happinessTrend === 'up' ? TrendingUp :
    stats.happinessTrend === 'down' ? TrendingDown :
    Minus

  const TrendIcon = trendIcon

  const trendColor =
    stats.happinessTrend === 'up' ? 'text-emerald-500 bg-emerald-50' :
    stats.happinessTrend === 'down' ? 'text-rose-500 bg-rose-50' :
    'text-slate-500 bg-slate-50'

  const roleBadge = stats.team.my_role === 'owner'
    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
    : stats.team.my_role === 'admin'
    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
    : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'

  const roleLabel = stats.team.my_role === 'owner' ? 'Owner' : stats.team.my_role === 'admin' ? 'Admin' : 'Membro'

  const lastDate = stats.lastSessionDate
    ? new Date(stats.lastSessionDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card
        hover
        className="!p-0 !rounded-2xl overflow-hidden group cursor-pointer"
        onClick={() => navigate(`/team/${stats.team.id}`)}
      >
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4 pb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

          <div className="relative flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white truncate">{stats.team.name}</h3>
              </div>
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${roleBadge} shadow-lg`}>
                <Sparkles size={10} />
                {roleLabel}
              </span>
            </div>
            <ArrowRight size={18} className="text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 -mt-4">
          {/* Happiness Stat - Elevated card */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-retro-text-secondary">Felicità Media</span>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-retro-text">
                  {stats.happinessAvg.toFixed(1)}
                </span>
                <div className={`p-1.5 rounded-lg ${trendColor}`}>
                  <TrendIcon size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MiniKPI
              icon={<BarChart3 size={14} />}
              label="Retro"
              value={stats.retroCount}
              color="from-indigo-500 to-purple-600"
            />
            <MiniKPI
              icon={<Users size={14} />}
              label="Membri"
              value={stats.memberCount}
              color="from-blue-500 to-cyan-600"
            />
            <MiniKPI
              icon={<Users size={14} />}
              label="Media part."
              value={stats.avgParticipants}
              color="from-emerald-500 to-teal-600"
            />
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <MiniKPI
              icon={<MessageSquare size={14} />}
              label="Commenti"
              value={stats.totalComments}
              subtitle={`${stats.positiveRate}% pos.`}
              color="from-purple-500 to-pink-600"
            />
            <MiniKPI
              icon={<CheckCircle2 size={14} />}
              label="Azioni"
              value={`${stats.doneActions}/${stats.totalActions}`}
              color="from-green-500 to-emerald-600"
            />
            <MiniKPI
              icon={<Calendar size={14} />}
              label="Ultima"
              value={lastDate}
              color="from-amber-500 to-orange-600"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// --- NoTeam variant ---

interface NoTeamStatsCardProps {
  stats: NoTeamStats
}

export function NoTeamStatsCard({ stats }: NoTeamStatsCardProps) {
  const lastDate = stats.lastSessionDate
    ? new Date(stats.lastSessionDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="!p-0 !rounded-2xl overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-slate-500 to-slate-600 p-4 pb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Users size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Senza team</h3>
              </div>
              <span className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm">
                Personali
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 -mt-4">
          {/* Happiness Stat */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-retro-text-secondary">Felicità Media</span>
              <span className="text-3xl font-bold text-retro-text">
                {stats.happinessAvg.toFixed(1)}
              </span>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MiniKPI
              icon={<BarChart3 size={14} />}
              label="Retro"
              value={stats.retroCount}
              color="from-indigo-500 to-purple-600"
            />
            <MiniKPI
              icon={<Users size={14} />}
              label="Media part."
              value={stats.avgParticipants}
              color="from-blue-500 to-cyan-600"
            />
            <MiniKPI
              icon={<MessageSquare size={14} />}
              label="Commenti"
              value={stats.totalComments}
              color="from-emerald-500 to-teal-600"
            />
          </div>

          {/* Bottom row */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <MiniKPI
              icon={<CheckCircle2 size={14} />}
              label="Azioni"
              value={`${stats.doneActions}/${stats.totalActions}`}
              color="from-green-500 to-emerald-600"
            />
            <MiniKPI
              icon={<Calendar size={14} />}
              label="Ultima"
              value={lastDate}
              color="from-amber-500 to-orange-600"
            />
            <MiniKPI
              icon={<MessageSquare size={14} />}
              label="% positivi"
              value={`${stats.positiveRate}%`}
              color="from-purple-500 to-pink-600"
            />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// --- Shared mini KPI ---

function MiniKPI({
  icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle?: string
  color?: string
}) {
  return (
    <div className="text-center">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color || 'from-slate-400 to-slate-500'} flex items-center justify-center mx-auto mb-2 shadow-sm`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      <p className="text-[10px] text-retro-text-secondary mb-0.5">{label}</p>
      <p className="text-sm font-bold text-retro-text">{value}</p>
      {subtitle && <p className="text-[10px] text-retro-text-secondary mt-0.5">{subtitle}</p>}
    </div>
  )
}
