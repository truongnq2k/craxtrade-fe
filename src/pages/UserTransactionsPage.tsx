import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'
import { useAuthStore } from '../store/auth'

type Transaction = {
  id: string
  type: string
  creditsUsed: number
  creditsRemaining: number
  description?: string
  createdAt: string
}

export function UserTransactionsPage() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<Transaction[]>([])
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
        const res = await apiFetch<{ success: boolean; data: { transactions: Transaction[] } }>(`/api/users/${userId}/transactions`)
        const data = res.data?.transactions || []
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
      <h1 className="text-2xl font-semibold mb-4">Lịch sử giao dịch</h1>
      
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
