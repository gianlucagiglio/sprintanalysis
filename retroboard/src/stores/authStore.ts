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
}

let _initialized = false

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
      set({ user: profile, loading: false })
    } else {
      set({ loading: false })
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Only update store if user actually changed (avoid cascading re-renders)
        const currentUser = get().user
        if (currentUser?.id === session.user.id) return
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
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
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState !== 'visible') return
      const { data: { session } } = await supabase.auth.refreshSession()
      if (session?.user) {
        // Only re-fetch profile if we somehow lost it
        if (!get().user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          if (profile) set({ user: profile })
        }
      }
    })
  },

  signUp: async (email, password, name) => {
    console.log('[Auth] Attempting signUp for', email)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })
    console.log('[Auth] signUp response:', { data, error })

    if (error) {
      console.error('[Auth] signUp error:', error.message)
      throw new Error(error.message)
    }

    if (!data.session) {
      console.warn('[Auth] No session returned - email confirmation may be enabled')
      throw new Error('Controlla la tua email per confermare la registrazione, oppure disattiva "Confirm email" in Supabase Dashboard > Authentication > Providers > Email')
    }

    if (data.user) {
      console.log('[Auth] User created, inserting profile...')
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        email,
        avatar_url: null,
        is_super_admin: false,
      })
      if (profileError) {
        console.error('[Auth] Profile insert error:', profileError)
        throw new Error('Profilo: ' + profileError.message)
      }
      console.log('[Auth] Profile created successfully')
    }
  },

  signIn: async (email, password) => {
    console.log('[Auth] Attempting signIn for', email)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log('[Auth] signIn response:', { data, error })
    if (error) {
      console.error('[Auth] signIn error:', error.message)
      throw new Error(error.message)
    }
  },

  signOut: async () => {
    set({ user: null })
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (e) {
      console.error('supabase signOut error:', e)
    }
  },
}))
