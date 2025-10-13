import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

type ProtectedRouteProps = {
  children: React.ReactNode
  roles?: string[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0) {
    const userRole = user?.role
    const allowed = userRole ? roles.includes(String(userRole)) : false
    if (!allowed) return <Navigate to="/" replace />
  }

  return <>{children}</>
}
