import { Navigate, Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { BlankLayout } from './components/BlankLayout'
import { DashboardLayout } from './components/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import './i18n'
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
import { CreateBotPage } from './pages/CreateBotPage'
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

function AppContent() {
  return <RouterProvider router={router} />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <BlankLayout><Outlet /></BlankLayout>,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout><Outlet /></DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <UserDashboardPage /> },
      // User Dashboard Routes
      {
        path: 'accounts',
        element: <UserExchangeAccountsPage />
      },
      {
        path: 'bots',
        element: <UserBotsPage />
      },
      {
        path: 'signals',
        element: <UserSignalsPage />
      },
      {
        path: 'trades',
        element: <UserTradesPage />
      },
      {
        path: 'transactions',
        element: <UserTransactionsPage />
      },
      {
        path: 'vouchers',
        element: <UserVouchersPage />
      },
      {
        path: 'news',
        element: <UserNewsPage />
      },
      {
        path: 'create-bot',
        element: <CreateBotPage />
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute roles={["ADMIN"]}>
        <DashboardLayout><Outlet /></DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      // Admin Routes
      {
        path: 'users',
        element: <AdminUsersPage />
      },
      {
        path: 'exchange-accounts',
        element: <AdminExchangeAccountsPage />
      },
      {
        path: 'bots',
        element: <AdminBotsPage />
      },
      {
        path: 'signals',
        element: <AdminSignalsPage />
      },
      {
        path: 'trades',
        element: <AdminTradesPage />
      },
      {
        path: 'transactions',
        element: <AdminTransactionsPage />
      },
      {
        path: 'vouchers',
        element: <AdminVouchersPage />
      },
      {
        path: 'news',
        element: <AdminNewsPage />
      },
      {
        path: 'credit-packages',
        element: <AdminCreditPackagesPage />
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export default AppContent
