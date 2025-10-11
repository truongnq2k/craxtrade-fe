import { create } from 'zustand'
import { decodeJwt } from '../utils/jwt'

export type DecodedToken = {
  sub?: string
  exp?: number
  iat?: number
  [key: string]: unknown
}

type AuthState = {
  token: string | null
  user: DecodedToken | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
  hydrateFromStorage: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  login: (token: string) => {
    const decoded = decodeJwt(token)
    localStorage.setItem('auth_token', token)
    set({ token, user: decoded, isAuthenticated: true })
  },
  logout: () => {
    localStorage.removeItem('auth_token')
    set({ token: null, user: null, isAuthenticated: false })
  },
  hydrateFromStorage: () => {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      set({ token: null, user: null, isAuthenticated: false })
      return
    }
    const decoded = decodeJwt(token)
    const nowSeconds = Math.floor(Date.now() / 1000)
    if (decoded?.exp && decoded.exp < nowSeconds) {
      localStorage.removeItem('auth_token')
      set({ token: null, user: null, isAuthenticated: false })
    } else {
      set({ token, user: decoded, isAuthenticated: true })
    }
  },
}))


