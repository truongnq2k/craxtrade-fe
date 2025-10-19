import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
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
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Quản lý tín hiệu</h1>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalSignals || 0}</div>
            <div className="text-sm text-gray-600">Tổng tín hiệu</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.activeSignals || 0}</div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.buySignals || 0}</div>
            <div className="text-sm text-gray-600">Tín hiệu mua</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.sellSignals || 0}</div>
            <div className="text-sm text-gray-600">Tín hiệu bán</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại tín hiệu</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="TECHNICAL">Technical</option>
              <option value="FUNDAMENTAL">Fundamental</option>
              <option value="SENTIMENT">Sentiment</option>
              <option value="NEWS">News</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hướng</label>
            <select
              value={filters.direction}
              onChange={(e) => setFilters({...filters, direction: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
              <option value="HOLD">Hold</option>
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
                <th className="px-3 py-2">Symbol</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Hướng</th>
                <th className="px-3 py-2">Entry Price</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Stop Loss</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">Reasoning</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((signal) => (
                <tr key={signal.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{signal.symbol}</td>
                  <td className="px-3 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {signal.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      signal.direction === 'BUY' ? 'bg-green-100 text-green-800' :
                      signal.direction === 'SELL' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {signal.direction}
                    </span>
                  </td>
                  <td className="px-3 py-2">{signal.entryPrice || '-'}</td>
                  <td className="px-3 py-2">{signal.targetPrice || '-'}</td>
                  <td className="px-3 py-2">{signal.stopLoss || '-'}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${signal.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs">{signal.confidence}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 max-w-xs">
                    <div className="text-xs text-gray-600">
                      {signal.reasoning && signal.reasoning.length > 50 
                        ? `${signal.reasoning.substring(0, 50)}...`
                        : signal.reasoning || 'No reasoning'
                      }
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      signal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {signal.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">{signal.userId}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {new Date(signal.createdAt).toLocaleDateString()}
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
