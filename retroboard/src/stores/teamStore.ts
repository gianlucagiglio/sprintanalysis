import { create } from 'zustand'

interface Team {
  id: string
  name: string
}

interface TeamStore {
  currentTeamId: string | null
  teams: Team[]
  initialized: boolean
  setCurrentTeamId: (id: string | null) => void
  initialize: (teams: Team[]) => void
}

const STORAGE_KEY = 'retroboard_currentTeamId'

export const useTeamStore = create<TeamStore>((set, get) => ({
  currentTeamId: null,
  teams: [],
  initialized: false,

  setCurrentTeamId: (id) => {
    set({ currentTeamId: id })
    if (id) {
      localStorage.setItem(STORAGE_KEY, id)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  },

  initialize: (teams) => {
    // Se già inizializzato, aggiorna solo la lista teams senza toccare currentTeamId
    if (get().initialized) {
      set({ teams })
      return
    }

    set({ teams, initialized: true })

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
