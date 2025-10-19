import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { botService } from '../services/bot.service'
import { exchangeAccountService } from '../services/exchange-account.service'
import { SymbolTimeframeModal } from '../components/SymbolTimeframeModal'

interface CreateBotForm {
  name: string
  botType: string
  symbol: string
  leverage: number
  capital: number
  allocationPct: number
  riskPerTrade: number
  maxDrawdownPct: number
  marginMode: string
  isHedgeMode: boolean
  exchangeAccountId: string
}

interface ExchangeAccount {
  id: string
  userId: string
  exchange: string
  apiKey: string
  apiSecret: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export function CreateBotPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exchangeAccounts, setExchangeAccounts] = useState<ExchangeAccount[]>([])
  const [formData, setFormData] = useState<CreateBotForm>({
    name: '',
    botType: 'SPOT_GRID',
    symbol: 'BTCUSDT',
    leverage: 10,
    capital: 1000,
    allocationPct: 5,
    riskPerTrade: 2,
    maxDrawdownPct: 10,
    marginMode: 'ISOLATED',
    isHedgeMode: false,
    exchangeAccountId: ''
  })
  const [matrixRain, setMatrixRain] = useState<Array<{ x: number; y: number; speed: number }>>([])
  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('H1')

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

  useEffect(() => {
    async function loadExchangeAccounts() {
      try {
        if (!user?.sub && !user?.userId) {
          setError('Thiếu userId trong token')
          return
        }
        const userId = user?.sub || user?.userId
        if (!userId) {
          setError('Thiếu userId trong token')
          return
        }
        
        const accounts = await exchangeAccountService.getAllExchangeAccounts()
        setExchangeAccounts(accounts)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Load failed')
      }
    }
    loadExchangeAccounts()
  }, [user])

  const handleSymbolTimeframeSelect = (symbol: string, timeframe: string) => {
    setFormData(prev => ({ ...prev, symbol }))
    setSelectedTimeframe(timeframe)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const userId = user?.sub || user?.userId
      if (!userId) {
        setError('Thiếu userId trong token')
        return
      }

      const botData = {
        ...formData,
        userId: String(userId),
        config: { timeframe: selectedTimeframe },
        metadata: { timeframe: selectedTimeframe },
        botType: formData.botType as 'SPOT_GRID' | 'FUTURES_GRID' | 'SPOT_DCA' | 'FUTURES_DCA' | 'DUAL_GRID' | 'HEDGE_GRID' | 'INVERTED_HEDGE_GRID' | 'TREND_GRID' | 'PREMIUM',
        leverage: String(formData.leverage),
        capital: String(formData.capital),
        allocationPct: String(formData.allocationPct),
        riskPerTrade: String(formData.riskPerTrade),
        maxDrawdownPct: String(formData.maxDrawdownPct),
        marginMode: formData.marginMode as "CROSS" | "ISOLATED" | undefined
      }

      await botService.createBot(botData)
      navigate('/')
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Create failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black/90 p-8">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto" style={{ animation: 'fadeIn 0.5s ease-in-out' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 15px #00ff00' }}>
              [CREATE_QUANTUM_BOT]
            </h1>
            <p className="text-green-600 text-sm font-mono mt-2">
              $ ./init_quantum_trading_protocol.sh
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/30 transition-all duration-300 rounded"
          >
            [CANCEL]
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3 mb-6">
            <span className="text-red-500">$</span> ERROR: {error}
          </div>
        )}

        {/* Create Bot Form */}
        <div 
          className="bg-black/90 border border-green-500/50 rounded-lg p-8 transform"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <div className="text-green-600 text-xs font-mono mb-6 animate-pulse">
            $ ./configure_quantum_algorithm.sh
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <h3 className="text-green-400 text-lg font-mono tracking-wider">[BASIC_CONFIGURATION]</h3>
              
              <div>
                <label className="text-green-400 text-xs font-mono mb-2 block">BOT_IDENTIFIER</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                  placeholder="Enter quantum bot identifier"
                  required
                />
              </div>

              <div>
                <label className="text-green-400 text-xs font-mono mb-2 block">TRADING_ALGORITHM</label>
                <select
                  value={formData.botType}
                  onChange={(e) => setFormData(prev => ({ ...prev, botType: e.target.value }))}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
                  required
                >
                  <option value="SPOT_GRID">SPOT_GRID</option>
                  <option value="FUTURES_GRID">FUTURES_GRID</option>
                  <option value="SPOT_DCA">SPOT_DCA</option>
                  <option value="FUTURES_DCA">FUTURES_DCA</option>
                  <option value="DUAL_GRID">DUAL_GRID</option>
                  <option value="HEDGE_GRID">HEDGE_GRID</option>
                  <option value="INVERTED_HEDGE_GRID">INVERTED_HEDGE_GRID</option>
                  <option value="TREND_GRID">TREND_GRID</option>
                </select>
              </div>

              <div>
                <label className="text-green-400 text-xs font-mono mb-2 block">TRADING_SYMBOL_TIMEFRAME</label>
                <button
                  type="button"
                  onClick={() => setIsSymbolModalOpen(true)}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono hover:bg-green-500/20 hover:border-green-400 transition-all duration-300 text-left"
                >
                  {formData.symbol} ({selectedTimeframe})
                </button>
                <p className="text-green-600 text-xs mt-1">
                  Click to select trading pair and timeframe
                </p>
              </div>
            </div>

            {/* Financial Configuration */}
            <div className="space-y-4">
              <h3 className="text-green-400 text-lg font-mono tracking-wider">[FINANCIAL_CONFIGURATION]</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-green-400 text-xs font-mono mb-2 block">INITIAL_CAPITAL</label>
                  <input
                    type="number"
                    value={formData.capital}
                    onChange={(e) => setFormData(prev => ({ ...prev, capital: Number(e.target.value) }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                    placeholder="1000"
                    required
                  />
                </div>

                <div>
                  <label className="text-green-400 text-xs font-mono mb-2 block">LEVERAGE</label>
                  <input
                    type="number"
                    value={formData.leverage}
                    onChange={(e) => setFormData(prev => ({ ...prev, leverage: Number(e.target.value) }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                    placeholder="10"
                    min="1"
                    max="125"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-green-400 text-xs font-mono mb-2 block">ALLOCATION_%</label>
                  <input
                    type="number"
                    value={formData.allocationPct}
                    onChange={(e) => setFormData(prev => ({ ...prev, allocationPct: Number(e.target.value) }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                    placeholder="5"
                    min="1"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="text-green-400 text-xs font-mono mb-2 block">RISK_%_PER_TRADE</label>
                  <input
                    type="number"
                    value={formData.riskPerTrade}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskPerTrade: Number(e.target.value) }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                    placeholder="2"
                    min="0.1"
                    max="100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-green-400 text-xs font-mono mb-2 block">MAX_DRAWDOWN_%</label>
                <input
                  type="number"
                  value={formData.maxDrawdownPct}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxDrawdownPct: Number(e.target.value) }))}
                  className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                  placeholder="10"
                  min="1"
                  max="50"
                  required
                />
              </div>
            </div>

            {/* Trading Configuration */}
            <div className="space-y-4">
              <h3 className="text-green-400 text-lg font-mono tracking-wider">[TRADING_CONFIGURATION]</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-green-400 text-xs font-mono mb-2 block">MARGIN_MODE</label>
                  <select
                    value={formData.marginMode}
                    onChange={(e) => setFormData(prev => ({ ...prev, marginMode: e.target.value }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
                    required
                  >
                    <option value="ISOLATED">ISOLATED</option>
                    <option value="CROSSED">CROSSED</option>
                  </select>
                </div>

                <div>
                  <label className="text-green-400 text-xs font-mono mb-2 block">EXCHANGE_ACCOUNT</label>
                  <select
                    value={formData.exchangeAccountId}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchangeAccountId: e.target.value }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
                    required
                  >
                    <option value="">Select exchange account</option>
                    {Array.isArray(exchangeAccounts) && exchangeAccounts.filter(account => account.isActive).map(account => (
                      <option key={account.id} value={account.id}>
                        {account.exchange} ({account.apiKey.substring(0, 8)}...)
                      </option>
                    ))}
                  </select>
                  {exchangeAccounts.length === 0 && (
                    <p className="text-yellow-400 text-xs mt-1">
                      No active exchange accounts available
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isHedgeMode}
                  onChange={(e) => setFormData(prev => ({ ...prev, isHedgeMode: e.target.checked }))}
                  className="w-5 h-5 bg-black/50 border border-green-500/50 rounded text-green-400 focus:ring-green-500 focus:ring-offset-2"
                />
                <label className="text-green-400 text-sm font-mono">HEDGE_MODE</label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-6 border-t border-green-500/50">
              <div className="text-xs font-mono text-green-600">
                <div className="animate-pulse">PROTOCOL: QUANTUM_READY</div>
                <div className="mt-1">ENCRYPTION: AES-256</div>
                <div className="mt-1">STATUS: SECURE</div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 disabled:opacity-50 transition-all duration-300"
              >
                {loading ? '[INITIATING...]' : '[INITIATE_QUANTUM_BOT]'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Symbol/Timeframe Selection Modal */}
      <SymbolTimeframeModal
        isOpen={isSymbolModalOpen}
        onClose={() => setIsSymbolModalOpen(false)}
        onConfirm={handleSymbolTimeframeSelect}
        initialSymbol={formData.symbol}
        initialTimeframe={selectedTimeframe}
      />
    </div>
  )
}
