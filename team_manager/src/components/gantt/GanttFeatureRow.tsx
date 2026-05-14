import { ChevronDown, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { useEstimatedEfforts } from '@/hooks/useEstimatedEfforts'
import type { Feature, WeekColumn, Allocation, TeamMember } from '@/types'

interface GanttFeatureRowProps {
  feature: Feature
  weeks: WeekColumn[]
  gridWidth: number
  allocations: Allocation[]
  members: TeamMember[]
}

interface RoleBreakdown {
  roleName: string
  roleColor: string
  weekDays: Record<string, number> // weekStart -> total days
  totalDays: number
}

export function GanttFeatureRow({
  feature,
  weeks,
  gridWidth,
  allocations,
  members,
}: GanttFeatureRowProps) {
  const { collapsedGanttFeatures, toggleGanttFeatureCollapse } = useAppStore()
  const isExpanded = !collapsedGanttFeatures[feature.id]
  const { estimatedEfforts } = useEstimatedEfforts(feature.id)

  // Filtra allocazioni per questa feature
  const featureAllocations = allocations.filter((a) => a.feature_id === feature.id)

  // Calcola giorni totali per settimana
  const getWeekTotal = (weekStart: string) => {
    return featureAllocations
      .filter((a) => a.week_start === weekStart)
      .reduce((sum, a) => sum + a.days, 0)
  }

  // Calcola totale giorni allocati su tutta la feature (pianificato)
  const totalPlanned = featureAllocations.reduce((sum, a) => sum + a.days, 0)

  // Calcola totale giorni stimati
  const totalEstimated = estimatedEfforts.reduce((sum, e) => sum + e.estimated_days, 0)

  // Calcola intensità colore (0-1) basata sui giorni
  const getIntensity = (days: number) => {
    // Normalizza: 5 giorni = massima intensità
    return Math.min(days / 5, 1)
  }

  // Get effort stimato per ruolo
  const getEstimatedForRole = (roleName: string): number => {
    const effort = estimatedEfforts.find((e) => e.role?.name === roleName)
    return effort?.estimated_days || 0
  }

  // Breakdown per ruolo
  const getRoleBreakdown = (): RoleBreakdown[] => {
    const roleMap = new Map<string, RoleBreakdown>()

    featureAllocations.forEach((allocation) => {
      const member = members.find((m) => m.id === allocation.member_id)
      if (!member || !member.role) return

      const roleName = member.role.name
      const roleColor = member.role.color

      if (!roleMap.has(roleName)) {
        roleMap.set(roleName, {
          roleName,
          roleColor,
          weekDays: {},
          totalDays: 0,
        })
      }

      const roleData = roleMap.get(roleName)!
      roleData.weekDays[allocation.week_start] =
        (roleData.weekDays[allocation.week_start] || 0) + allocation.days
      roleData.totalDays += allocation.days
    })

    // Ordina per ruolo
    const roleOrder: Record<string, number> = {
      PA: 1,
      PD: 2,
      BE: 3,
      FE: 4,
      QA: 5,
      QAA: 6,
    }

    return Array.from(roleMap.values()).sort((a, b) => {
      const orderA = roleOrder[a.roleName] || 999
      const orderB = roleOrder[b.roleName] || 999
      return orderA - orderB
    })
  }

  const roleBreakdown = getRoleBreakdown()

  return (
    <div className="border-b border-[var(--border-primary)]">
      {/* Feature Header */}
      <div className="flex bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
        <div className="timeline-sticky-col bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => toggleGanttFeatureCollapse(feature.id)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold timeline-text-truncate" style={{ color: feature.color }} title={feature.name}>
              {feature.name}
            </div>
          </div>
        </div>

        {/* Colonne Stimato/Pianificato */}
        <div className="flex border-r border-[var(--border-primary)]">
          <div className="px-3 py-3 text-center flex items-center justify-center" style={{ width: '70px', minWidth: '70px' }}>
            {totalEstimated > 0 && (
              <span className="text-xs font-mono font-semibold text-[var(--text-secondary)]">
                {totalEstimated.toFixed(1)}d
              </span>
            )}
          </div>
          <div className="px-3 py-3 text-center border-l border-[var(--border-primary)] flex items-center justify-center" style={{ width: '70px', minWidth: '70px' }}>
            <span className={`text-xs font-mono font-semibold ${
              totalEstimated === 0
                ? 'text-[var(--success)]'
                : totalPlanned > totalEstimated
                ? 'text-[var(--danger)]'
                : totalPlanned < totalEstimated
                ? 'text-[var(--warning)]'
                : 'text-[var(--success)]'
            }`}>
              {totalPlanned.toFixed(1)}d
            </span>
          </div>
        </div>

        {/* Gantt Bar */}
        <div className="flex" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
          {weeks.map((week) => {
            const total = getWeekTotal(week.weekStart)
            const intensity = getIntensity(total)

            return (
              <div
                key={week.weekStart}
                className={`border-r relative ${
                  week.isCurrentWeek
                    ? 'border-[var(--accent-primary)] border-l-2 border-r-2'
                    : 'border-[var(--border-primary)]'
                }`}
                style={{
                  width: '72px',
                  minWidth: '72px',
                  height: '40px',
                  backgroundColor: total > 0
                    ? `${feature.color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`
                    : 'transparent',
                }}
              >
                {total > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{
                        color: intensity > 0.5 ? '#ffffff' : feature.color,
                      }}
                    >
                      {total.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Role Breakdown */}
      {isExpanded && roleBreakdown.length > 0 && (
        <div className="bg-[var(--bg-primary)]">
          {roleBreakdown.map((role) => (
            <div
              key={role.roleName}
              className="flex hover:bg-[var(--bg-hover)] transition-colors border-t border-[var(--border-primary)]"
            >
              <div className="timeline-sticky-col bg-[var(--bg-primary)] border-r border-[var(--border-primary)] px-4 py-2 flex items-center gap-3 pl-12">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: role.roleColor }}
                />
                <span className="text-sm text-[var(--text-secondary)]">{role.roleName}</span>
              </div>

              {/* Colonne Stimato/Pianificato per Ruolo */}
              <div className="flex border-r border-[var(--border-primary)]">
                <div className="px-3 py-2 text-center flex items-center justify-center" style={{ width: '70px', minWidth: '70px' }}>
                  {getEstimatedForRole(role.roleName) > 0 && (
                    <span className="text-xs font-mono text-[var(--text-secondary)]">
                      {getEstimatedForRole(role.roleName).toFixed(1)}d
                    </span>
                  )}
                </div>
                <div className="px-3 py-2 text-center border-l border-[var(--border-primary)] flex items-center justify-center" style={{ width: '70px', minWidth: '70px' }}>
                  <span className={`text-xs font-mono ${
                    getEstimatedForRole(role.roleName) === 0
                      ? 'text-[var(--success)]'
                      : role.totalDays > getEstimatedForRole(role.roleName)
                      ? 'text-[var(--danger)]'
                      : role.totalDays < getEstimatedForRole(role.roleName)
                      ? 'text-[var(--warning)]'
                      : 'text-[var(--success)]'
                  }`}>
                    {role.totalDays.toFixed(1)}d
                  </span>
                </div>
              </div>

              {/* Role Gantt Bar */}
              <div className="flex" style={{ width: `${gridWidth}px`, minWidth: `${gridWidth}px` }}>
                {weeks.map((week) => {
                  const days = role.weekDays[week.weekStart] || 0
                  const intensity = getIntensity(days)

                  return (
                    <div
                      key={week.weekStart}
                      className={`border-r ${
                        week.isCurrentWeek
                          ? 'border-[var(--accent-primary)] border-l-2 border-r-2'
                          : 'border-[var(--border-primary)]'
                      }`}
                      style={{
                        width: '72px',
                        minWidth: '72px',
                        height: '32px',
                        backgroundColor: days > 0
                          ? `${role.roleColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`
                          : 'transparent',
                      }}
                    >
                      {days > 0 && (
                        <div className="flex items-center justify-center h-full">
                          <span
                            className="text-xs font-mono"
                            style={{
                              color: intensity > 0.5 ? '#ffffff' : role.roleColor,
                            }}
                          >
                            {days.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
