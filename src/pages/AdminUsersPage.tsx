import { useEffect, useState } from 'react'
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
    <div>
      <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider mb-6" style={{ textShadow: '0 0 10px #00ff00' }}>
        [USER_MANAGEMENT]
      </h1>
      <p className="text-green-600 text-sm font-mono mb-4">
        $ ./manage_system_users.sh
      </p>

      {/* Filters */}
      <div className="bg-black/50 border border-green-500/30 rounded-lg p-4 backdrop-blur-sm mb-6">
        <h2 className="text-xs font-mono text-green-600 uppercase tracking-wider mb-3 pb-2 border-b border-green-500/30">
          {'>'} FILTER_PARAMETERS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-green-400 font-mono text-xs uppercase tracking-wide">SEARCH_QUERY</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              placeholder="Email, name..."
              className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 placeholder-green-600 focus:border-green-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-green-400 font-mono text-xs uppercase tracking-wide">USER_ROLE</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({...filters, role: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
            >
              <option value="">All</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-green-400 font-mono text-xs uppercase tracking-wide">ACCOUNT_STATUS</label>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 focus:border-green-400 focus:outline-none"
            >
              <option value="">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8">
          <div className="text-green-400 font-mono animate-pulse mb-2">
            $ ./loading_user_data.sh
          </div>
          <div className="text-green-600 text-sm font-mono">
            Processing system users...
          </div>
        </div>
      )}
      {error && <div className="text-red-400 mb-4">{error}</div>}

      {!loading && !error && (
        <>
          <div className="overflow-x-auto border border-green-500/30 rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-black/70 text-left">
                <tr>
                  <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">EMAIL_ADDRESS</th>
                  <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">FULL_NAME</th>
                  <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">USER_ROLE</th>
                  <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">CREDIT_BALANCE</th>
                  <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">STATUS</th>
                  <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">LAST_LOGIN</th>
                  <th className="px-3 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider border-b border-green-500/30">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-green-300">
                {items.map((user) => (
                  <tr key={user.id} className="border-t border-green-500/20 hover:bg-black/50">
                    <td className="px-3 py-2">{user.email}</td>
                    <td className="px-3 py-2">{user.name}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-500/30'
                          : 'bg-blue-500/30 text-blue-300 border border-blue-500/30'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs">
                        <div>Credits: <span className="text-green-400">{user.credits}</span></div>
                        <div>Package: <span className="text-green-400">{user.creditsPackage}</span></div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.isActive
                          ? 'bg-green-500/30 text-green-300 border border-green-500/30'
                          : 'bg-red-500/30 text-red-300 border border-red-500/30'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-green-600">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleToggleUser(user.id)}
                          className={`px-2 py-1 rounded text-xs font-mono border transition-all duration-300 uppercase tracking-wide ${
                            user.isActive
                              ? 'bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30'
                              : 'bg-green-500/20 text-green-300 border-green-500/50 hover:bg-green-500/30'
                          }`}
                        >
                          [{user.isActive ? 'DEACTIVATE' : 'ACTIVATE'}]
                        </button>
                        <button
                          onClick={() => handleAddCredits(user.id)}
                          className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs font-mono border border-blue-500/50 hover:bg-blue-500/30 transition-all duration-300 uppercase tracking-wide"
                        >
                          [ADD_CREDITS]
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12 text-green-600">
              <div className="text-8xl mb-4">👥</div>
              <div className="text-sm font-mono mb-2 animate-pulse">
                $ ./no_users_found.sh
              </div>
              <div className="text-xs mt-2 text-green-500">
                No users found in the system database
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-green-600">
              Showing {items.length} of {pagination.total} users
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page - 1}))}
                disabled={pagination.page <= 1}
                className="px-3 py-1 border border-green-500/50 rounded text-green-400 hover:bg-green-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-green-400">
                {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => setPagination(prev => ({...prev, page: prev.page + 1}))}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 border border-green-500/50 rounded text-green-400 hover:bg-green-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
