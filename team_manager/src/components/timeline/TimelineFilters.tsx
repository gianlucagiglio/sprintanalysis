import { useState } from 'react'
import { ChevronDown, ChevronRight, Filter, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { Feature, TeamMember, Role } from '@/types'

interface TimelineFiltersProps {
  features: Feature[]
  members: TeamMember[]
  roles: Role[]
  selectedFeatures: string[]
  selectedMembers: string[]
  selectedRoles: string[]
  selectedTypes: string[]
  onFeatureToggle: (featureId: string) => void
  onMemberToggle: (memberId: string) => void
  onRoleToggle: (roleId: string) => void
  onTypeToggle: (type: string) => void
  onSelectAllFeatures: () => void
  onDeselectAllFeatures: () => void
  onSelectAllMembers: () => void
  onDeselectAllMembers: () => void
  onSelectAllRoles: () => void
  onDeselectAllRoles: () => void
  onSelectAllTypes: () => void
  onDeselectAllTypes: () => void
}

export function TimelineFilters({
  features,
  members,
  roles,
  selectedFeatures,
  selectedMembers,
  selectedRoles,
  selectedTypes,
  onFeatureToggle,
  onMemberToggle,
  onRoleToggle,
  onTypeToggle,
  onSelectAllFeatures,
  onDeselectAllFeatures,
  onSelectAllMembers,
  onDeselectAllMembers,
  onSelectAllRoles,
  onDeselectAllRoles,
  onSelectAllTypes,
  onDeselectAllTypes,
}: TimelineFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>('features')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const totalTypes = 2 // strategic e small_change
  const activeFiltersCount =
    (features.length - selectedFeatures.length) +
    (members.length - selectedMembers.length) +
    (roles.length - selectedRoles.length) +
    (totalTypes - selectedTypes.length)

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn flex items-center gap-2 ${
          activeFiltersCount > 0 ? 'btn-primary' : 'btn-secondary'
        }`}
      >
        <Filter size={16} />
        Filters
        {activeFiltersCount > 0 && (
          <span className="bg-white text-[var(--accent-primary)] text-xs font-bold px-1.5 py-0.5 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg shadow-2xl z-40 max-h-[500px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text-primary)]">Timeline Filters</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Feature Filter */}
              <div className="border-b border-[var(--border-primary)]">
                <button
                  onClick={() => toggleSection('features')}
                  className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSection === 'features' ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    <span className="font-medium">Features</span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      ({selectedFeatures.length}/{features.length})
                    </span>
                  </div>
                </button>

                {expandedSection === 'features' && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={onSelectAllFeatures}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-xs text-[var(--text-tertiary)]">•</span>
                      <button
                        onClick={onDeselectAllFeatures}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Deselect all
                      </button>
                    </div>

                    {features.map((feature) => (
                      <label
                        key={feature.id}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-hover)] min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFeatures.includes(feature.id)}
                          onChange={() => onFeatureToggle(feature.id)}
                          className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                          aria-label={`Show/hide feature ${feature.name}`}
                        />
                        <Badge label={feature.name} color={feature.color} small maxWidth="180px" />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Members Filter */}
              <div className="border-b border-[var(--border-primary)]">
                <button
                  onClick={() => toggleSection('members')}
                  className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSection === 'members' ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    <span className="font-medium">Members</span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      ({selectedMembers.length}/{members.length})
                    </span>
                  </div>
                </button>

                {expandedSection === 'members' && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={onSelectAllMembers}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-xs text-[var(--text-tertiary)]">•</span>
                      <button
                        onClick={onDeselectAllMembers}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Deselect all
                      </button>
                    </div>

                    {members.map((member) => (
                      <label
                        key={member.id}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-hover)] min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => onMemberToggle(member.id)}
                          className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                          aria-label={`Show/hide member ${member.name}`}
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{member.name}</span>
                          {member.role && (
                            <Badge label={member.role.name} color={member.role.color} small />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles Filter */}
              <div className="border-b border-[var(--border-primary)]">
                <button
                  onClick={() => toggleSection('roles')}
                  className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSection === 'roles' ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    <span className="font-medium">Roles</span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      ({selectedRoles.length}/{roles.length})
                    </span>
                  </div>
                </button>

                {expandedSection === 'roles' && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={onSelectAllRoles}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-xs text-[var(--text-tertiary)]">•</span>
                      <button
                        onClick={onDeselectAllRoles}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Deselect all
                      </button>
                    </div>

                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-hover)] min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRoles.includes(role.id)}
                          onChange={() => onRoleToggle(role.id)}
                          className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                          aria-label={`Filter by role ${role.name}`}
                        />
                        <Badge label={role.name} color={role.color} small />
                      </label>
                    ))}

                    <p className="text-xs text-[var(--text-tertiary)] mt-3 italic">
                      Filtering by role shows only members with that role
                    </p>
                  </div>
                )}
              </div>

              {/* Type Filter */}
              <div>
                <button
                  onClick={() => toggleSection('types')}
                  className="w-full p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedSection === 'types' ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                    <span className="font-medium">Type</span>
                    <span className="text-xs text-[var(--text-tertiary)]">
                      ({selectedTypes.length}/2)
                    </span>
                  </div>
                </button>

                {expandedSection === 'types' && (
                  <div className="px-4 pb-4 space-y-2">
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={onSelectAllTypes}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Select all
                      </button>
                      <span className="text-xs text-[var(--text-tertiary)]">•</span>
                      <button
                        onClick={onDeselectAllTypes}
                        className="text-xs text-[var(--accent-primary)] hover:underline"
                      >
                        Deselect all
                      </button>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-hover)] min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes('strategic')}
                        onChange={() => onTypeToggle('strategic')}
                        className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                        aria-label="Show/hide strategic features"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🎯 Strategic</span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          Long-term features
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-hover)] min-h-[44px]">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes('small_change')}
                        onChange={() => onTypeToggle('small_change')}
                        className="w-5 h-5 accent-[var(--accent-primary)] cursor-pointer"
                        aria-label="Show/hide small changes"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🔧 Small Change</span>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          Minor changes and fixes
                        </span>
                      </div>
                    </label>

                    <p className="text-xs text-[var(--text-tertiary)] mt-3 italic">
                      Filter features by activity type
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
