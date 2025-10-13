import { Navigate, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BlankLayout } from './components/BlankLayout'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuthStore } from './store/auth'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { UserDashboardPage } from './pages/UserDashboardPage'
import { UserExchangeAccountsPage } from './pages/UserExchangeAccountsPage'
import { UserBotsPage } from './pages/UserBotsPage'
import { UserSignalsPage } from './pages/UserSignalsPage'
import { UserTradesPage } from './pages/UserTradesPage'
import { UserTransactionsPage } from './pages/UserTransactionsPage'
import { UserVouchersPage } from './pages/UserVouchersPage'
import { UserNewsPage } from './pages/UserNewsPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { AdminExchangeAccountsPage } from './pages/AdminExchangeAccountsPage'
import { AdminBotsPage } from './pages/AdminBotsPage'
import { AdminSignalsPage } from './pages/AdminSignalsPage'
import { AdminTradesPage } from './pages/AdminTradesPage'
import { AdminTransactionsPage } from './pages/AdminTransactionsPage'
import { AdminVouchersPage } from './pages/AdminVouchersPage'
import { AdminNewsPage } from './pages/AdminNewsPage'
import { AdminCreditPackagesPage } from './pages/AdminCreditPackagesPage'
import { useEffect } from 'react'

function AppContent() {
  const { hydrateFromStorage } = useAuthStore()
  
  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  return <RouterProvider router={router} />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardLayout><Outlet /></DashboardLayout>,
    children: [
      { index: true, element: <HomePage /> },
      // User Dashboard Routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <UserDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/accounts',
        element: (
          <ProtectedRoute>
            <UserExchangeAccountsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/bots',
        element: (
          <ProtectedRoute>
            <UserBotsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/signals',
        element: (
          <ProtectedRoute>
            <UserSignalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/trades',
        element: (
          <ProtectedRoute>
            <UserTradesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/transactions',
        element: (
          <ProtectedRoute>
            <UserTransactionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/vouchers',
        element: (
          <ProtectedRoute>
            <UserVouchersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/news',
        element: (
          <ProtectedRoute>
            <UserNewsPage />
          </ProtectedRoute>
        ),
      },
      // Admin Routes
      {
        path: 'admin',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminUsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/exchange-accounts',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminExchangeAccountsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/bots',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminBotsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/signals',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminSignalsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/trades',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminTradesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/transactions',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminTransactionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/vouchers',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminVouchersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/news',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminNewsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/credit-packages',
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminCreditPackagesPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/',
    element: <BlankLayout><Outlet /></BlankLayout>,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default AppContent
