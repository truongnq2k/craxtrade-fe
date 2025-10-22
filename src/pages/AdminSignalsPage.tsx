import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'

type Signal = {
  id: string
  symbol: string
  type: string
  direction?: string
  entryPrice?: number
  targetPrice?: number
  stopLoss?: number
  confidence: number
  reasoning?: string
  isActive: boolean
  userId: string
  createdAt: string
}

export function AdminSignalsPage() {
  const [items, setItems] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalSignals: number; buySignals: number; sellSignals: number; holdSignals: number; avgConfidence: string; activeSignals: number } | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    direction: '',
    symbol: ''
  })

  useEffect(() => {
    loadSignals()
    loadStats()
  }, [filters])

  async function loadSignals() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.direction) params.append('direction', filters.direction)
      if (filters.symbol) params.append('symbol', filters.symbol)
      
      const res = await apiFetch<{ success: boolean; data: { signals: Signal[] } }>(`/api/signals?${params.toString()}`)
      const data = res.data?.signals || []
      setItems(data)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await apiFetch<{ success: boolean; data: typeof stats }>('/api/signals/stats')
      setStats(res.data)
    } catch (err: unknown) {
      console.error('Load stats failed:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [SIGNAL_ADMIN]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            Signal Management
          </p>
        </div>
        <button
          onClick={() => {
            loadSignals()
            loadStats()
          }}
          className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 transition-all duration-300 rounded"
        >
          [REFRESH_DATA]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Total Signals
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {stats.totalSignals || 0}
            </div>
            <div className="text-blue-500 text-xs font-mono uppercase tracking-wide">
              Total Signals
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Active Signals
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {stats.activeSignals || 0}
            </div>
            <div className="text-green-500 text-xs font-mono uppercase tracking-wide">
              Active Signals
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Buy Signals
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-mono mb-1">
              {stats.buySignals || 0}
            </div>
            <div className="text-yellow-500 text-xs font-mono uppercase tracking-wide">
              Buy Signals
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Sell Signals
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono mb-1">
              {stats.sellSignals || 0}
            </div>
            <div className="text-red-500 text-xs font-mono uppercase tracking-wide">
              Sell Signals
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 mb-6">
        <div className="text-green-600 text-xs font-mono mb-6">
          Signal Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-wide">Signal Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:border-green-400 focus:outline-none transition-all duration-300"
            >
              <option value="">All Types</option>
              <option value="TECHNICAL">TECHNICAL</option>
              <option value="FUNDAMENTAL">FUNDAMENTAL</option>
              <option value="SENTIMENT">SENTIMENT</option>
              <option value="NEWS">NEWS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-wide">Direction</label>
            <select
              value={filters.direction}
              onChange={(e) => setFilters({...filters, direction: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:border-green-400 focus:outline-none transition-all duration-300"
            >
              <option value="">All Directions</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
              <option value="HOLD">HOLD</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-wide">Symbol Filter</label>
            <input
              type="text"
              value={filters.symbol}
              onChange={(e) => setFilters({...filters, symbol: e.target.value})}
              placeholder="BTCUSDT, ETHUSDT..."
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono placeholder-green-600 focus:border-green-400 focus:outline-none transition-all duration-300"
            />
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8 text-green-600">
          <div className="text-sm font-mono">
            Loading...
          </div>
          <div className="text-xs mt-2">
            Please wait while we load the data
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
          <div className="text-green-600 text-xs font-mono mb-6">
            Signal Database
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-green-500/30">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">SYMBOL</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">TYPE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">DIRECTION</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">ENTRY</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">TARGET</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">STOP_LOSS</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">CONFIDENCE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">REASONING</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">USER_ID</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">CREATED</th>
                </tr>
              </thead>
                        <tbody>
                {items.map((signal) => (
                  <tr key={signal.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono font-bold">{signal.symbol}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-400/50 px-2 py-1 rounded text-xs font-mono">
                        {signal.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        signal.direction === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-400/50' :
                        signal.direction === 'SELL' ? 'bg-red-500/20 text-red-400 border-red-400/50' :
                        'bg-gray-500/20 text-gray-400 border-gray-400/50'
                      }`}>
                        {signal.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-mono">{signal.entryPrice || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono">{signal.targetPrice || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-300 font-mono">{signal.stopLoss || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${signal.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-mono text-green-400">{signal.confidence}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="text-xs font-mono text-green-300">
                        {signal.reasoning && signal.reasoning.length > 50
                          ? `${signal.reasoning.substring(0, 50)}...`
                          : signal.reasoning || 'No reasoning'
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        signal.isActive ? 'bg-green-500/20 text-green-400 border-green-400/50' : 'bg-gray-500/20 text-gray-400 border-gray-400/50'
                      }`}>
                        {signal.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">{signal.userId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12 text-green-600">
              <div className="text-8xl mb-4">📈</div>
              <div className="text-sm font-mono mb-2">
                No trading signals found
              </div>
              <div className="text-xs mt-2 text-green-500">
                No trading signals found in the system
              </div>
            </div>
          )}

            </div>
      )}
    </div>
  )
}
