import { create } from 'zustand'
import { decodeJwt } from '../utils/jwt'
import { apiFetch, ApiPaths } from '../utils/api'
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

      console.log('Fetching user profile from API')
      try {
        const response = await apiFetch<{success: boolean; data: UserProfile}>(ApiPaths.userProfile)
        console.log('API response received:', response)

        if (response.success && response.data) {
          console.log('Setting userProfile in store...')
          set({ userProfile: response.data })
          console.log('User profile set in store:', response.data)
        } else {
          console.log('Invalid API response format, using fallback')
          // Fall back to token data if API response is invalid
          const decoded = state.user
          if (decoded) {
            const fallbackProfileData: UserProfile = {
              id: decoded.sub || decoded.userId || '',
              email: decoded.email || '',
              name: decoded.name || '',
              role: (decoded.role === 'ADMIN' ? 'ADMIN' : 'USER'),
              isActive: true,
              credits: 0,
              creditsPackage: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            set({ userProfile: fallbackProfileData })
          }
        }
      } catch (apiError) {
        console.log('API profile fetch failed, using fallback data from token')
        // Fallback to token data if API fails
        const decoded = state.user
        if (decoded) {
          const fallbackProfileData: UserProfile = {
            id: decoded.sub || decoded.userId || '',
            email: decoded.email || '',
            name: decoded.name || '',
            role: (decoded.role === 'ADMIN' ? 'ADMIN' : 'USER'),
            isActive: true,
            credits: 0,
            creditsPackage: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          set({ userProfile: fallbackProfileData })
          console.log('Using fallback profile data:', fallbackProfileData)
        }
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
