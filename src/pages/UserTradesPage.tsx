import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { apiFetch } from '../utils/api'

type Trade = {
  id: string
  symbol: string
  type: string
  direction: string
  quantity: number
  price?: number
  entryPrice?: number
  exitPrice?: number
  status: string
  createdAt: string
  botInstanceId?: string
  signalId?: string
  pnl?: number
}

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function UserTradesPage() {
  const { user } = useAuthStore()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tradeSummary, setTradeSummary] = useState<{
    totalTrades?: number;
    openTrades?: number;
    closedTrades?: number;
    totalPnl?: number;
    winRate?: number;
    bestTrade?: { symbol: string; pnl: number };
    worstTrade?: { symbol: string; pnl: number };
  } | null>(null)
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterSymbol, setFilterSymbol] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [closingTrade, setClosingTrade] = useState<string | null>(null)

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 28)
    const drops = Array(columns).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      speed: Math.random() * 2 + 0.5
    }))
    setMatrixRain(drops)

    const animateRain = () => {
      setMatrixRain(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > window.innerHeight ? 0 : drop.y + drop.speed
      })))
    }

    const interval = setInterval(animateRain, 70)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    loadTrades()
    loadTradeSummary()
  }, [user])

  async function loadTrades() {
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
      
      const response = await apiFetch(`/api/users/${userId}/trades`) as { data?: { trades?: Trade[] } | Trade[]; success?: boolean }
      // Handle different response formats safely
      if (response && typeof response === 'object' && 'data' in response) {
        const data = response.data
        if (Array.isArray(data)) {
          setTrades(data)
        } else if (data && typeof data === 'object' && 'trades' in data) {
          setTrades(Array.isArray(data.trades) ? data.trades : [])
        } else {
          setTrades([])
        }
      } else if (Array.isArray(response)) {
        setTrades(response)
      } else {
        setTrades([])
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] Load failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadTradeSummary() {
    try {
      if (!user?.sub && !user?.userId) return
      
      const userId = user?.sub || user?.userId
      if (!userId) return
      
      const summary = await apiFetch(`/api/users/${userId}/trade-summary`) as {
        totalTrades?: number;
        openTrades?: number;
        closedTrades?: number;
        totalPnl?: number;
        winRate?: number;
        bestTrade?: { symbol: string; pnl: number };
        worstTrade?: { symbol: string; pnl: number };
      }
      setTradeSummary(summary)
    } catch (err: unknown) {
      console.error('Error loading trade summary:', err)
    }
  }

  async function handleCloseTrade(tradeId: string) {
    setClosingTrade(tradeId)
    try {
      const closePrice = prompt('[INPUT] Nhập giá đóng lệnh:')
      if (!closePrice) return
      
      await apiFetch(`/api/trades/${tradeId}/close`, {
        method: 'POST',
        body: {
          exitPrice: parseFloat(closePrice),
          closeReason: 'MANUAL'
        }
      })
      
      // Reload data instead of window reload
      await loadTrades()
      await loadTradeSummary()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] Close trade failed')
    } finally {
      setClosingTrade(null)
    }
  }

  function getTradeIcon(direction: string) {
    switch (direction) {
      case 'BUY': return '📈'
      case 'SELL': return '📉'
      default: return '📊'
    }
  }

  function getDirectionBadgeClass(direction: string) {
    switch (direction) {
      case 'BUY': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'SELL': return 'bg-red-500/20 text-red-400 border-red-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'OPEN': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'CLOSED': return 'bg-blue-500/20 text-blue-400 border-blue-400/50'
      case 'STOPPED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
      case 'LIQUIDATED': return 'bg-red-500/20 text-red-400 border-red-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  function formatPrice(price?: number) {
    if (!price) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(price)
  }

  function formatQuantity(quantity: number) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8
    }).format(quantity)
  }

  function formatPnl(pnl?: number) {
    if (!pnl) return '-'
    const prefix = pnl >= 0 ? '+' : ''
    return `${prefix}${formatPrice(pnl)}`
  }

  function getPnlColor(pnl?: number) {
    if (!pnl) return 'text-gray-400'
    return pnl >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const filteredTrades = trades.filter(trade => {
    if (filterStatus && trade.status !== filterStatus) return false
    if (filterSymbol && !trade.symbol.toLowerCase().includes(filterSymbol.toLowerCase())) return false
    return true
  })

  const paginatedTrades = filteredTrades.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [TRADE_TERMINAL]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            $ ./execute_trade_monitor.sh
          </p>
        </div>
        <button 
          onClick={() => loadTrades()}
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

      {/* Trade Summary Cards */}
      {tradeSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./total_trades.sh
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {tradeSummary.totalTrades || 0}
            </div>
            <div className="text-green-500 text-xs font-mono">
              Total Trades
            </div>
          </div>

          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./open_positions.sh
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {tradeSummary.openTrades || 0}
            </div>
            <div className="text-blue-500 text-xs font-mono">
              Open Positions
            </div>
          </div>

          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./total_pnl.sh
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-mono mb-1">
              {formatPrice(tradeSummary.totalPnl)}
            </div>
            <div className="text-yellow-500 text-xs font-mono">
              Total P/L
            </div>
          </div>

          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2 animate-pulse">
              $ ./win_rate.sh
            </div>
            <div className="text-3xl font-bold text-cyan-400 font-mono mb-1">
              {tradeSummary.winRate ? Math.round(tradeSummary.winRate) : 0}%
            </div>
            <div className="text-cyan-500 text-xs font-mono">
              Win Rate
            </div>
          </div>
        </div>
      )}

      {/* Trade List */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
        <div className="text-green-600 text-xs font-mono mb-6 animate-pulse">
          $ ./load_trade_database.sh
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-green-400 text-xs font-mono">FILTER_STATUS</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
          >
            <option value="">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
            <option value="STOPPED">STOPPED</option>
            <option value="LIQUIDATED">LIQUIDATED</option>
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
              $ ./loading_trades.sh
            </div>
            <div className="text-xs mt-2">
              Retrieving trade data from quantum database...
            </div>
          </div>
        )}

        {/* Trade Table */}
        {!loading && paginatedTrades.length === 0 && (
          <div className="text-center py-12 text-green-600">
            <div className="text-8xl mb-4">📋</div>
            <div className="text-sm font-mono mb-2">
              $ ./no_trades_found.sh
            </div>
            <div className="text-xs mt-2">
              No trades found for the selected criteria
            </div>
          </div>
        )}

        {!loading && paginatedTrades.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-green-500/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">SYMBOL</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">DIRECTION</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">TYPE</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">QUANTITY</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">ENTRY</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">EXIT</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">P/L</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">STATUS</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">SOURCE</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">TIME</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                      <td className="px-4 py-3">
                        <span className="text-green-300 font-mono font-bold">{trade.symbol || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${getDirectionBadgeClass(trade.direction)}`}>
                          {getTradeIcon(trade.direction)} {trade.direction}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-mono text-xs">{trade.type || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-300 font-mono">{formatQuantity(trade.quantity)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-mono">{formatPrice(Number(trade.entryPrice) || Number(trade.price))}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-300 font-mono">{formatPrice(Number(trade.exitPrice))}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono font-bold ${getPnlColor(trade.pnl)}`}>
                          {formatPnl(trade.pnl)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${getStatusBadgeClass(trade.status)}`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-mono text-xs">
                          {trade.botInstanceId ? 'BOT' : 'MANUAL'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-500 font-mono text-xs">
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {trade.status === 'OPEN' && (
                          <button 
                            onClick={() => handleCloseTrade(trade.id)}
                            disabled={closingTrade === trade.id}
                            className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded text-xs"
                          >
                            {closingTrade === trade.id ? '[CLOSING...]' : '[CLOSE]'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-green-500/30">
              <div className="text-green-600 text-xs font-mono">
                <div className="animate-pulse">Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredTrades.length)}</div>
                <div className="mt-1">Total: {filteredTrades.length} trades</div>
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
                  onClick={() => loadTrades()}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 transition-all duration-300 rounded"
                >
                  [REFRESH]
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * pageSize >= filteredTrades.length}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                >
                  [NEXT]
                </button>
              </div>
            </div>
          </>
        )}

        {/* Terminal Info */}
        <div className="mt-6 text-center">
          <div className="text-xs font-mono text-green-600">
            <div className="animate-pulse">DATABASE: CONNECTED</div>
            <div className="mt-1">ENCRYPTION: QUANTUM</div>
            <div className="mt-1">STATUS: SECURE</div>
          </div>
        </div>
      </div>
    </div>
  )
}
