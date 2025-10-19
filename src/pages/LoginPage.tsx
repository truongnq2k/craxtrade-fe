import { useState, useEffect } from 'react'
import { BlankLayout } from '../components/BlankLayout'
import { useAuthStore } from '../store/auth'
import { authService } from '../services/auth.service'
import { useNavigate } from 'react-router-dom'

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function LoginPage() {
  const { login, user } = useAuthStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 20)
    const drops = Array(columns).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      speed: Math.random() * 2 + 1
    }))
    setMatrixRain(drops)

    const animateRain = () => {
      setMatrixRain(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > window.innerHeight ? 0 : drop.y + drop.speed
      })))
    }

    const interval = setInterval(animateRain, 50)
    return () => clearInterval(interval)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    setLoading(true)
    try {
      const response = await authService.login({ email, password })
      
      // Use the helper method to extract token safely
      const token = authService.extractToken(response)
      login(token)
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <BlankLayout>
      <div className="min-h-screen w-full bg-black text-green-400 overflow-hidden relative">
        {/* Matrix Rain Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {matrixRain.map((drop, i) => (
            <div
              key={i}
              className="absolute text-green-500 text-xs font-mono opacity-70"
              style={{
                left: `${drop.x}px`,
                top: `${drop.y}px`,
                transform: `translateY(${drop.y}px)`
              }}
            >
              {String.fromCharCode(0x30A0 + Math.random() * 96)}
            </div>
          ))}
        </div>

        {/* Scanning Lines */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse"></div>
        
        {/* Glitch Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-green-500/5 animate-pulse"></div>
          <div className="absolute inset-0 bg-red-500/5 opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            {/* Terminal Window */}
            <div className="bg-black/90 border border-green-500/50 rounded-lg p-8 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <span className="text-green-400 font-mono text-xs">terminal@craxtrading</span>
              </div>

              {/* Terminal Command */}
              <div className="text-left font-mono text-sm mb-6">
                <div className="text-green-500">
                  <span className="text-green-400">$</span> ./auth_login.sh
                </div>
                <div className="text-yellow-400 animate-pulse">
                  <span className="text-green-400">$</span> Initiating secure connection...
                </div>
                <div className="text-green-400 animate-pulse">
                  <span className="text-green-400">$</span> Encryption protocols engaged
                </div>
              </div>

              {/* Login Form */}
              <h1 className="text-2xl font-black text-green-400 mb-6 font-mono text-center tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
                [AUTH_ACCESS]
              </h1>

              {error && (
                <div className="text-red-400 text-sm mb-4 font-mono bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
                  <span className="text-red-500">$</span> ERROR: {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <label className="text-green-400 text-xs font-mono mb-1 block">EMAIL_CREDENTIAL</label>
                  <input
                    type="email"
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 focus:shadow-green-500/20 focus:shadow-lg transition-all duration-300"
                    placeholder="user@craxtrading.domain"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-9 text-green-600 text-xs animate-pulse">_</div>
                </div>

                <div className="relative">
                  <label className="text-green-400 text-xs font-mono mb-1 block">SECURITY_KEY</label>
                  <input
                    type="password"
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 focus:shadow-green-500/20 focus:shadow-lg transition-all duration-300"
                    placeholder="••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="absolute right-3 top-9 text-green-600 text-xs animate-pulse">_</div>
                </div>

                <button 
                  disabled={loading} 
                  type="submit" 
                  className="w-full bg-green-500 text-black font-mono font-bold rounded px-4 py-3 hover:bg-green-400 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 disabled:scale-100 relative overflow-hidden group"
                >
                  <span className="relative z-10">
                    {loading ? '[AUTHENTICATING...]' : '[INITIATE_LOGIN]'}
                  </span>
                  <div className="absolute inset-0 bg-green-400 group-hover:bg-green-300 transition-all duration-300"></div>
                </button>
              </form>

              {/* Terminal Footer */}
              <div className="mt-6 text-center">
                <div className="text-green-600 text-xs font-mono">
                  <div className="animate-pulse">System Status: ONLINE</div>
                  <div className="mt-1">Security Level: MAXIMUM</div>
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-4 text-center">
                <span className="text-green-600 text-xs font-mono">
                  New user? {' '}
                  <button 
                    onClick={() => navigate('/register')}
                    className="text-green-400 hover:text-green-300 underline transition-colors duration-200"
                  >
                    ./register.sh
                  </button>
                </span>
              </div>
            </div>

            {/* System Info */}
            <div className="mt-4 text-center">
              <div className="text-green-600 text-xs font-mono opacity-70">
                CRAXTRADING v2.0.1337 | QUANTUM_EDITION
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes glitch {
            0%, 100% { transform: translate(0); }
            20% { transform: translate(-1px, 1px); }
            40% { transform: translate(-1px, -1px); }
            60% { transform: translate(1px, 1px); }
            80% { transform: translate(1px, -1px); }
          }
        `}</style>
      </div>
    </BlankLayout>
  )
}
