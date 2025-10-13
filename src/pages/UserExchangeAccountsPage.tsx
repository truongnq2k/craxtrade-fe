import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch, ApiPaths } from '../utils/api'
import { useAuthStore } from '../store/auth'

type ExchangeAccount = {
  id: string
  name: string
  exchangeType: string
  isActive: boolean
}

export function UserExchangeAccountsPage() {
  const { user } = useAuthStore()
  const [items, setItems] = useState<ExchangeAccount[]>([])
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
        const res = await apiFetch<{ success: boolean; data: { accounts: ExchangeAccount[] } }>(ApiPaths.userExchangeAccounts(String(userId)))
        const data = res.data?.accounts || []
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
      <h1 className="text-2xl font-semibold mb-4">Tài khoản sàn của tôi</h1>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Sàn</th>
                <th className="px-3 py-2">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {items.map((acc) => (
                <tr key={acc.id} className="border-t">
                  <td className="px-3 py-2">{acc.name}</td>
                  <td className="px-3 py-2">{acc.exchangeType}</td>
                  <td className="px-3 py-2">{acc.isActive ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
