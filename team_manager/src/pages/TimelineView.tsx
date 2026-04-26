import { useAppStore } from '@/store/useAppStore'
import { useTeam } from '@/hooks/useTeam'
import { useSprints } from '@/hooks/useSprints'
import { useAllocations } from '@/hooks/useAllocations'
import { generateWeekColumns, getSprintSpans } from '@/lib/capacity'
import { TimelineHeader } from '@/components/timeline/TimelineHeader'
import { FeatureGroup } from '@/components/timeline/FeatureGroup'

export function TimelineView() {
  const { collapsedFeatures, toggleFeatureCollapse } = useAppStore()
  const { members } = useTeam()
  const { sprints, features } = useSprints()
  const { allocations, timeOffs, upsertAllocation, upsertTimeOff } = useAllocations()

  const weeks = generateWeekColumns(sprints)
  const sprintSpans = getSprintSpans(sprints, weeks)

  // Empty states
  if (sprints.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Vista settimanale allocazioni per feature e membro
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuno sprint creato. Vai alla sezione Sprint per iniziare!
          </p>
          <a href="/sprints" className="btn btn-primary inline-block">
            Vai a Sprint
          </a>
        </div>
      </div>
    )
  }

  if (features.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Vista settimanale allocazioni per feature e membro
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessuna feature creata. Vai alla sezione Sprint per aggiungerne!
          </p>
          <a href="/sprints" className="btn btn-primary inline-block">
            Vai a Sprint
          </a>
        </div>
      </div>
    )
  }

  if (members.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
          <p className="text-[var(--text-secondary)] mt-1">
            Vista settimanale allocazioni per feature e membro
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-[var(--text-secondary)] mb-4">
            Nessun membro nel team. Vai alla sezione Team per aggiungerne!
          </p>
          <a href="/team" className="btn btn-primary inline-block">
            Vai a Team
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-8 pb-4">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Timeline</h2>
        <p className="text-[var(--text-secondary)] mt-1">
          Vista settimanale allocazioni per feature e membro
        </p>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto px-8 pb-8">
        <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden">
          <TimelineHeader weeks={weeks} sprintSpans={sprintSpans} />

          {features.map((feature) => (
            <FeatureGroup
              key={feature.id}
              feature={feature}
              members={members}
              weeks={weeks}
              allocations={allocations}
              timeOffs={timeOffs}
              isCollapsed={!!collapsedFeatures[feature.id]}
              onToggle={() => toggleFeatureCollapse(feature.id)}
              onAllocationChange={upsertAllocation}
              onTimeOffChange={upsertTimeOff}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
