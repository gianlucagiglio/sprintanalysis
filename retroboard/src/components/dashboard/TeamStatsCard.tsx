import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import {
  Users,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart3,
} from 'lucide-react'
import type { TeamStats, NoTeamStats } from '@/hooks/useTeamStats'

interface TeamStatsCardProps {
  stats: TeamStats
}

export function TeamStatsCard({ stats }: TeamStatsCardProps) {
  const navigate = useNavigate()

  const trendIcon =
    stats.happinessTrend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> :
    stats.happinessTrend === 'down' ? <TrendingDown size={14} className="text-rose-500" /> :
    <Minus size={14} className="text-retro-text-secondary" />

  const trendColor =
    stats.happinessTrend === 'up' ? 'text-emerald-500' :
    stats.happinessTrend === 'down' ? 'text-rose-500' :
    'text-retro-text-secondary'

  const roleBadge = stats.team.my_role === 'owner'
    ? 'bg-amber-500/20 text-amber-400'
    : stats.team.my_role === 'admin'
    ? 'bg-violet-500/20 text-violet-400'
    : 'bg-retro-primary/20 text-retro-primary'

  const roleLabel = stats.team.my_role === 'owner' ? 'Owner' : stats.team.my_role === 'admin' ? 'Admin' : 'Membro'

  const lastDate = stats.lastSessionDate
    ? new Date(stats.lastSessionDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <Card
      hover
      className="!p-5 !rounded-2xl"
      onClick={() => navigate(`/team/${stats.team.id}`)}
    >
      {/* Header: team name + role badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-retro-text truncate mr-2">{stats.team.name}</h3>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${roleBadge}`}>
          {roleLabel}
        </span>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <MiniKPI icon={<BarChart3 size={13} />} label="Retro" value={stats.retroCount} />
        <MiniKPI icon={<Users size={13} />} label="Membri" value={stats.memberCount} />
        <MiniKPI icon={<Users size={13} />} label="Media part." value={stats.avgParticipants} />
      </div>

      {/* Happiness row */}
      <div className="flex items-center justify-between bg-retro-bg/50 rounded-xl px-3 py-2 mb-3">
        <span className="text-xs text-retro-text-secondary">Felicità media</span>
        <span className={`flex items-center gap-1 text-sm font-bold ${trendColor}`}>
          {stats.happinessAvg.toFixed(1)}
          {trendIcon}
        </span>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-3">
        <MiniKPI
          icon={<MessageSquare size={13} />}
          label="Commenti"
          value={stats.totalComments}
          subtitle={`${stats.positiveRate}% pos.`}
        />
        <MiniKPI
          icon={<CheckCircle2 size={13} />}
          label="Azioni"
          value={`${stats.doneActions}/${stats.totalActions}`}
        />
        <MiniKPI
          icon={<Calendar size={13} />}
          label="Ultima"
          value={lastDate}
        />
      </div>
    </Card>
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
    <Card className="!p-5 !rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-retro-text">Senza team</h3>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-retro-text-secondary/20 text-retro-text-secondary">
          Personali
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <MiniKPI icon={<BarChart3 size={13} />} label="Retro" value={stats.retroCount} />
        <MiniKPI icon={<Users size={13} />} label="Media part." value={stats.avgParticipants} />
        <MiniKPI
          icon={<MessageSquare size={13} />}
          label="Commenti"
          value={stats.totalComments}
        />
      </div>

      <div className="flex items-center justify-between bg-retro-bg/50 rounded-xl px-3 py-2 mb-3">
        <span className="text-xs text-retro-text-secondary">Felicità media</span>
        <span className="text-sm font-bold text-retro-text">
          {stats.happinessAvg.toFixed(1)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MiniKPI
          icon={<CheckCircle2 size={13} />}
          label="Azioni"
          value={`${stats.doneActions}/${stats.totalActions}`}
        />
        <MiniKPI
          icon={<Calendar size={13} />}
          label="Ultima"
          value={lastDate}
        />
        <MiniKPI
          icon={<MessageSquare size={13} />}
          label="% positivi"
          value={`${stats.positiveRate}%`}
        />
      </div>
    </Card>
  )
}

// --- Shared mini KPI ---

function MiniKPI({
  icon,
  label,
  value,
  subtitle,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subtitle?: string
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1 text-retro-text-secondary mb-0.5">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-sm font-bold text-retro-text">{value}</p>
      {subtitle && <p className="text-[10px] text-retro-text-secondary">{subtitle}</p>}
    </div>
  )
}
