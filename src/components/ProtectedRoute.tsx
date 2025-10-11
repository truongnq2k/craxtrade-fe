import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

type ProtectedRouteProps = {
  children: React.ReactNode
  roles?: string[]
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && roles.length > 0) {
    const userRole = (user as any)?.role as string | undefined
    const allowed = userRole ? roles.includes(userRole) : false
    if (!allowed) return <Navigate to="/" replace />
  }

  return <>{children}</>
}


