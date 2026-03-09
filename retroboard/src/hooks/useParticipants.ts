import { useSessionStore } from '@/stores/sessionStore'
import { useAuthStore } from '@/stores/authStore'

export function useParticipants() {
  const participants = useSessionStore((s) => s.participants)
  const user = useAuthStore((s) => s.user)

  const totalParticipants = participants.length
  const doneCount = participants.filter((p) => p.is_done).length
  const allDone = totalParticipants > 0 && doneCount === totalParticipants
  const currentUserParticipant = participants.find((p) => p.user_id === user?.id)
  const isDone = currentUserParticipant?.is_done ?? false

  return { participants, totalParticipants, doneCount, allDone, isDone, currentUserParticipant }
}
