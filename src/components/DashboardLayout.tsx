import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-green-400 overflow-hidden relative">
      {/* Matrix Rain Background (subtle) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse"></div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header with user profile and terminal style */}
        <Header />
        
        {/* Main content with sidebar */}
        <div className="flex-1 flex">
          {/* Sidebar on the left - desktop only */}
          <Sidebar />
          
          <main className="flex-1 p-6 bg-black/80">
            {/* Terminal-style main content area */}
            <div className="bg-black/50 border border-green-500/30 rounded-lg p-6 backdrop-blur-sm">
              {/* Mobile menu button */}
              <div className="lg:hidden mb-4">
                <button className="p-2 border border-green-500/50 rounded text-green-400 hover:border-green-400 transition-all duration-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="relative">
                {/* Terminal prompt indicator */}
                <div className="absolute top-0 left-0 text-green-600 font-mono text-xs animate-pulse">
                  $ ./dashboard_command.sh
                </div>
                
                {/* Main content */}
                <div className="pt-6">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
        
        {/* Terminal-style Footer */}
        <footer className="border-t border-green-500/30 bg-black/90 backdrop-blur-sm">
          <div className="w-full px-6 py-3">
            <div className="flex justify-between items-center text-xs font-mono text-green-600">
              <div className="flex items-center space-x-4">
                <span className="animate-pulse">SYSTEM: OPERATIONAL</span>
                <span>•</span>
                <span>CRAXTRADING v2.0.1337</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>ENCRYPTION: QUANTUM</span>
                <span>•</span>
                <span>STATUS: SECURE</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
