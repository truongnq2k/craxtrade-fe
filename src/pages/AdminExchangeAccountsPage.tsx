import { useEffect, useState } from 'react'
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
  const [stats, setStats] = useState<{ totalAccounts: number; activeAccounts: number; inactiveAccounts: number; testnetAccounts: number; exchanges: string[] } | null>(null)

  useEffect(() => {
    loadAccounts()
    loadStats()
  }, [])

  async function loadAccounts() {
    try {
      setLoading(true)
      const res = await apiFetch<{ success: boolean; data: { accounts: ExchangeAccount[] } }>('/api/exchange-accounts')
      const data = res.data?.accounts || []
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
      const res = await apiFetch<{ success: boolean; data: typeof stats }>('/api/exchange-accounts/stats')
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
            [EXCHANGE_ADMIN]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            Exchange Account Management
          </p>
        </div>
        <button
          onClick={() => {
            loadAccounts()
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
              Total Accounts
            </div>
            <div className="text-3xl font-bold text-blue-400 font-mono mb-1">
              {stats.totalAccounts || 0}
            </div>
            <div className="text-blue-500 text-xs font-mono uppercase tracking-wide">
              Total Accounts
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Active Accounts
            </div>
            <div className="text-3xl font-bold text-green-400 font-mono mb-1">
              {stats.activeAccounts || 0}
            </div>
            <div className="text-green-500 text-xs font-mono uppercase tracking-wide">
              Active Accounts
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Testnet Accounts
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-mono mb-1">
              {stats.testnetAccounts || 0}
            </div>
            <div className="text-yellow-500 text-xs font-mono uppercase tracking-wide">
              Testnet Accounts
            </div>
          </div>
          <div className="bg-black/90 border border-green-500/50 rounded-lg p-4 hover:border-green-400/50 transition-all duration-300">
            <div className="text-green-600 text-xs font-mono mb-2">
              Supported Exchanges
            </div>
            <div className="text-3xl font-bold text-purple-400 font-mono mb-1">
              {stats.exchanges?.length || 0}
            </div>
            <div className="text-purple-500 text-xs font-mono uppercase tracking-wide">
              Supported Exchanges
            </div>
          </div>
        </div>
      )}
      
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
            Exchange Database
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-green-500/30">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">ACCOUNT_NAME</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">EXCHANGE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">USER_ID</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">TYPE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">CREATED</th>
                </tr>
              </thead>
                      <tbody>
                {items.map((account) => (
                  <tr key={account.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono font-bold">{account.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-500/20 text-blue-400 border border-blue-400/50 px-2 py-1 rounded text-xs font-mono">
                        {account.exchangeType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">{account.userId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        account.isTestnet ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50' : 'bg-green-500/20 text-green-400 border-green-400/50'
                      }`}>
                        {account.isTestnet ? 'TESTNET' : 'MAINNET'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${
                        account.isActive ? 'bg-green-500/20 text-green-400 border-green-400/50' : 'bg-red-500/20 text-red-400 border-red-400/50'
                      }`}>
                        {account.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-500 font-mono text-xs">
                        {new Date(account.createdAt).toLocaleDateString()}
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
              <div className="text-8xl mb-4">💱</div>
              <div className="text-sm font-mono mb-2">
                No exchange accounts found
              </div>
              <div className="text-xs mt-2 text-green-500">
                No exchange accounts found in the system
              </div>
            </div>
          )}

          </div>
      )}
    </div>
  )
}
