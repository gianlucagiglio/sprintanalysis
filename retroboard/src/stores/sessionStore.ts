import { create } from 'zustand'
import type { Session, SessionParticipant, Section, Profile } from '@/types/database'

type ParticipantWithProfile = SessionParticipant & { profiles: Profile }

type SessionState = {
  session: Session | null
  participants: ParticipantWithProfile[]
  sections: Section[]
  setSession: (session: Session | null) => void
  setParticipants: (participants: ParticipantWithProfile[]) => void
  setSections: (sections: Section[]) => void
  updateSession: (updates: Partial<Session>) => void
  updateParticipant: (id: string, updates: Partial<SessionParticipant>) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  session: null,
  participants: [],
  sections: [],
  setSession: (session) => set({ session }),
  setParticipants: (participants) => set({ participants }),
  setSections: (sections) => set({ sections }),
  updateSession: (updates) =>
    set((state) => ({
      session: state.session ? { ...state.session, ...updates } : null,
    })),
  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
}))
