import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
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
  const [stats, setStats] = useState<any>(null)
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
      
      const res = await apiFetch<{ success: boolean; data: any }>(`/api/trades?${params.toString()}`)
      const data = (res as any).data?.trades || (res as any).data || []
      setItems(data)
    } catch (err: any) {
      setError(err.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>('/api/trades/stats')
      setStats(res.data)
    } catch (err: any) {
      console.error('Load stats failed:', err)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Quản lý giao dịch</h1>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTrades || 0}</div>
            <div className="text-sm text-gray-600">Tổng giao dịch</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.openTrades || 0}</div>
            <div className="text-sm text-gray-600">Đang mở</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.closedTrades || 0}</div>
            <div className="text-sm text-gray-600">Đã đóng</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingTrades || 0}</div>
            <div className="text-sm text-gray-600">Chờ xử lý</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại lệnh</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
              <option value="STOP">Stop</option>
              <option value="STOP_LIMIT">Stop Limit</option>
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
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="PENDING">Pending</option>
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
                <th className="px-3 py-2">Số lượng</th>
                <th className="px-3 py-2">Giá</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Nguồn</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((trade) => (
                <tr key={trade.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{trade.symbol}</td>
                  <td className="px-3 py-2">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.direction === 'BUY' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="px-3 py-2">{trade.quantity}</td>
                  <td className="px-3 py-2">{trade.price || '-'}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      trade.status === 'OPEN' ? 'bg-green-100 text-green-800' :
                      trade.status === 'CLOSED' ? 'bg-blue-100 text-blue-800' :
                      trade.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trade.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {trade.botInstanceId ? 'Bot' : trade.signalId ? 'Signal' : 'Manual'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">{trade.userId}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {new Date(trade.createdAt).toLocaleDateString()}
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
