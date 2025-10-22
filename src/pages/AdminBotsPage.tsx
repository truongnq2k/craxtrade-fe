import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'

type BotInstance = {
  id: string
  name: string
  botType: string
  symbol: string
  status: string
  capital: number
  leverage: number
  userId: string
  createdAt: string
}

export function AdminBotsPage() {
  const [items, setItems] = useState<BotInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalBots: number; activeBots: number; pausedBots: number; stoppedBots: number; avgPerformance: string } | null>(null)
  const [filters, setFilters] = useState({
    botType: '',
    status: '',
    symbol: ''
  })

  useEffect(() => {
    loadBots()
    loadStats()
  }, [filters])

  async function loadBots() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.botType) params.append('botType', filters.botType)
      if (filters.status) params.append('status', filters.status)
      if (filters.symbol) params.append('symbol', filters.symbol)
      
      const res = await apiFetch<{ success: boolean; data: { bots: BotInstance[] } }>(`/api/bot-instances?${params.toString()}`)
      const data = res.data?.bots || []
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
      const res = await apiFetch<{ success: boolean; data: typeof stats }>('/api/bot-instances/stats')
      setStats(res.data)
    } catch (err: unknown) {
      console.error('Load stats failed:', err)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider mb-6" style={{ textShadow: '0 0 10px #00ff00' }}>
        [TRADING_BOTS_ADMIN]
      </h1>
      <p className="text-green-600 text-sm font-mono mb-4">
        $ ./manage_system_bots.sh
      </p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-blue-400">{stats.totalBots || 0}</div>
            <div className="text-sm text-green-600 font-mono uppercase tracking-wide">TOTAL_BOTS</div>
          </div>
          <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-400">{stats.activeBots || 0}</div>
            <div className="text-sm text-green-600 font-mono uppercase tracking-wide">ACTIVE_BOTS</div>
          </div>
          <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-yellow-400">{stats.pausedBots || 0}</div>
            <div className="text-sm text-green-600 font-mono uppercase tracking-wide">PAUSED_BOTS</div>
          </div>
          <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-red-400">{stats.stoppedBots || 0}</div>
            <div className="text-sm text-green-600 font-mono uppercase tracking-wide">STOPPED_BOTS</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-green-400">Bot Type</label>
            <select
              value={filters.botType}
              onChange={(e) => setFilters({...filters, botType: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
            >
              <option value="">All</option>
              <option value="GRID">Grid</option>
              <option value="DCA">DCA</option>
              <option value="MARTINGALE">Martingale</option>
              <option value="SIGNAL">Signal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-green-400">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="STOPPED">Stopped</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-green-400">Symbol</label>
            <input
              type="text"
              value={filters.symbol}
              onChange={(e) => setFilters({...filters, symbol: e.target.value})}
              placeholder="BTCUSDT, ETHUSDT..."
              className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
            />
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="text-green-400 font-mono animate-pulse mb-2">
            $ ./loading_admin_bots.sh
          </div>
          <div className="text-green-600 text-sm font-mono">
            Retrieving trading bots from quantum database...
          </div>
        </div>
      )}
      {error && <div className="text-red-400 mb-4">{error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto border border-green-500/30 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-black/70 text-left">
              <tr>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">BOT_NAME</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">BOT_TYPE</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">SYMBOL</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">CAPITAL</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">LEVERAGE</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">STATUS</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">USER_ID</th>
                <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">CREATED_AT</th>
              </tr>
            </thead>
            <tbody className="text-green-300">
              {items.map((bot) => (
                <tr key={bot.id} className="border-t border-green-500/20 hover:bg-black/50">
                  <td className="px-3 py-2 font-medium text-green-300">{bot.name}</td>
                  <td className="px-3 py-2">
                    <span className="bg-purple-500/30 text-purple-300 px-2 py-1 rounded text-xs border border-purple-500/30">
                      {bot.botType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-green-400">{bot.symbol}</td>
                  <td className="px-3 py-2 text-green-400">{bot.capital}</td>
                  <td className="px-3 py-2 text-green-400">{bot.leverage}x</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs border ${
                      bot.status === 'ACTIVE' ? 'bg-green-500/30 text-green-300 border-green-500/30' :
                      bot.status === 'PAUSED' ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500/30' :
                      bot.status === 'STOPPED' ? 'bg-red-500/30 text-red-300 border-red-500/30' :
                      'bg-gray-500/30 text-gray-300 border-gray-500/30'
                    }`}>
                      {bot.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-green-600">{bot.userId}</td>
                  <td className="px-3 py-2 text-xs text-green-600">
                    {new Date(bot.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12 text-green-600">
              <div className="text-8xl mb-4">🤖</div>
              <div className="text-sm font-mono mb-2 animate-pulse">
                $ ./no_trading_bots_found.sh
              </div>
              <div className="text-xs mt-2 text-green-500">
                No trading bots found in the system. Users can create bots to get started!
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
