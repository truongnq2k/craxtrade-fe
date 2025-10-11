import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'

type ExchangeAccount = {
  id: string
  name: string
  exchangeType: string
  isActive: boolean
  isTestnet: boolean
  userId: string
  createdAt: string
}

export function AdminExchangeAccountsPage() {
  const [items, setItems] = useState<ExchangeAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadAccounts()
    loadStats()
  }, [])

  async function loadAccounts() {
    try {
      setLoading(true)
      const res = await apiFetch<{ success: boolean; data: any }>('/api/exchange-accounts')
      const data = (res as any).data?.accounts || (res as any).data || []
      setItems(data)
    } catch (err: any) {
      setError(err.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await apiFetch<{ success: boolean; data: any }>('/api/exchange-accounts/stats')
      setStats(res.data)
    } catch (err: any) {
      console.error('Load stats failed:', err)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Quản lý tài khoản sàn</h1>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalAccounts || 0}</div>
            <div className="text-sm text-gray-600">Tổng tài khoản</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.activeAccounts || 0}</div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.testnetAccounts || 0}</div>
            <div className="text-sm text-gray-600">Testnet</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.exchanges?.length || 0}</div>
            <div className="text-sm text-gray-600">Sàn hỗ trợ</div>
          </div>
        </div>
      )}
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Sàn</th>
                <th className="px-3 py-2">User ID</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((account) => (
                <tr key={account.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{account.name}</td>
                  <td className="px-3 py-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {account.exchangeType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">{account.userId}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.isTestnet ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {account.isTestnet ? 'Testnet' : 'Mainnet'}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {new Date(account.createdAt).toLocaleDateString()}
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
