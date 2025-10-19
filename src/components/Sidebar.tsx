import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export function Sidebar() {
  const { isAuthenticated, user, userProfile, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = userProfile?.role === 'ADMIN' || user?.role === 'ADMIN'

  function handleLogout() {
    logout()
    navigate('/')
  }

  if (!isAuthenticated) return null

  return (
    <aside className="w-64 bg-black/90 border-r border-green-500/50 h-screen sticky top-0 hidden lg:block backdrop-blur-sm">
      <div className="p-4 space-y-6">
        {/* Navigation */}
        <nav className="space-y-2">

          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hover:text-green-300 transition-colors">DASHBOARD</span>
          </Link>

          <Link
            to="/dashboard/accounts"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="hover:text-green-300 transition-colors">ACCOUNTS</span>
          </Link>

          <Link
            to="/dashboard/bots"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="hover:text-green-300 transition-colors">TRADING_BOTS</span>
          </Link>

          <Link
            to="/dashboard/signals"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="hover:text-green-300 transition-colors">SIGNALS</span>
          </Link>

          <Link
            to="/dashboard/trades"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hover:text-green-300 transition-colors">TRADES</span>
          </Link>

          <Link
            to="/dashboard/transactions"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hover:text-green-300 transition-colors">TRANSACTIONS</span>
          </Link>

          <Link
            to="/dashboard/vouchers"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2H14a2 2 0 002 2V7a2 2 0 00-2-2H5z" />
            </svg>
            <span className="hover:text-green-300 transition-colors">VOUCHERS</span>
          </Link>

          <Link
            to="/dashboard/news"
            className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
          >
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <span className="hover:text-green-300 transition-colors">NEWS_FEED</span>
          </Link>
        </nav>

        {/* Admin Section */}
        {isAdmin && (
          <>
            <div className="border-t border-green-500/30 pt-4">
              <div className="text-xs font-mono text-green-600 uppercase tracking-wider mb-3 animate-pulse">
                {'>'} ADMIN_ACCESS
              </div>
              <nav className="space-y-2">
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002 2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002 2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="hover:text-green-300 transition-colors">ADMIN_DASHBOARD</span>
                </Link>

                <Link
                  to="/admin/users"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="hover:text-green-300 transition-colors">USER_MANAGEMENT</span>
                </Link>

                <Link
                  to="/admin/credit-packages"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-green-400 font-mono rounded border border-green-500/50 hover:border-green-400 hover:bg-green-500/10 transition-all duration-300"
                >
                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hover:text-green-300 transition-colors">CREDIT_PACKAGES</span>
                </Link>
              </nav>
            </div>
          </>
        )}

        {/* System Info */}
        <div className="border-t border-green-500/30 pt-4">
          <div className="text-xs font-mono text-green-600 space-y-1">
            <div className="animate-pulse">SYSTEM: OPERATIONAL</div>
            <div>VERSION: v2.0.1337</div>
            <div>ENCRYPTION: QUANTUM</div>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-green-500/30 pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 font-mono rounded border border-red-500/50 hover:bg-red-500/10 transition-all duration-300 hover:text-red-300"
          >
            <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 013-3V7a3 3 0 013 3v1" />
            </svg>
            [TERMINATE_SESSION]
          </button>
        </div>
      </div>
    </aside>
  )
}
