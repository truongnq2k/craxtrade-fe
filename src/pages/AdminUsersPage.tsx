import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'

type User = {
  id: string
  email: string
  name: string
  role: string
  isActive: boolean
  credits: number
  creditsPackage: number
  lastLoginAt?: string
  createdAt: string
}

export function AdminUsersPage() {
  const [items, setItems] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: ''
  })

  useEffect(() => {
    loadUsers()
  }, [pagination.page, filters])

  async function loadUsers() {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      if (filters.search) params.append('search', filters.search)
      if (filters.role) params.append('role', filters.role)
      if (filters.isActive) params.append('isActive', filters.isActive)
      
      const res = await apiFetch<{ success: boolean; data: unknown }>(`/api/users?${params.toString()}`)
      const result = res.data as { users: User[], pagination: { total: number; pages: number } }
      setItems(result.users || [])
      setPagination(prev => ({
        ...prev,
        total: result.pagination?.total || 0,
        pages: result.pagination?.pages || 0
      }))
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleUser(id: string) {
    try {
      await apiFetch(`/api/users/${id}/toggle`, { method: 'PUT' })
      loadUsers()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Toggle failed')
    }
  }

  async function handleAddCredits(userId: string) {
    const amount = prompt('Nhập số credits muốn thêm:')
    if (!amount || isNaN(Number(amount))) return

    const type = prompt('Loại (PURCHASE/BONUS/REFUND):')
    if (!type || !['PURCHASE', 'BONUS', 'REFUND'].includes(type)) return

    try {
      await apiFetch('/api/users/credits', {
        method: 'POST',
        body: {
          userId,
          amount: Number(amount),
          type,
          description: `Admin added ${amount} credits`
        }
      })
      loadUsers()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Add credits failed')
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Quản lý người dùng</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tìm kiếm</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Email, tên..."
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vai trò</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {!loading && !error && (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Vai trò</th>
                  <th className="px-3 py-2">Credits</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Đăng nhập cuối</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        <div>Credits: {user.credits}</div>
                        <div>Package: {user.creditsPackage}</div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => handleToggleUser(user.id)}
                          className={`px-2 py-1 rounded text-xs ${
                            user.isActive 
                              ? 'bg-red-600 text-white hover:bg-red-700' 
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button 
                          onClick={() => handleAddCredits(user.id)}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Add Credits
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Hiển thị {items.length} trong {pagination.total} người dùng
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Trước
              </button>
              <span className="px-3 py-1">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
