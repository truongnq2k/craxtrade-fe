import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth'
import { transactionService, type Transaction } from '../services/transaction.service'

export function UserTransactionsPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    loadTransactions()
  }, [user, currentPage, filterType])

  async function loadTransactions() {
    try {
      setLoading(true)
      setError(null)
      
      if (!user?.sub && !user?.userId) {
        setError('[ERROR] Thiếu userId trong token')
        return
      }
      const userId = user?.sub || user?.userId
      if (!userId) {
        setError('[ERROR] Thiếu userId trong token')
        return
      }
      
      const result = await transactionService.getUserTransactions(userId, {
        page: currentPage,
        limit: pageSize,
        type: filterType || undefined
      })
      setTransactions(result.transactions)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] Load failed')
    } finally {
      setLoading(false)
    }
  }

  function getTransactionColor(type: string) {
    switch (type) {
      case 'PURCHASE': return 'text-green-400'
      case 'CONSUMPTION': return 'text-red-400'
      case 'REFUND': return 'text-blue-400'
      case 'BONUS': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  function getTransactionIcon(type: string) {
    switch (type) {
      case 'PURCHASE': return '💳'
      case 'CONSUMPTION': return '📉'
      case 'REFUND': return '↩️'
      case 'BONUS': return '🎁'
      default: return '📋'
    }
  }

  function getTypeBadgeClass(type: string) {
    switch (type) {
      case 'PURCHASE': {
        return 'bg-green-500/20 text-green-400 border-green-400/50'
      }
      case 'CONSUMPTION': {
        return 'bg-red-500/20 text-red-400 border-red-400/50'
      }
      case 'REFUND': {
        return 'bg-blue-500/20 text-blue-400 border-blue-400/50'
      }
      case 'BONUS': {
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
      }
      default: {
        return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
      }
    }
  }

  function formatCredits(amount: number, type: string) {
    const prefix = type === 'CONSUMPTION' ? '-' : '+'
    return `${prefix}${Math.abs(amount)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [TRANSACTION_LOG]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            Transaction History
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-mono hover:bg-red-500/30 transition-all duration-300 rounded"
        >
          [BACK_TO_DASHBOARD]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> {error}
        </div>
      )}

      
      {/* Transaction List */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
        <div className="text-green-600 text-xs font-mono mb-6">
          Transaction Database
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-green-400 text-xs font-mono">FILTER_TYPE</label>
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
          >
            <option value="">All Types</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="CONSUMPTION">CONSUMPTION</option>
            <option value="REFUND">REFUND</option>
            <option value="BONUS">BONUS</option>
          </select>
        </div>

        {/* Loading State */}
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

        {/* Transaction Table */}
        {!loading && transactions.length === 0 && (
          <div className="text-center py-12 text-green-600">
            <div className="mb-4">
              <div className="inline-block">
                <div className="w-24 h-24 border-4 border-green-500 rounded-full flex items-center justify-center bg-black/50">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2v12c0 1.11.89 2 2 2h16l-4-4h4m0-6l-4-4m-4 4V6m0 4v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"/>
                    <path d="M8 12h.01M12 12h.01M16 12h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-sm font-mono mb-2">
              No transactions found
            </div>
            <div className="text-xs mt-2">
              No transactions found for the selected criteria
            </div>
          </div>
        )}

        {!loading && transactions.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-green-500/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">ID</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">TYPE</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">AMOUNT</th>
                    <th className="px-4 px-4 py-3 text-left text-green-400 font-mono text-xs">REMAINING</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">DESCRIPTION</th>
                    <th className="px-4 py-3 text-left text-green-400 font-mono text-xs">DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-green-500/20 hover:bg-green-500/5 transition-all duration-300">
                      <td className="px-4 py-3">
                        <span className="text-green-500 font-mono text-xs">
                          #{transaction.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded ${getTypeBadgeClass(transaction.type)}`}>
                          {getTransactionIcon(transaction.type)} {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono ${getTransactionColor(transaction.type)}`}>
                          {formatCredits(transaction.creditsUsed, transaction.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-300 font-mono">
                          {transaction.creditsRemaining}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-mono text-sm max-w-xs">
                          {transaction.description || 'No description'}
                        </span>
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

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-green-500/30">
              <div className="text-green-600 text-xs font-mono">
                <div>Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, transactions.length)}</div>
                <div className="mt-1">Total: {transactions.length} transactions</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                >
                  [PREV]
                </button>
                <button
                  onClick={() => loadTransactions()}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 transition-all duration-300 rounded"
                >
                  [REFRESH]
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 transition-all duration-300 rounded"
                >
                  [NEXT]
                </button>
              </div>
            </div>
          </>
        )}

        </div>
    </div>
  )
}
