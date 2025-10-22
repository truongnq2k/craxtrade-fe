import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../store/auth'
import { useLocation } from 'react-router-dom'

// Helper function to get credit package name from package ID
function getCreditPackageName(packageId: number | undefined): string {
  if (!packageId || packageId === 0) return 'FREE'

  // Map package IDs to names - these should match the backend credit packages
  const packageNames: { [key: number]: string } = {
    1: 'STARTER',
    2: 'PRO',
    3: 'BUSINESS',
    4: 'ENTERPRISE'
  }

  return packageNames[packageId] || 'CUSTOM'
}

export function Header() {
  const { i18n } = useTranslation()
  const { userProfile } = useAuthStore()
  const location = useLocation()
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false)

  // Get current page name from pathname
  const getCurrentPageName = () => {
    const path = location.pathname

    // Admin routes
    if (path.startsWith('/admin')) {
      if (path === '/admin') return 'ADMIN_DASHBOARD'
      if (path.includes('/users')) return 'USER_MANAGEMENT'
      if (path.includes('/exchange-accounts')) return 'EXCHANGE_ACCOUNTS'
      if (path.includes('/bots')) return 'BOT_MANAGEMENT'
      if (path.includes('/signals')) return 'SIGNAL_MANAGEMENT'
      if (path.includes('/trades')) return 'TRADE_MANAGEMENT'
      if (path.includes('/transactions')) return 'TRANSACTION_LOGS'
      if (path.includes('/vouchers')) return 'VOUCHER_MANAGEMENT'
      if (path.includes('/credit-packages')) return 'CREDIT_PACKAGES'
      if (path.includes('/news')) return 'NEWS_MANAGEMENT'
      return 'ADMIN_PANEL'
    }

    // User routes
    if (path.startsWith('/dashboard')) {
      if (path === '/dashboard') return 'USER_DASHBOARD'
      if (path.includes('/accounts')) return 'ACCOUNTS'
      if (path.includes('/create-bot')) return 'CREATE_BOT'
      if (path.includes('/bots')) return 'TRADING_BOTS'
      if (path.includes('/signals')) return 'SIGNALS'
      if (path.includes('/trades')) return 'TRADES'
      if (path.includes('/transactions')) return 'TRANSACTIONS'
      if (path.includes('/vouchers')) return 'VOUCHERS'
      if (path.includes('/news')) return 'NEWS_FEED'
      return 'USER_PANEL'
    }

    return 'CRAXTRADING'
  }

  // Remove time tracking since we don't need countdown timer

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setIsLangDropdownOpen(false)
  }

  
  return (
    <header className="bg-black/90 border-b border-green-500/50 backdrop-blur-sm px-4 sm:px-6 py-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <h1 className="text-xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            CRAXTRADING
          </h1>
        </div>

        <div className="flex items-center gap-4">
  
          {userProfile && (
            <div className="flex items-center gap-4">
              {/* Credits Display */}
              <div className="bg-black/50 border border-green-500/50 rounded px-3 py-2 font-mono">
                <div className="text-green-600 text-xs">CREDITS</div>
                <div className="text-green-400 font-bold text-sm">
                  {userProfile.credits?.toString() || '0'}
                </div>
              </div>

              {/* User Profile */}
              <div className="bg-black/50 border border-green-500/50 rounded px-3 py-2">
                <div className="text-green-600 text-xs">AGENT</div>
                <div className="text-green-400 font-mono text-sm max-w-32 truncate">
                  {userProfile.email}
                </div>
              </div>
            </div>
          )}

          {/* Language Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="flex items-center p-2 bg-black/50 border border-green-500/50 rounded hover:border-green-400 transition-all duration-300"
            >
              {i18n.language === 'en' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                  <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect>
                  <path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#00ff00"></path>
                  <path d="M2.03,7.692c-.008,.103-.03,.202-.03,.308v1.539H31v-1.539c0-.105-.022-.204-.03-.308H2.03Z" fill="#00ff00"></path>
                  <path fill="#00ff00" d="M2 11.385H31V13.231H2z"></path>
                  <path fill="#00ff00" d="M2 15.077H31V16.923000000000002H2z"></path>
                  <path fill="#00ff00" d="M1 18.769H31V20.615H1z"></path>
                  <path d="M1,24c0,.105,.023,.204,.031,.308H30.969c.008-.103,.031-.202,.031-.308v-1.539H1v1.539Z" fill="#00ff00"></path>
                  <path d="M30.362,26.154H1.638c.711,1.108,1.947,1.846,3.362,1.846H27c1.414,0,2.65-.738,3.362-1.846Z" fill="#00ff00"></path>
                  <path d="M5,4h11v12.923H1V8c0-2.208,1.792-4,4-4Z" fill="#001500"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32">
                  <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#00ff00"></rect>
                  <path d="M27,4H5c-2.209,0-4,1.791-4,4V24c0,2.209,1.791,4,4,4H27c2.209,0,4-1.791,4-4V8c0-2.209-1.791-4-4-4Zm3,20c0,1.654-1.346,3-3,3H5c-1.654,0-3-1.346-3-3V8c0-1.654,1.346-3,3-3H27c1.654,0,3,1.346,3,3V24Z" opacity=".15"></path>
                  <path d="M27,5H5c-1.657,0-3,1.343-3,3v1c0-1.657,1.343-3,3-3H27c1.657,0,3,1.343,3,3v-1c0-1.657-1.343-3-3-3Z" fill="#fff" opacity=".2"></path>
                  <path fill="#ff5" d="M18.008 16.366L21.257 14.006 17.241 14.006 16 10.186 14.759 14.006 10.743 14.006 13.992 16.366 12.751 20.186 16 17.825 19.249 20.186 18.008 16.366z"></path>
                </svg>
              )}
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-black/90 border border-green-500/50 rounded-md shadow-lg z-50 backdrop-blur-sm">
                <div className="py-1">
                  <button
                    onClick={() => changeLanguage('en')}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-green-500/20 transition-colors font-mono ${i18n.language === 'en' ? 'bg-green-500/20 text-green-300' : 'text-green-400'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" className="mr-2">
                      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#fff"></rect>
                      <path d="M1.638,5.846H30.362c-.711-1.108-1.947-1.846-3.362-1.846H5c-1.414,0-2.65,.738-3.362,1.846Z" fill="#00ff00"></path>
                    </svg>
                    English
                  </button>
                  <button
                    onClick={() => changeLanguage('vi')}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-green-500/20 transition-colors font-mono ${i18n.language === 'vi' ? 'bg-green-500/20 text-green-300' : 'text-green-400'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" className="mr-2">
                      <rect x="1" y="4" width="30" height="24" rx="4" ry="4" fill="#00ff00"></rect>
                    </svg>
                    Tiếng Việt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
