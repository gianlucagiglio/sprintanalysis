import { create } from 'zustand'
import type { AppStore } from '@/types'

export const useAppStore = create<AppStore>((set) => ({
  // Data
  roles: [],
  members: [],
  sprints: [],
  features: [],
  allocations: [],
  timeOffs: [],

  // UI State
  collapsedFeatures: {},

  // Setters
  setRoles: (roles) => set({ roles }),
  setMembers: (members) => set({ members }),
  setSprints: (sprints) => set({ sprints }),
  setFeatures: (features) => set({ features }),
  setAllocations: (allocations) => set({ allocations }),
  setTimeOffs: (timeOffs) => set({ timeOffs }),

  toggleFeatureCollapse: (featureId) =>
    set((state) => ({
      collapsedFeatures: {
        ...state.collapsedFeatures,
        [featureId]: !state.collapsedFeatures[featureId],
      },
    })),
}))
