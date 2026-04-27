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
  days: number // 0-5, step 0.5
  created_at?: string
}

export interface FeatureMember {
  id: string
  feature_id: string
  member_id: string
  created_at?: string
}

// UI Helper Types
export interface WeekColumn {
  weekStart: string // ISO date string (Monday)
  label: string // e.g. "22 Apr"
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
  featureMembers: FeatureMember[]

  // UI State
  collapsedFeatures: Record<string, boolean>

  // Setters
  setRoles: (roles: Role[]) => void
  setMembers: (members: TeamMember[]) => void
  setSprints: (sprints: Sprint[]) => void
  setFeatures: (features: Feature[]) => void
  setAllocations: (allocations: Allocation[]) => void
  setTimeOffs: (timeOffs: TimeOff[]) => void
  setKTLOAllocations: (ktloAllocations: KTLOAllocation[]) => void
  setFeatureMembers: (featureMembers: FeatureMember[]) => void
  toggleFeatureCollapse: (featureId: string) => void
}
