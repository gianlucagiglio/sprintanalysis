import { create } from 'zustand'

interface Team {
  id: string
  name: string
}

interface TeamStore {
  currentTeamId: string | null
  teams: Team[]
  setCurrentTeamId: (id: string | null) => void
  initialize: (teams: Team[]) => void
}

const STORAGE_KEY = 'retroboard_currentTeamId'

export const useTeamStore = create<TeamStore>((set) => ({
  currentTeamId: null,
  teams: [],

  setCurrentTeamId: (id) => {
    set({ currentTeamId: id })
    if (id) {
      localStorage.setItem(STORAGE_KEY, id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  initialize: (teams) => {
    set({ teams })

    if (teams.length === 0) {
      set({ currentTeamId: null })
      return
    }

    // Ripristina da localStorage se disponibile
    const savedTeamId = localStorage.getItem(STORAGE_KEY)
    if (savedTeamId && teams.some(t => t.id === savedTeamId)) {
      set({ currentTeamId: savedTeamId })
    } else {
      // Default: auto-seleziona il primo team
      // (super admin può poi selezionare "Tutti i team" manualmente)
      set({ currentTeamId: teams[0].id })
      localStorage.setItem(STORAGE_KEY, teams[0].id)
    }
  }
}))
