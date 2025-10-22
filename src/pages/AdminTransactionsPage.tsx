import { useEffect, useState } from 'react'
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [TRANSACTION_ADMIN]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            Transaction Management
          </p>
        </div>
        <button
          onClick={() => {
            loadTransactions()
            loadStats()
          }}
          className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 transition-all duration-300 rounded"
        >
          [REFRESH_DATA]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> {error}
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Total Transactions
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {stats.totalTransactions || 0}
            </div>
            <div className="text-blue-500 text-xs font-mono uppercase tracking-wide">
              Total Transactions
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Credits Purchased
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {stats.totalCreditsPurchased || 0}
            </div>
            <div className="text-green-500 text-xs font-mono uppercase tracking-wide">
              Credits Purchased
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Credits Used
            </div>
            <div className="text-3xl font-bold text-red-400 font-mono mb-1">
              {stats.totalCreditsConsumed || 0}
            </div>
            <div className="text-red-500 text-xs font-mono uppercase tracking-wide">
              Credits Used
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Total Revenue
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-mono mb-1">
              ${stats.totalRevenue || 0}
            </div>
            <div className="text-yellow-500 text-xs font-mono uppercase tracking-wide">
              Total Revenue
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6 mb-6">
        <div className="text-green-600 text-xs font-mono mb-6">
          Transaction Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-wide">Transaction Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:border-green-400 focus:outline-none transition-all duration-300"
            >
              <option value="">All Types</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="CONSUMPTION">CONSUMPTION</option>
              <option value="REFUND">REFUND</option>
              <option value="BONUS">BONUS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-green-400 mb-2 uppercase tracking-wide">User ID Filter</label>
            <input
              type="text"
              value={filters.userId}
              onChange={(e) => setFilters({...filters, userId: e.target.value})}
              placeholder="Enter User ID..."
              className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono placeholder-green-600 focus:border-green-400 focus:outline-none transition-all duration-300"
            />
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="text-center py-8 text-green-600">
          <div className="text-sm font-mono">
            Loading...
          </div>
          <div className="text-xs mt-2">
            Please wait while we load the data
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
          <div className="text-green-600 text-xs font-mono mb-6">
            Transaction Database
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-green-500/30">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">TYPE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">CREDITS</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">REMAINING</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">DESCRIPTION</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">USER_ID</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">CREATED</th>
                </tr>
              </thead>
                    <tbody>
                {items.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        transaction.type === 'PURCHASE' ? 'bg-green-500/20 text-green-400 border-green-400/50' :
                        transaction.type === 'CONSUMPTION' ? 'bg-red-500/20 text-red-400 border-red-400/50' :
                        transaction.type === 'REFUND' ? 'bg-blue-500/20 text-blue-400 border-blue-400/50' :
                        'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-mono font-bold ${transaction.type === 'CONSUMPTION' ? 'text-red-400' : 'text-green-400'}`}>
                        {transaction.type === 'CONSUMPTION' ? '-' : '+'}{transaction.creditsUsed}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono">{transaction.creditsRemaining}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-mono text-sm">
                        {transaction.description || 'No description'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">{transaction.userId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="text-center py-12 text-green-600">
              <div className="text-8xl mb-4">💸</div>
              <div className="text-sm font-mono mb-2">
                No transactions found
              </div>
              <div className="text-xs mt-2 text-green-500">
                No transactions found in the system
              </div>
            </div>
          )}

          </div>
      )}
    </div>
  )
}
