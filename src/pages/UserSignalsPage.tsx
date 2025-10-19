import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { signalService, type Signal } from '../services/signal.service'
import { SymbolTimeframeModal } from '../components/SymbolTimeframeModal'
import { ReasoningModal } from '../components/ReasoningModal'

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function UserSignalsPage() {
  const { user } = useAuthStore()
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signalSummary, setSignalSummary] = useState<{
    totalSignals?: number
    averageConfidence?: number
    totalCreditsUsed?: number
    signalsByType?: Record<string, number>
  } | null>(null)
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])
  const [filterType, setFilterType] = useState<string>('')
  const [filterSymbol, setFilterSymbol] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT')
  const [selectedTimeframe, setSelectedTimeframe] = useState('H1')
  const [selectedSignalReasoning, setSelectedSignalReasoning] = useState<string | null>(null)

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 30)
    const drops = Array(columns).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      speed: Math.random() * 2.5 + 0.5
    }))
    setMatrixRain(drops)

    const animateRain = () => {
      setMatrixRain(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > window.innerHeight ? 0 : drop.y + drop.speed
      })))
    }

    const interval = setInterval(animateRain, 60)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadSignals()
    loadSignalSummary()
  }, [user])

  async function loadSignals() {
    try {
      setLoading(true)
      setError(null)
      
      if (!user?.sub && !user?.userId) {
        setError('[ERROR] Thiếu userId trong token')
        return
      }
      const userId = user?.sub || user?.userId
      if (!userId) {
        setError('[ERROR] Thiếu userId trong token')
        return
      }
      
      const response = await signalService.getUserSignals(userId)
      // Handle different response formats safely
      if (response && typeof response === 'object' && 'data' in response) {
        setSignals(Array.isArray(response.data) ? response.data : [])
      } else if (Array.isArray(response)) {
        setSignals(response)
      } else {
        setSignals([])
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] Load failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadSignalSummary() {
    try {
      if (!user?.sub && !user?.userId) return
      
      const userId = user?.sub || user?.userId
      if (!userId) return
      
      const summary = await signalService.getUserSignalSummary(userId)
      setSignalSummary(summary)
    } catch (err: unknown) {
      console.error('Error loading signal summary:', err)
    }
  }

  const handleSymbolTimeframeSelect = (symbol: string, timeframe: string) => {
    setSelectedSymbol(symbol)
    setSelectedTimeframe(timeframe)
  }

  async function handleCreateAISignal() {
    setAiGenerating(true)
    try {
      const userId = user?.sub || user?.userId
      if (!userId) {
        setError('[ERROR] Thiếu userId trong token')
        return
      }

      const response = await signalService.createAISignal(selectedSymbol, selectedTimeframe)
      // Extract signal data from response
      const newSignal = (response && typeof response === 'object' && 'data' in response) 
        ? response.data 
        : response
      
      if (newSignal && typeof newSignal === 'object' && 'id' in newSignal && newSignal.id) {
        setSignals(prev => [newSignal as Signal, ...prev])
      }
      loadSignalSummary()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] AI signal generation failed')
    } finally {
      setAiGenerating(false)
    }
  }

  function getSignalIcon(type: string) {
    switch (type) {
      case 'BUY': return '📈'
      case 'SELL': return '📉'
      case 'HOLD': return '⏸️'
      default: return '📊'
    }
  }

  function getSignalBadgeClass(type: string) {
    switch (type) {
      case 'BUY': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'SELL': return 'bg-red-500/20 text-red-400 border-red-400/50'
      case 'HOLD': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price)
  }

  function getConfidenceColor(confidence: number) {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  function isAIGenerated(signal: Signal) {
    return signal.metadata?.isAIGenerated === true
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [SIGNAL_ANALYZER]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            $ ./quantum_signal_analyzer.sh
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsSymbolModalOpen(true)}
            disabled={aiGenerating}
            className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-mono hover:bg-purple-500/30 transition-all duration-300 rounded disabled:opacity-50"
          >
            {aiGenerating ? '[AI_GENERATING...]' : '[AI_SIGNAL]'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> {error}
        </div>
      )}

      {/* Matrix Rain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {matrixRain.map((drop, i) => (
          <div
            key={i}
            className="absolute text-green-500 text-xs font-mono opacity-50"
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

      {/* Signal Summary Cards */}
      {signalSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./total_signals.sh
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {signalSummary.totalSignals || 0}
            </div>
            <div className="text-green-500 text-xs font-mono">
              Total Signals
            </div>
          </div>

          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./avg_confidence.sh
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {signalSummary.averageConfidence ? Math.round(signalSummary.averageConfidence) : 0}%
            </div>
            <div className="text-blue-500 text-xs font-mono">
              Avg Confidence
            </div>
          </div>

          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./credits_used.sh
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono mb-1">
              {signalSummary.totalCreditsUsed || 0}
            </div>
            <div className="text-red-500 text-xs font-mono">
              Credits Used
            </div>
          </div>

          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./signal_types.sh
            </div>
            <div className="text-lg font-bold text-yellow-400 font-mono mb-1">
              BUY: {signalSummary.signalsByType?.BUY || 0} | 
              SELL: {signalSummary.signalsByType?.SELL || 0} | 
              HOLD: {signalSummary.signalsByType?.HOLD || 0}
            </div>
            <div className="text-yellow-500 text-xs font-mono">
              Signal Distribution
            </div>
          </div>
        </div>
      )}

      {/* Signal List */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
        <div className="text-green-600 text-xs font-mono mb-6 animate-pulse">
          $ ./load_signal_database.sh
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-green-400 text-xs font-mono">FILTER_TYPE</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
          >
            <option value="">All Types</option>
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
            <option value="HOLD">HOLD</option>
          </select>
          
          <label className="text-green-400 text-xs font-mono ml-4">FILTER_SYMBOL</label>
          <input
            type="text"
            value={filterSymbol}
            onChange={(e) => {
              setFilterSymbol(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="BTC/USDT"
            className="bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-green-600">
            <div className="text-sm font-mono animate-pulse">
              $ ./loading_signals.sh
            </div>
            <div className="text-xs mt-2">
              Retrieving signal data from quantum database...
            </div>
          </div>
        )}

        {/* Signal Table */}
        {!loading && signals.length === 0 && (
          <div className="text-center py-12 text-green-600">
            <div className="text-8xl mb-4">📋</div>
            <div className="text-sm font-mono mb-2">
              $ ./no_signals_found.sh
            </div>
            <div className="text-xs mt-2">
              No signals found for the selected criteria
            </div>
          </div>
        )}

        {!loading && signals.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-green-500/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">TYPE</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">SYMBOL</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">ENTRY</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">TARGET</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">STOP</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">CONFIDENCE</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">AI</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">REASONING</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.map((signal) => (
                    <tr key={signal.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${getSignalBadgeClass(signal.type)}`}>
                          {getSignalIcon(signal.type)} {signal.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-300 font-mono font-bold">{signal.symbol || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-mono">{formatPrice(Number(signal.entryPrice) || 0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-300 font-mono">{formatPrice(Number(signal.takeProfit) || 0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-red-400 font-mono">{formatPrice(Number(signal.stopLoss) || 0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${getConfidenceColor(Number(signal.confidence) || 0)}`}>
                          {signal.confidence || 0}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isAIGenerated(signal) && (
                          <span className="text-xs font-mono px-2 py-1 rounded bg-purple-500/20 text-purple-400 border-purple-400/50">
                            AI
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="text-green-300 font-mono text-xs">
                          {signal.reasoning && signal.reasoning.length > 100 ? (
                            <button
                              onClick={() => setSelectedSignalReasoning(signal.reasoning || '')}
                              className="text-blue-400 hover:text-blue-300 underline"
                            >
                              {`${signal.reasoning.substring(0, 100)}...`}
                            </button>
                          ) : (
                            signal.reasoning || 'No reasoning provided'
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-500 font-mono text-xs">
                          {new Date(signal.createdAt).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-green-500/30">
              <div className="text-green-600 text-xs font-mono">
                <div className="animate-pulse">Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, signals.length)}</div>
                <div className="mt-1">Total: {signals.length} signals</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                >
                  [PREV]
                </button>
                <button
                  onClick={() => loadSignals()}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 transition-all duration-300 rounded"
                >
                  [REFRESH]
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 transition-all duration-300 rounded"
                >
                  [NEXT]
                </button>
              </div>
            </div>
          </>
        )}

        {/* Empty State Icon */}
        {!loading && signals.length === 0 && (
          <div className="mt-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-sm font-mono text-green-600">
              NO_SIGNALS_AVAILABLE
            </div>
            <div className="text-xs mt-2 text-green-500">
              Create your first AI signal to get started
            </div>
          </div>
        )}
      </div>

      {/* Reasoning Modal */}
      <ReasoningModal
        reasoning={selectedSignalReasoning}
        onClose={() => setSelectedSignalReasoning(null)}
      />

      {/* Symbol/Timeframe Selection Modal */}
      <SymbolTimeframeModal
        isOpen={isSymbolModalOpen}
        onClose={() => setIsSymbolModalOpen(false)}
        onConfirm={(symbol, timeframe) => {
          handleSymbolTimeframeSelect(symbol, timeframe)
          handleCreateAISignal()
          setIsSymbolModalOpen(false)
        }}
        initialSymbol={selectedSymbol}
        initialTimeframe={selectedTimeframe}
      />
    </div>
  )
}
