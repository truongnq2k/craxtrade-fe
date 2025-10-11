import { useEffect } from 'react'
import { useAuthStore } from '../store/auth'

export function useAuth() {
  const { isAuthenticated, user, token, hydrateFromStorage, login, logout } = useAuthStore()

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  return { isAuthenticated, user, token, login, logout }
}


