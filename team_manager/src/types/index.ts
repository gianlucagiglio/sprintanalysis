// Database Types
export interface Role {
  id: string
  name: string
  color: string
  created_at?: string
}

export interface TeamMember {
  id: string
  name: string
  role_id: string
  weekly_capacity: number
  created_at?: string
  // Joined data
  role?: Role
}

export interface Sprint {
  id: string
  name: string
  start_date: string
  end_date: string
  created_at?: string
}

export type FeatureType = 'small_change' | 'strategic'

export interface Feature {
  id: string
  name: string
  sprint_id?: string | null
  color: string
  type: FeatureType
  display_order: number
  created_at?: string
  // Joined data
  sprint?: Sprint
}

export interface Allocation {
  id: string
  feature_id: string
  member_id: string
  week_start: string // YYYY-MM-DD format (Monday)
  days: number // 0-5, step 0.5
  created_at?: string
}

export interface TimeOff {
  id: string
  member_id: string
  week_start: string // YYYY-MM-DD format (Monday)
  days: number // 0-5, step 0.5
  created_at?: string
}

export interface KTLOAllocation {
  id: string
  member_id: string
  week_start: string // YYYY-MM-DD format (Monday)
  days: number // 0-5, step 0.01
  created_at?: string
}

export interface NRTAllocation {
  id: string
  member_id: string
  week_start: string // YYYY-MM-DD format (Monday)
  days: number // 0-5, step 0.01, default 2 on first sprint week
  created_at?: string
}

export interface FeatureMember {
  id: string
  feature_id: string
  member_id: string
  created_at?: string
}

export interface FeatureEstimatedEffort {
  id: string
  feature_id: string
  role_id: string
  estimated_days: number
  created_at?: string
  updated_at?: string
  // Joined data
  role?: Role
}

export type ChangelogType = 'major' | 'minor' | 'patch'

export interface Changelog {
  id: string
  version: string // es. "1.2.0"
  type: ChangelogType
  title: string
  description: string // Markdown
  release_date: string // YYYY-MM-DD
  created_at?: string
}

export interface Settings {
  id: string
  nrt_color: string // Hex color
  ktlo_color: string
  timeoff_color: string
  capacity_color: string
  created_at?: string
  updated_at?: string
}

// UI Helper Types
export interface WeekColumn {
  weekStart: string // ISO date string (Monday)
  label: string // e.g. "22 Apr"
  isCurrentWeek: boolean // true se questa settimana contiene oggi
}

export interface SprintSpan {
  sprint: Sprint
  startCol: number
  colSpan: number
}

export interface CapacityInfo {
  allocated: number
  timeOff: number
  available: number
  total: number
  isOverCapacity: boolean
}

// Store Types
export interface AppStore {
  // Data
  roles: Role[]
  members: TeamMember[]
  sprints: Sprint[]
  features: Feature[]
  allocations: Allocation[]
  timeOffs: TimeOff[]
  ktloAllocations: KTLOAllocation[]
  nrtAllocations: NRTAllocation[]
  featureMembers: FeatureMember[]

  // UI State
  collapsedFeatures: Record<string, boolean>
  collapsedGanttFeatures: Record<string, boolean>
  nrtExpanded: boolean
  ktloExpanded: boolean
  timeOffExpanded: boolean
  capacityRecapExpanded: boolean

  // Cell Selection
  selectedCells: Array<{ featureId: string; memberId: string; weekStart: string; value: number }>
  isSelecting: boolean
  selectionFeatureId: string | null

  // Setters
  setRoles: (roles: Role[]) => void
  setMembers: (members: TeamMember[]) => void
  setSprints: (sprints: Sprint[]) => void
  setFeatures: (features: Feature[]) => void
  setAllocations: (allocations: Allocation[]) => void
  setTimeOffs: (timeOffs: TimeOff[]) => void
  setKTLOAllocations: (ktloAllocations: KTLOAllocation[]) => void
  setNRTAllocations: (nrtAllocations: NRTAllocation[]) => void
  setFeatureMembers: (featureMembers: FeatureMember[]) => void
  toggleFeatureCollapse: (featureId: string) => void
  toggleGanttFeatureCollapse: (featureId: string) => void
  setNRTExpanded: (expanded: boolean) => void
  setKTLOExpanded: (expanded: boolean) => void
  setTimeOffExpanded: (expanded: boolean) => void
  setCapacityRecapExpanded: (expanded: boolean) => void
  expandAllTimeline: () => void
  collapseAllTimeline: () => void
  expandAllGantt: () => void
  collapseAllGantt: () => void
  startCellSelection: (featureId: string) => void
  addCellToSelection: (cell: { featureId: string; memberId: string; weekStart: string; value: number }) => void
  clearCellSelection: () => void
  endCellSelection: () => void
}
