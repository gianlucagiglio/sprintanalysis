import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

type AuthState = {
  user: Profile | null
  loading: boolean
  isSuperAdmin: () => boolean
  initialize: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (newPassword: string) => Promise<void>
}

let _initialized = false
let _authSubscription: { data: { subscription: { unsubscribe: () => void } } } | null = null
let _visibilityHandler: (() => Promise<void>) | null = null

// Export reset function for logout
export const resetAuthInitialization = () => {
  _initialized = false

  // Cleanup auth subscription
  if (_authSubscription) {
    _authSubscription.data.subscription.unsubscribe()
    _authSubscription = null
  }

  // Cleanup visibility listener
  if (_visibilityHandler) {
    document.removeEventListener('visibilitychange', _visibilityHandler)
    _visibilityHandler = null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,

  isSuperAdmin: () => {
    const { user } = get()
    return user?.is_super_admin === true
  },

  initialize: async () => {
    // Guard: register listeners only once
    if (_initialized) return
    _initialized = true

    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      // 🚫 CHECK BAN: Se utente bannato, logout immediato
      if (profile?.is_banned) {
        await supabase.auth.signOut()
        set({ user: null, loading: false })
        alert(
          '🚫 Account Sospeso\n\n' +
          'Il tuo account è stato sospeso dall\'amministratore.\n' +
          'Contatta il supporto per maggiori informazioni.'
        )
        return
      }

      set({ user: profile, loading: false })
    } else {
      set({ loading: false })
    }

    _authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip profile fetch during password recovery to avoid race conditions
      if (event === 'PASSWORD_RECOVERY') {
        return
      }

      if (session?.user) {
        // Only update store if user actually changed (avoid cascading re-renders)
        const currentUser = get().user
        // Skip update only if we already have this user loaded
        if (currentUser?.id === session.user.id && currentUser !== null) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // 🚫 CHECK BAN: Se utente bannato, logout immediato
        if (profile?.is_banned) {
          await supabase.auth.signOut()
          set({ user: null })
          alert(
            '🚫 Account Sospeso\n\n' +
            'Il tuo account è stato sospeso dall\'amministratore.\n' +
            'Contatta il supporto per maggiori informazioni.'
          )
          return
        }

        if (profile) set({ user: profile })
      } else if (event === 'SIGNED_OUT') {
        // Supabase fires SIGNED_OUT also on token refresh failure.
        // Try to recover from storage before clearing user.
        const { data: { session: recovered } } = await supabase.auth.getSession()
        if (!recovered) {
          set({ user: null })
        }
      }
    })

    // Proactively refresh token when tab regains focus
    _visibilityHandler = async () => {
      if (document.visibilityState !== 'visible') return
      const { data: { session } } = await supabase.auth.refreshSession()
      if (session?.user) {
        // Re-fetch profile per controllare ban status
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        // 🚫 CHECK BAN: Se bannato nel frattempo, logout
        if (profile?.is_banned) {
          await supabase.auth.signOut()
          set({ user: null })
          alert(
            '🚫 Account Sospeso\n\n' +
            'Il tuo account è stato sospeso dall\'amministratore.\n' +
            'Contatta il supporto per maggiori informazioni.'
          )
          return
        }

        if (profile) set({ user: profile })
      }
    }
    document.addEventListener('visibilitychange', _visibilityHandler)
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.session) {
      throw new Error('Controlla la tua email per confermare la registrazione, oppure disattiva "Confirm email" in Supabase Dashboard > Authentication > Providers > Email')
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        email,
        avatar_url: null,
        is_super_admin: false,
      })
      if (profileError) {
        throw new Error('Profilo: ' + profileError.message)
      }
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      throw new Error(error.message)
    }
  },

  signOut: async () => {
    set({ user: null })

    // Clear session storage
    sessionStorage.clear()
    localStorage.clear()

    // Close all Supabase realtime channels to prevent locks
    try {
      const channels = supabase.getChannels()
      for (const channel of channels) {
        await supabase.removeChannel(channel)
      }
    } catch (e) {
      // Error handling
    }

    // Reset auth initialization flag
    resetAuthInitialization()

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (e) {
      // Error handling
    }

    // Force reload to clean all state
    window.location.href = '/login'
  },

  requestPasswordReset: async (email: string) => {
    const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${redirectUrl}/reset-password`,
    })
    if (error) {
      throw new Error(error.message)
    }
  },

  resetPassword: async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) {
      throw new Error(error.message)
    }

    // Fetch profile after password reset
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (profile) set({ user: profile })
    }
  },
}))
