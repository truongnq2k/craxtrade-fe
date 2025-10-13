import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/auth'

type Trade = {
  id: string
  symbol: string
  type: string
  direction: string
  quantity: number
  price?: number
  status: string
  createdAt: string
  botInstanceId?: string
  signalId?: string
}

export function UserTradesPage() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (!user?.sub) {
          setError('Thiếu userId trong token')
          return
        }
        const userId = user?.sub
        const res = await apiFetch<{ success: boolean; data: { trades: Trade[] } }>(`/api/users/${userId}/trades`)
        const data = res.data?.trades || []
        setItems(data)
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Load failed')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleCloseTrade(tradeId: string) {
    try {
      const closePrice = prompt('Nhập giá đóng lệnh:')
      if (!closePrice) return
      
      await apiFetch(`/api/trades/${tradeId}/close`, {
        method: 'POST',
        body: {
          closePrice: parseFloat(closePrice),
          closeReason: 'MANUAL'
        }
      })
      // Reload data
      window.location.reload()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Close trade failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Giao dịch của tôi</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Tạo lệnh mới
        </button>
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
                <th className="px-3 py-2">Bot</th>
                <th className="px-3 py-2">Ngày tạo</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((trade) => (
                <tr key={trade.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{trade.symbol}</td>
                  <td className="px-3 py-2">{trade.type}</td>
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
                    {trade.botInstanceId ? 'Bot' : 'Manual'}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2">
                    {trade.status === 'OPEN' && (
                      <button 
                        onClick={() => handleCloseTrade(trade.id)}
                        className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                      >
                        Đóng lệnh
                      </button>
                    )}
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
