import { useEffect, useState } from 'react'
import { exchangeAccountService } from '../services/exchange-account.service'
import { useAuthStore } from '../store/auth'
import { apiFetch, ApiPaths } from '../utils/api'

interface ExchangeAccount {
  id: string
  userId: string
  exchange: string
  apiKey: string
  apiSecret: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CreateExchangeAccountForm {
  exchange: string
  apiKey: string
  apiSecret: string
}

export function UserExchangeAccountsPage() {
  const { user } = useAuthStore()
  const [accounts, setAccounts] = useState<ExchangeAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showSecret, setShowSecret] = useState<{ [key: string]: boolean }>({})
  const [createLoading, setCreateLoading] = useState(false)
  const [formData, setFormData] = useState<CreateExchangeAccountForm>({
    exchange: 'BINANCE',
    apiKey: '',
    apiSecret: ''
  })

  useEffect(() => {
    async function load() {
      try {
        if (!user?.sub && !user?.userId) {
          setError('Thiếu userId trong token')
          return
        }
        const userId = user?.sub || user?.userId
        if (!userId) {
          setError('Thiếu userId trong token')
          return
        }
        // Use direct API call since service doesn't have user-specific method
        const res = await apiFetch<{ success: boolean; data: ExchangeAccount[] }>(ApiPaths.userExchangeAccounts(userId))
        setAccounts(res.data || [])
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Load failed')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    setError(null)

    try {
      const userId = user?.sub || user?.userId
      if (!userId) {
        setError('Thiếu userId trong token')
        return
      }
      
      const accountData = {
        userId: String(userId),
        exchange: formData.exchange as 'BINANCE',
        apiKey: formData.apiKey,
        apiSecret: formData.apiSecret
      }
      
      const newAccount = await exchangeAccountService.createExchangeAccount(accountData)
      setAccounts(prev => [newAccount, ...prev])
      setFormData({ exchange: 'BINANCE', apiKey: '', apiSecret: '' })
      setShowCreateForm(false)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Create failed')
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleToggleActive(id: string) {
    try {
      const updatedAccount = await exchangeAccountService.toggleAccountActive(id)
      setAccounts(prev => prev.map(acc => 
        acc.id === id ? updatedAccount : acc
      ))
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Toggle failed')
    }
  }

  async function handleDeleteAccount(id: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return

    try {
      await exchangeAccountService.deleteExchangeAccount(id)
      setAccounts(prev => prev.filter(acc => acc.id !== id))
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Delete failed')
    }
  }

  function toggleSecretVisibility(id: string) {
    setShowSecret(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function maskSecret(secret: string) {
    return secret.length > 8 ? `${secret.substring(0, 4)}****${secret.substring(secret.length - 4)}` : secret
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [EXCHANGE_ACCOUNTS]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            $ ./manage_exchange_accounts.sh
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 transition-all duration-300"
        >
          [ADD_ACCOUNT]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> ERROR: {error}
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateForm && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
          style={{ animation: 'fadeIn 0.3s ease-in-out' }}
        >
          <div 
            className="bg-black/90 border border-green-500/50 rounded-lg p-6 max-w-md w-full mx-4 transform transition-all duration-300"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 border-b border-green-500/50 pb-4">
              <h2 className="text-xl font-bold text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
                [CREATE_EXCHANGE_ACCOUNT]
              </h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-red-400 hover:text-red-300 text-xl font-mono"
              >
                [X]
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="mb-4">
              <div className="text-green-600 text-xs font-mono mb-4 animate-pulse">
                $ ./init_exchange_account_connection.sh
              </div>
              
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="text-green-400 text-xs font-mono mb-1 block">EXCHANGE_TYPE</label>
                  <select
                    value={formData.exchange}
                    onChange={(e) => setFormData(prev => ({ ...prev, exchange: e.target.value }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
                    required
                  >
                    <option value="BINANCE">BINANCE</option>
                  </select>
                </div>

                <div>
                  <label className="text-green-400 text-xs font-mono mb-1 block">API_KEY</label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                    placeholder="Enter your API Key"
                    required
                  />
                </div>

                <div>
                  <label className="text-green-400 text-xs font-mono mb-1 block">API_SECRET</label>
                  <input
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiSecret: e.target.value }))}
                    className="w-full bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                    placeholder="Enter your API Secret"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/30 transition-all duration-300"
                  >
                    [CANCEL]
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 px-4 py-2 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 disabled:opacity-50 transition-all duration-300"
                  >
                    {createLoading ? '[CREATING...]' : '[CREATE_ACCOUNT]'}
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-green-500/50 pt-4">
              <div className="text-xs font-mono text-green-600 text-center">
                <div className="animate-pulse">CONNECTION: SECURE</div>
                <div className="mt-1">ENCRYPTION: AES-256</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Accounts Table */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-green-400 font-mono animate-pulse">
            $ ./loading_exchange_accounts.sh
          </div>
          <div className="text-green-600 text-sm mt-2">
            SYSTEM: PROCESSING...
          </div>
        </div>
      )}

      {!loading && !error && accounts.length === 0 && (
        <div className="text-center py-12 bg-black/50 border border-green-500/30 rounded-lg">
          <div className="text-green-400 text-lg font-mono mb-2">
            No exchange accounts found
          </div>
          <div className="text-green-600 text-sm">
            $ ./init_first_exchange_account.sh
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 px-4 py-2 bg-green-500 text-black font-mono rounded hover:bg-green-400 transition-all duration-300"
          >
            [CREATE_FIRST_ACCOUNT]
          </button>
        </div>
      )}

      {!loading && !error && accounts.length > 0 && (
        <div className="bg-black/50 border border-green-500/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/80 border-b border-green-500/50">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">Exchange</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">API Key</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">API Secret</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">Created</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/20">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-green-500/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono text-xs">
                        {account.id.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-mono text-xs bg-green-500/10 px-2 py-1 rounded">
                        {account.exchange}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-green-300 font-mono text-xs bg-black/50 px-2 py-1 rounded">
                        {account.apiKey.substring(0, 8)}...
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <code className="text-green-300 font-mono text-xs bg-black/50 px-2 py-1 rounded">
                          {showSecret[account.id] ? account.apiSecret : maskSecret(account.apiSecret)}
                        </code>
                        <button
                          onClick={() => toggleSecretVisibility(account.id)}
                          className="text-green-600 hover:text-green-400 text-xs"
                        >
                          [{showSecret[account.id] ? 'HIDE' : 'SHOW'}]
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${
                        account.isActive 
                          ? 'text-green-400 bg-green-500/20' 
                          : 'text-red-400 bg-red-500/20'
                      }`}>
                        [{account.isActive ? 'ACTIVE' : 'INACTIVE'}]
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-mono text-xs">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleActive(account.id)}
                          className={`text-xs font-mono px-2 py-1 rounded ${
                            account.isActive
                              ? 'text-yellow-400 bg-yellow-500/20 hover:bg-yellow-500/30'
                              : 'text-green-400 bg-green-500/20 hover:bg-green-500/30'
                          } transition-colors`}
                        >
                          [{account.isActive ? 'DEACTIVATE' : 'ACTIVATE'}]
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.id)}
                          className="text-xs font-mono px-2 py-1 text-red-400 bg-red-500/20 hover:bg-red-500/30 rounded transition-colors"
                        >
                          [DELETE]
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Status */}
      {!loading && !error && (
        <div className="bg-black/50 border border-green-500/30 rounded-lg p-4">
          <div className="flex justify-between items-center text-xs font-mono text-green-600">
            <div className="flex items-center space-x-4">
              <span className="animate-pulse">SYSTEM: OPERATIONAL</span>
              <span>•</span>
              <span>ACCOUNTS: {accounts.length}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>API: SECURE</span>
              <span>•</span>
              <span>STATUS: MONITORED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
