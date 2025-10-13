 import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/auth'

type Signal = {
  id: string
  symbol: string
  type: string
  direction: string
  entryPrice?: number
  targetPrice?: number
  stopLoss?: number
  confidence: number
  isActive: boolean
  createdAt: string
}

export function UserSignalsPage() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<Signal[]>([])
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
        const res = await apiFetch<{ success: boolean; data: { signals: Signal[] } }>(`/api/users/${userId}/signals`)
        const data = res.data?.signals || []
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

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Tín hiệu của tôi</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Tạo tín hiệu mới
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
                <th className="px-3 py-2">Entry Price</th>
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Stop Loss</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((signal) => (
                <tr key={signal.id} className="border-t">
                  <td className="px-3 py-2 font-medium">{signal.symbol}</td>
                  <td className="px-3 py-2">{signal.type}</td>
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
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      signal.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {signal.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
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
