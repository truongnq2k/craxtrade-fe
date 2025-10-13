import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'

type Transaction = {
  id: string
  type: string
  creditsUsed: number
  creditsRemaining: number
  description?: string
  userId: string
  createdAt: string
}

export function AdminTransactionsPage() {
  const [items, setItems] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalTransactions: number; totalCreditsUsed: string; totalCreditsPurchased: number; totalCreditsConsumed: number; totalRevenue: number } | null>(null)
  const [filters, setFilters] = useState({
    type: '',
    userId: ''
  })

  useEffect(() => {
    loadTransactions()
    loadStats()
  }, [filters])

  async function loadTransactions() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.userId) params.append('userId', filters.userId)
      
      const res = await apiFetch<{ success: boolean; data: { transactions: Transaction[] } }>(`/api/transactions?${params.toString()}`)
      const data = res.data?.transactions || []
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
      const res = await apiFetch<{ success: boolean; data: typeof stats }>('/api/transactions/stats')
      setStats(res.data)
    } catch (err: unknown) {
      console.error('Load stats failed:', err)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Quản lý giao dịch credits</h1>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalTransactions || 0}</div>
            <div className="text-sm text-gray-600">Tổng giao dịch</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.totalCreditsPurchased || 0}</div>
            <div className="text-sm text-gray-600">Credits mua</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.totalCreditsConsumed || 0}</div>
            <div className="text-sm text-gray-600">Credits sử dụng</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalRevenue || 0}</div>
            <div className="text-sm text-gray-600">Doanh thu</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Loại giao dịch</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="PURCHASE">Purchase</option>
              <option value="CONSUMPTION">Consumption</option>
              <option value="REFUND">Refund</option>
              <option value="BONUS">Bonus</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">User ID</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({...filters, userId: e.target.value})}
              placeholder="Nhập User ID..."
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
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Credits sử dụng</th>
                <th className="px-3 py-2">Credits còn lại</th>
                <th className="px-3 py-2">Mô tả</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((transaction) => (
                <tr key={transaction.id} className="border-t">
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      transaction.type === 'PURCHASE' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'CONSUMPTION' ? 'bg-red-100 text-red-800' :
                      transaction.type === 'REFUND' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={transaction.type === 'CONSUMPTION' ? 'text-red-600' : 'text-green-600'}>
                      {transaction.type === 'CONSUMPTION' ? '-' : '+'}{transaction.creditsUsed}
                    </span>
                  </td>
                  <td className="px-3 py-2">{transaction.creditsRemaining}</td>
                  <td className="px-3 py-2">{transaction.description || '-'}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">{transaction.userId}</td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {new Date(transaction.createdAt).toLocaleDateString()}
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
