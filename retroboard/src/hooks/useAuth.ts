import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const { user, loading, initialize, signIn, signUp, signOut } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return { user, loading, signIn, signUp, signOut }
}
