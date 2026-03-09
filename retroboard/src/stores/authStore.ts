import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

type AuthState = {
  user: Profile | null
  loading: boolean
  initialize: () => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        set({ user: profile })
      } else {
        set({ user: null })
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
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
