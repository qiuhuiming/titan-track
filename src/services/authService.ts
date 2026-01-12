const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000'
const TOKEN_KEY = 'titan_track_token'
const USER_KEY = 'titan_track_user'

export interface AuthUser {
  id: string
  email: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
}

interface TokenResponse {
  access_token: string
  token_type: string
}

interface AuthError {
  detail: string
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = (await response.json()) as AuthError
        return { error: new Error(error.detail || 'Registration failed') }
      }

      const data = (await response.json()) as TokenResponse
      localStorage.setItem(TOKEN_KEY, data.access_token)

      // Fetch user info
      await authService.fetchUser()

      return { error: null }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Registration failed') }
    }
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<{ error: Error | null }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = (await response.json()) as AuthError
        return { error: new Error(error.detail || 'Login failed') }
      }

      const data = (await response.json()) as TokenResponse
      localStorage.setItem(TOKEN_KEY, data.access_token)

      // Fetch user info
      await authService.fetchUser()

      return { error: null }
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Login failed') }
    }
  },

  /**
   * Fetch current user info from API
   */
  fetchUser: async (): Promise<AuthUser | null> => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        void authService.signOut()
        return null
      }

      const user = (await response.json()) as AuthUser
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      return user
    } catch {
      void authService.signOut()
      return null
    }
  },

  /**
   * Sign out the current user
   */
  signOut: (): { error: null } => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    return { error: null }
  },

  /**
   * Get the current user from localStorage
   */
  getUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as AuthUser
    } catch {
      return null
    }
  },

  /**
   * Get the current access token for API calls
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  /**
   * Initialize auth state (check existing token)
   */
  initialize: async (): Promise<AuthUser | null> => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return null

    // Verify token is still valid by fetching user
    return authService.fetchUser()
  },
}
