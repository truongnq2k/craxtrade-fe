import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [glitchText, setGlitchText] = useState('')
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])

  // Glitch effect for title
  useEffect(() => {
    const titles = ['CRAXTRADING', 'CRX_TRADING', 'CRA_XTRADING', 'CRAXTRADING']
    let index = 0
    
    const interval = setInterval(() => {
      setGlitchText(titles[index % titles.length])
      index++
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Check if user is logged in and redirect to dashboard
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

  return (
    <div className="w-full bg-black text-green-400 overflow-hidden relative">
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
      <div className="relative z-10">
        {/* Terminal Header */}
        <header className="border-b border-green-500/30 bg-black/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center font-mono text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500">●</span>
                  <span className="text-yellow-500">●</span>
                  <span className="text-green-500">●</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-green-400 font-bold">[CRX@TRADING]$</span>
                  <span className="text-green-300 animate-pulse">_</span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-1 border border-green-500 text-green-400 hover:bg-green-500/10 hover:text-green-300 font-mono text-sm transition-all duration-300"
                >
                  [ACCESS]
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-1 bg-green-500 text-black font-mono text-sm hover:bg-green-400 transition-all duration-300"
                >
                  [INITIATE]
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Terminal Style */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-7xl mx-auto text-center">
            {/* Terminal Window */}
            <div className="bg-black/90 border border-green-500/50 rounded-lg p-8 mb-8 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-green-400 font-mono text-xs">terminal@craxtrading</span>
              </div>
              
              <div className="text-left font-mono text-sm space-y-2">
                <div className="text-green-500">
                  <span className="text-green-400">$</span> ./init_trading_system.sh
                </div>
                <div className="text-yellow-400 animate-pulse">
                  <span className="text-green-400">$</span> Initializing quantum trading protocols...
                </div>
                <div className="text-green-400">
                  <span className="text-green-400">$</span> Neural network connections established
                </div>
                <div className="text-green-400">
                  <span className="text-green-400">$</span> Market analysis algorithms loaded
                </div>
                <div className="text-green-400">
                  <span className="text-green-400">$</span> Risk management protocols activated
                </div>
                <div className="text-green-400 animate-pulse">
                  <span className="text-green-400">$</span> System ready. Welcome to <span className="text-green-300 font-bold">{glitchText}</span>
                </div>
              </div>
            </div>

            {/* Main Title with Glitch */}
            <h1 className="text-6xl md:text-8xl font-black mb-6 relative">
              <span className="text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 20px #00ff00, 0 0 40px #00ff00' }}>
                CRAX
                <span className="text-green-300">TRADING</span>
              </span>
              <div className="absolute inset-0 text-red-500 font-mono tracking-wider opacity-30 animate-pulse" style={{ animationDelay: '0.1s' }}>
                CRAXTRADING
              </div>
              <div className="absolute inset-0 text-blue-500 font-mono tracking-wider opacity-20 animate-pulse" style={{ animationDelay: '0.2s' }}>
                CRAXTRADING
              </div>
            </h1>

            <p className="text-xl text-green-300 mb-8 max-w-4xl mx-auto font-mono">
              &gt; Quantum-powered trading algorithms with military-grade encryption.
              <br />
              &gt; Execute trades at the speed of light. Dominate the market.
            </p>
            
            <div className="flex justify-center space-x-6 mb-16">
              <button 
                onClick={() => navigate('/register')}
                className="group relative px-8 py-4 bg-green-500 text-black font-mono font-bold text-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105"
              >
                <span className="relative z-10">[EXECUTE]</span>
                <div className="absolute inset-0 bg-green-400 group-hover:bg-green-300 transition-all duration-300"></div>
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 border-2 border-green-500 text-green-400 font-mono font-bold text-lg hover:bg-green-500/10 transition-all duration-300 transform hover:scale-105"
              >
                [DEMONSTRATE]
              </button>
            </div>

            {/* Terminal Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono">
                <div className="text-2xl font-bold text-green-400 mb-2 animate-pulse">
                  <span className="text-green-500">&gt;</span> 13,337
                </div>
                <div className="text-green-300 text-sm">ACTIVE_TRADERS</div>
                <div className="text-green-600 text-xs mt-1">[ONLINE]</div>
              </div>
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono">
                <div className="text-2xl font-bold text-green-400 mb-2 animate-pulse">
                  <span className="text-green-500">&gt;</span> $133.7M
                </div>
                <div className="text-green-300 text-sm">TRADE_VOLUME</div>
                <div className="text-green-600 text-xs mt-1">[ENCRYPTED]</div>
              </div>
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono">
                <div className="text-2xl font-bold text-green-400 mb-2 animate-pulse">
                  <span className="text-green-500">&gt;</span> 99.97%
                </div>
                <div className="text-green-300 text-sm">UPTIME</div>
                <div className="text-green-600 text-xs mt-1">[QUANTUM]</div>
              </div>
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono">
                <div className="text-2xl font-bold text-green-400 mb-2 animate-pulse">
                  <span className="text-green-500">&gt;</span> 0.13ms
                </div>
                <div className="text-green-300 text-sm">LATENCY</div>
                <div className="text-green-600 text-xs mt-1">[HYPERFAST]</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Matrix */}
        <section className="py-20 bg-black/90 border-t border-green-500/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-4xl font-black text-center text-green-400 mb-12 font-mono">
              &gt; NEURAL_FEATURES.exe
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono hover:border-green-400 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
                <div className="text-green-400 text-2xl mb-3">🤖</div>
                <h4 className="text-xl font-bold text-green-300 mb-2">[AI_BOTS]</h4>
                <p className="text-green-500 text-sm">Self-learning trading bots with quantum neural networks</p>
                <div className="text-green-600 text-xs mt-2 animate-pulse">STATUS: ACTIVE</div>
              </div>
              
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono hover:border-green-400 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
                <div className="text-green-400 text-2xl mb-3">📊</div>
                <h4 className="text-xl font-bold text-green-300 mb-2">[SIGNALS]</h4>
                <p className="text-green-500 text-sm">Real-time market signals with military-grade encryption</p>
                <div className="text-green-600 text-xs mt-2 animate-pulse">STATUS: ENCRYPTED</div>
              </div>
              
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono hover:border-green-400 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
                <div className="text-green-400 text-2xl mb-3">🔒</div>
                <h4 className="text-xl font-bold text-green-300 mb-2">[FIREWALL]</h4>
                <p className="text-green-500 text-sm">Quantum encryption protecting your assets</p>
                <div className="text-green-600 text-xs mt-2 animate-pulse">STATUS: MAXIMUM</div>
              </div>
              
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono hover:border-green-400 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
                <div className="text-green-400 text-2xl mb-3">📈</div>
                <h4 className="text-xl font-bold text-green-300 mb-2">[ANALYTICS]</h4>
                <p className="text-green-500 text-sm">Advanced portfolio tracking with predictive analysis</p>
                <div className="text-green-600 text-xs mt-2 animate-pulse">STATUS: PREDICTIVE</div>
              </div>
              
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono hover:border-green-400 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
                <div className="text-green-400 text-2xl mb-3">⚡</div>
                <h4 className="text-xl font-bold text-green-300 mb-2">[SPEED]</h4>
                <p className="text-green-500 text-sm">Lightning-fast execution at nanosecond speeds</p>
                <div className="text-green-600 text-xs mt-2 animate-pulse">STATUS: OVERCLOCKED</div>
              </div>
              
              <div className="bg-black/80 border border-green-500/50 rounded-lg p-6 font-mono hover:border-green-400 transition-all duration-300 hover:shadow-green-500/20 hover:shadow-lg">
                <div className="text-green-400 text-2xl mb-3">💀</div>
                <h4 className="text-xl font-bold text-green-300 mb-2">[DARK_MODE]</h4>
                <p className="text-green-500 text-sm">Anonymous trading with untraceable transactions</p>
                <div className="text-green-600 text-xs mt-2 animate-pulse">STATUS: SHADOW</div>
              </div>
            </div>
          </div>
        </section>

        {/* Terminal CTA */}
        <section className="py-20 bg-gradient-to-b from-transparent via-green-500/10 to-transparent">
          <div className="w-full text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <div className="bg-black/90 border border-green-500/50 rounded-lg p-8">
              <h3 className="text-3xl font-black text-green-400 mb-4 font-mono">
                &gt; Ready to hack the market?
              </h3>
              <p className="text-green-300 mb-6 font-mono">
                Join the underground elite. Trade like a ghost. Win like a god.
              </p>
              <button 
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-green-500 text-black font-mono font-bold text-lg hover:bg-green-400 transition-all duration-300 transform hover:scale-105"
              >
                [INITIATE_PROTOCOL]
              </button>
            </div>
          </div>
        </section>

        {/* Footer Terminal */}
        <footer className="bg-black border-t border-green-500/30 py-8">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="font-mono text-sm text-green-400">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-green-500">$</span> cat /etc/craxtrading/version
                  <br />
                  <span className="text-green-600">v2.0.1337 | QUANTUM_EDITION</span>
                </div>
                <div className="text-right">
                  <span className="text-green-500">$</span> netstat -an | grep :443
                  <br />
                  <span className="text-green-600">ESTABLISHED | ENCRYPTED</span>
                </div>
              </div>
              <div className="text-center mt-4 text-green-600">
                &copy; 2024 CraxTrading | Trading in shadows
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes glitch {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }
        
        .glitch {
          animation: glitch 2s infinite;
        }
      `}</style>
    </div>
  )
}
