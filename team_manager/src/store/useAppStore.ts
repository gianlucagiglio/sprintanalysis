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
  ktloAllocations: [],
  nrtAllocations: [],
  featureMembers: [],

  // UI State
  collapsedFeatures: {},
  collapsedGanttFeatures: {},
  nrtExpanded: true,
  ktloExpanded: true,
  timeOffExpanded: true,
  capacityRecapExpanded: false,

  // Cell Selection
  selectedCells: [],
  isSelecting: false,
  selectionFeatureId: null,

  // Setters
  setRoles: (roles) => set({ roles }),
  setMembers: (members) => set({ members }),
  setSprints: (sprints) => set({ sprints }),
  setFeatures: (features) => set({ features }),
  setAllocations: (allocations) => set({ allocations }),
  setTimeOffs: (timeOffs) => set({ timeOffs }),
  setKTLOAllocations: (ktloAllocations) => set({ ktloAllocations }),
  setNRTAllocations: (nrtAllocations) => set({ nrtAllocations }),
  setFeatureMembers: (featureMembers) => set({ featureMembers }),

  toggleFeatureCollapse: (featureId) =>
    set((state) => ({
      collapsedFeatures: {
        ...state.collapsedFeatures,
        [featureId]: !state.collapsedFeatures[featureId],
      },
    })),

  toggleGanttFeatureCollapse: (featureId) =>
    set((state) => ({
      collapsedGanttFeatures: {
        ...state.collapsedGanttFeatures,
        [featureId]: !state.collapsedGanttFeatures[featureId],
      },
    })),

  setNRTExpanded: (expanded) => set({ nrtExpanded: expanded }),
  setKTLOExpanded: (expanded) => set({ ktloExpanded: expanded }),
  setTimeOffExpanded: (expanded) => set({ timeOffExpanded: expanded }),
  setCapacityRecapExpanded: (expanded) => set({ capacityRecapExpanded: expanded }),

  expandAllTimeline: () =>
    set((state) => {
      const expandedFeatures: Record<string, boolean> = {}
      state.features.forEach((f) => {
        expandedFeatures[f.id] = false // false = expanded
      })
      return {
        collapsedFeatures: expandedFeatures,
        nrtExpanded: true,
        ktloExpanded: true,
        timeOffExpanded: true,
        capacityRecapExpanded: true,
      }
    }),

  collapseAllTimeline: () =>
    set((state) => {
      const collapsedFeatures: Record<string, boolean> = {}
      state.features.forEach((f) => {
        collapsedFeatures[f.id] = true // true = collapsed
      })
      return {
        collapsedFeatures: collapsedFeatures,
        nrtExpanded: false,
        ktloExpanded: false,
        timeOffExpanded: false,
        capacityRecapExpanded: false,
      }
    }),

  expandAllGantt: () =>
    set((state) => {
      const expandedFeatures: Record<string, boolean> = {}
      state.features.forEach((f) => {
        expandedFeatures[f.id] = false // false = expanded
      })
      return {
        collapsedGanttFeatures: expandedFeatures,
      }
    }),

  collapseAllGantt: () =>
    set((state) => {
      const collapsedFeatures: Record<string, boolean> = {}
      state.features.forEach((f) => {
        collapsedFeatures[f.id] = true // true = collapsed
      })
      return {
        collapsedGanttFeatures: collapsedFeatures,
      }
    }),

  // Cell Selection Methods
  startCellSelection: (featureId) =>
    set({
      isSelecting: true,
      selectionFeatureId: featureId,
      selectedCells: [],
    }),

  addCellToSelection: (cell) =>
    set((state) => {
      // Solo se stiamo selezionando e la cella è della stessa feature
      if (!state.isSelecting || state.selectionFeatureId !== cell.featureId) {
        return state
      }

      // Verifica se la cella è già selezionata
      const exists = state.selectedCells.some(
        (c) =>
          c.featureId === cell.featureId &&
          c.memberId === cell.memberId &&
          c.weekStart === cell.weekStart
      )

      if (exists) {
        return state
      }

      return {
        selectedCells: [...state.selectedCells, cell],
      }
    }),

  clearCellSelection: () =>
    set({
      selectedCells: [],
      isSelecting: false,
      selectionFeatureId: null,
    }),

  endCellSelection: () =>
    set({
      isSelecting: false,
    }),
}))
