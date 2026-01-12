import { createClient, Session, User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Auth features will be disabled.')
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
}

export const authService = {
  /**
   * Sign in with Google OAuth
   */
  signInWithGoogle: async () => {
    if (!supabase) {
      console.error('Supabase not configured')
      return { error: new Error('Supabase not configured') }
    }
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    if (!supabase) return { error: null }
    return supabase.auth.signOut()
  },

  /**
   * Get the current session
   */
  getSession: async () => {
    if (!supabase) return { data: { session: null }, error: null }
    return supabase.auth.getSession()
  },

  /**
   * Get the current user
   */
  getUser: async () => {
    if (!supabase) return { data: { user: null }, error: null }
    return supabase.auth.getUser()
  },

  /**
   * Get the current access token for API calls
   */
  getAccessToken: async (): Promise<string | null> => {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange: (callback: (session: Session | null) => void) => {
    if (!supabase) {
      // Return a no-op unsubscribe function
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session)
    })
  },

  /**
   * Check if auth is configured
   */
  isConfigured: () => !!supabase,
}
