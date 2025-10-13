import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'

export function Header() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <Link to="/" className="font-semibold text-xl">Craxtrade</Link>
        
        <nav className="flex items-center gap-4 text-sm text-gray-600">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
              <div className="relative group">
                <button className="hover:text-gray-900 flex items-center gap-1">
                  Quản lý
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link to="/dashboard/accounts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tài khoản sàn</Link>
                    <Link to="/dashboard/bots" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bot Trading</Link>
                    <Link to="/dashboard/signals" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tín hiệu</Link>
                    <Link to="/dashboard/trades" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Giao dịch</Link>
                    <Link to="/dashboard/transactions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Lịch sử</Link>
                    <Link to="/dashboard/vouchers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Voucher</Link>
                    <Link to="/dashboard/news" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tin tức</Link>
                  </div>
                </div>
              </div>
              
              {isAdmin && (
                <div className="relative group">
                  <button className="hover:text-gray-900 flex items-center gap-1">
                    Admin
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                      <Link to="/admin/users" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Người dùng</Link>
                      <Link to="/admin/exchange-accounts" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tài khoản sàn</Link>
                      <Link to="/admin/bots" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Bot Trading</Link>
                      <Link to="/admin/signals" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tín hiệu</Link>
                      <Link to="/admin/trades" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Giao dịch</Link>
                      <Link to="/admin/transactions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Giao dịch credits</Link>
                      <Link to="/admin/vouchers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Voucher</Link>
                      <Link to="/admin/news" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Tin tức</Link>
                      <Link to="/admin/credit-packages" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Gói credits</Link>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {String(user?.name || user?.email || 'User')}
                </span>
                <button 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-900">Đăng nhập</Link>
              <Link to="/register" className="hover:text-gray-900">Đăng ký</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
