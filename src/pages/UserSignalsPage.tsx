import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { signalService, type Signal } from '../services/signal.service'
import { SymbolTimeframeModal } from '../components/SymbolTimeframeModal'
import { ReasoningModal } from '../components/ReasoningModal'


export function UserSignalsPage() {
  const { user } = useAuthStore()
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [isSymbolModalOpen, setIsSymbolModalOpen] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT')
  const [selectedTimeframe, setSelectedTimeframe] = useState('H1')
  const [selectedSignalReasoning, setSelectedSignalReasoning] = useState<string | null>(null)


  useEffect(() => {
    loadSignals()
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
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] AI signal generation failed')
    } finally {
      setAiGenerating(false)
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



      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-green-600">
          <div className="text-sm font-mono animate-pulse">
            Loading signals...
          </div>
          <div className="text-xs mt-2">
            Please wait while we retrieve your signal data
          </div>
        </div>
      )}

      {/* Signal Table */}
      {!loading && signals.length === 0 && (
        <div className="text-center py-12 text-green-600">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-sm font-mono mb-2">
            No signals found
          </div>
          <div className="text-xs mt-2">
            Create your first AI signal to get started
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
                        {signal.type}
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
