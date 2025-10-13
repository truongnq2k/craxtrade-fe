import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
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
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Quản lý Bot Trading</h1>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalBots || 0}</div>
            <div className="text-sm text-gray-600">Tổng số bot</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.activeBots || 0}</div>
            <div className="text-sm text-gray-600">Đang chạy</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pausedBots || 0}</div>
            <div className="text-sm text-gray-600">Tạm dừng</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.stoppedBots || 0}</div>
            <div className="text-sm text-gray-600">Đã dừng</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại bot</label>
            <select
              value={filters.botType}
              onChange={(e) => setFilters({...filters, botType: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="GRID">Grid</option>
              <option value="DCA">DCA</option>
              <option value="MARTINGALE">Martingale</option>
              <option value="SIGNAL">Signal</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="STOPPED">Stopped</option>
              <option value="ERROR">Error</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Symbol</label>
            <input
              type="text"
              value={filters.symbol}
              onChange={(e) => setFilters({...filters, symbol: e.target.value})}
              placeholder="BTCUSDT, ETHUSDT..."
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Tên Bot</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Symbol</th>
                <th className="px-3 py-2">Vốn</th>
                <th className="px-3 py-2">Leverage</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((bot) => (
                <tr key={bot.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{bot.name}</td>
                  <td className="px-3 py-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {bot.botType}
                    </span>
                  </td>
                  <td className="px-3 py-2">{bot.symbol}</td>
                  <td className="px-3 py-2">{bot.capital}</td>
                  <td className="px-3 py-2">{bot.leverage}x</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bot.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      bot.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                      bot.status === 'STOPPED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bot.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">{bot.userId}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {new Date(bot.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
