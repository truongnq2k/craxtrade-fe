import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'

type Trade = {
  id: string
  symbol: string
  type: string
  direction: string
  quantity: number
  price?: number
  status: string
  userId: string
  botInstanceId?: string
  signalId?: string
  createdAt: string
}

export function AdminTradesPage() {
  const [items, setItems] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalTrades: number; openTrades: number; closedTrades: number; totalPnl: string; winRate: number; pendingTrades: number } | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    direction: '',
    status: '',
    symbol: ''
  })

  useEffect(() => {
    loadTrades()
    loadStats()
  }, [filters])

  async function loadTrades() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.direction) params.append('direction', filters.direction)
      if (filters.status) params.append('status', filters.status)
      if (filters.symbol) params.append('symbol', filters.symbol)
      
      const res = await apiFetch<{ success: boolean; data: { trades: Trade[] } }>(`/api/trades?${params.toString()}`)
      const data = res.data?.trades || []
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
      const res = await apiFetch<{ success: boolean; data: typeof stats }>('/api/trades/stats')
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
            [TRADE_ADMIN]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            Trade Management
          </p>
        </div>
        <button
          onClick={() => {
            loadTrades()
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
              Total Trades
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {stats.totalTrades || 0}
            </div>
            <div className="text-blue-500 text-xs font-mono uppercase tracking-wide">
              Total Trades
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Open Positions
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {stats.openTrades || 0}
            </div>
            <div className="text-green-500 text-xs font-mono uppercase tracking-wide">
              Open Positions
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Closed Trades
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {stats.closedTrades || 0}
            </div>
            <div className="text-blue-500 text-xs font-mono uppercase tracking-wide">
              Closed Trades
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Pending Trades
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-mono mb-1">
              {stats.pendingTrades || 0}
            </div>
            <div className="text-yellow-500 text-xs font-mono uppercase tracking-wide">
              Pending Trades
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 mb-6">
        <div className="text-green-600 text-xs font-mono mb-6">
          Trade Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-wide">Order Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:border-green-400 focus:outline-none transition-all duration-300"
            >
              <option value="">All Types</option>
              <option value="MARKET">MARKET</option>
              <option value="LIMIT">LIMIT</option>
              <option value="STOP">STOP</option>
              <option value="STOP_LIMIT">STOP_LIMIT</option>
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
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-wide">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:border-green-400 focus:outline-none transition-all duration-300"
            >
              <option value="">All Status</option>
              <option value="OPEN">OPEN</option>
              <option value="CLOSED">CLOSED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PENDING">PENDING</option>
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
            Admin Trade Database
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-green-500/30">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">SYMBOL</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">TYPE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">DIRECTION</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">QUANTITY</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">PRICE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">SOURCE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">USER_ID</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">CREATED</th>
                </tr>
              </thead>
                      <tbody>
                {items.map((trade) => (
                  <tr key={trade.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono font-bold">{trade.symbol}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-purple-500/20 text-purple-400 border border-purple-400/50 px-2 py-1 rounded text-xs font-mono">
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        trade.direction === 'BUY' ? 'bg-green-500/20 text-green-400 border-green-400/50' :
                        'bg-red-500/20 text-red-400 border-red-400/50'
                      }`}>
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono">{trade.quantity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-mono">{trade.price || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        trade.status === 'OPEN' ? 'bg-green-500/20 text-green-400 border-green-400/50' :
                        trade.status === 'CLOSED' ? 'bg-blue-500/20 text-blue-400 border-blue-400/50' :
                        trade.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border-red-400/50' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-mono text-xs">
                        {trade.botInstanceId ? 'BOT' : trade.signalId ? 'SIGNAL' : 'MANUAL'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">{trade.userId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">
                        {new Date(trade.createdAt).toLocaleDateString()}
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
              <div className="text-8xl mb-4">📊</div>
              <div className="text-sm font-mono mb-2">
                No trading data found
              </div>
              <div className="text-xs mt-2 text-green-500">
                No trading data found in the system
              </div>
            </div>
          )}

          </div>
      )}
    </div>
  )
}
