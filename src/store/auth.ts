import { create } from 'zustand'
import { decodeJwt } from '../utils/jwt'
import type { UserProfile } from '../types'

export type DecodedToken = {
  sub?: string
  userId?: string
  exp?: number
  iat?: number
  name?: string
  email?: string
  role?: string
  [key: string]: unknown
}

type AuthState = {
  token: string | null
  user: DecodedToken | null
  userProfile: UserProfile | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  hydrateFromStorage: () => void
  fetchUserProfile: () => Promise<void>
  updateUserProfile: (profile: UserProfile) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  userProfile: null,
  isAuthenticated: false,
  login: (token: string) => {
    try {
      const decoded = decodeJwt(token)
      localStorage.setItem('auth_token', token)
      set({ token, user: decoded, isAuthenticated: true })
      console.log('Login successful, token saved to localStorage')
      
      // Fetch user profile after successful login
      get().fetchUserProfile()
    } catch (error) {
      console.error('Login failed:', error)
      get().logout()
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    set({ token: null, user: null, userProfile: null, isAuthenticated: false })
    console.log('Logout successful, token removed from localStorage')
  },

  hydrateFromStorage: () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.log('No token found in localStorage')
        set({ token: null, user: null, userProfile: null, isAuthenticated: false })
        return
      }

      const decoded = decodeJwt(token)
      const nowSeconds = Math.floor(Date.now() / 1000)
      if (decoded?.exp && decoded.exp < nowSeconds) {
        console.log('Token expired, removing from localStorage')
        localStorage.removeItem('auth_token')
        set({ token: null, user: null, userProfile: null, isAuthenticated: false })
      } else {
        console.log('Token restored from localStorage:', decoded)
        set({ token, user: decoded, isAuthenticated: true })
        
        // Fetch user profile after restoring session
        get().fetchUserProfile()
      }
    } catch (error) {
      console.error('Failed to hydrate from storage:', error)
      localStorage.removeItem('auth_token')
      set({ token: null, user: null, userProfile: null, isAuthenticated: false })
    }
  },

  fetchUserProfile: async () => {
    try {
      const state = get()
      if (!state.token) {
        console.log('No token available for fetching profile')
        return
      }
      
      console.log('Fetching user profile')
      // We'll implement this later when we have the API profile endpoint ready
      // For now, we can use the decoded token data as fallback
      const decoded = state.user
      if (decoded) {
          const profileData: UserProfile = {
            id: decoded.sub || decoded.userId || '',
            email: decoded.email || '',
            name: decoded.name || '',
            role: (decoded.role === 'ADMIN' ? 'ADMIN' : 'USER'),
            isActive: true,
            credits: '0', // Fallback credits
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        set({ userProfile: profileData })
        console.log('User profile fetched successfully:', profileData)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    }
  },

  updateUserProfile: (profile: UserProfile) => {
    set({ userProfile: profile })
    console.log('User profile updated:', profile)
  },
}))

// Auto-hydrate on store creation
useAuthStore.getState().hydrateFromStorage()
