import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/auth'
import { useNavigate } from 'react-router-dom'
import { signalService } from '../services/signal.service'
import { userService } from '../services/user.service'
import { newsService } from '../services/news.service'
import { voucherService } from '../services/voucher.service'

interface DashboardData {
  balance: number
  activeBots: Array<{
    id: string
    name: string
    status: string
    profit: number
    pair: string
  }>
  recentTransactions: Array<{
    id: string
    type: string
    amount: number
    status: string
    createdAt: string
  }>
  latestNews: Array<{
    id: string
    title: string
    source: string
    publishedAt: string
    marketImpact: number
  }>
  recentSignals: Array<{
    id: string
    type: string
    symbol: string
    confidence: number
    createdAt: string
  }>
  accountInfo: {
    totalBalance: number
    activeAccounts: number
    currency: string
  }
}

export function UserDashboardPage() {
  const { userProfile, user } = useAuthStore()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData>({
    balance: 0,
    activeBots: [],
    recentTransactions: [],
    latestNews: [],
    recentSignals: [],
    accountInfo: {
      totalBalance: 0,
      activeAccounts: 0,
      currency: 'USD'
    }
  })
  const [loading, setLoading] = useState(true)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherLoading, setVoucherLoading] = useState(false)
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT')

  const tradingSymbols = [
    { value: 'BTCUSDT', label: 'BTC/USDT' },
    { value: 'ETHUSDT', label: 'ETH/USDT' },
    { value: 'BNBUSDT', label: 'BNB/USDT' },
    { value: 'ADAUSDT', label: 'ADA/USDT' },
    { value: 'SOLUSDT', label: 'SOL/USDT' },
    { value: 'XRPUSDT', label: 'XRP/USDT' },
    { value: 'DOGEUSDT', label: 'DOGE/USDT' },
    { value: 'DOTUSDT', label: 'DOT/USDT' },
    { value: 'MATICUSDT', label: 'MATIC/USDT' },
    { value: 'LINKUSDT', label: 'LINK/USDT' }
  ]

  useEffect(() => {
    loadDashboardData()
  }, [userProfile, user])

  async function loadDashboardData() {
    try {
      setLoading(true)

      // Debug: log current auth state
    console.log('Auth state:', { userProfile: !!userProfile, user: !!user })

      // Load news data without user requirement
      const newsData = await newsService.getNews({ page: 1, limit: 5 }).catch((error) => {
        console.error('News API error:', error)
        return { news: [] }
      })

      // Load user-specific data if logged in
      let signals = []
      let accounts = []
      let transactions = []

      // Try to get userId from userProfile first, then fallback to decoded token
    const userId = userProfile?.id || user?.sub || user?.userId

    if (userId) {
        console.log('Using userId:', userId)

        try {
          const userSignals = await signalService.getUserSignals(userId)
          signals = userSignals
          console.log('Signals loaded:', userSignals.length || 0)
        } catch (signalError) {
          console.error('Error fetching signals:', signalError)
          signals = []
        }

        const userAccounts = await userService.getUserExchangeAccounts(userId).catch(() => [])
        accounts = userAccounts

        // Load transactions
        try {
          const transactionsResponse = await fetch(`/api/users/${userId}/transactions`, {
            headers: {
              'Authorization': `Bearer ${useAuthStore.getState().token}`,
              'Content-Type': 'application/json'
            }
          })
          const transactionsData = await transactionsResponse.json()
          transactions = transactionsData.transactions || []
        } catch (error) {
          console.error('Failed to load transactions:', error)
          transactions = []
        }
      } else {
        console.log('No userId found, skipping user data')
      }

      // Process signals data
      const recentSignals = Array.isArray(signals)
        ? signals.slice(0, 5).map((signal: any) => ({
            id: signal.id,
            type: signal.type,
            symbol: signal.symbol,
            entryPrice: signal.entryPrice,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit,
            confidence: signal.confidence,
            createdAt: signal.createdAt
          }))
        : []

      // Process accounts data (with safety check)
      const totalBalance = Array.isArray(accounts) ? accounts.reduce((sum: number, account: any) =>
        sum + (account.balance || 0), 0
      ) : 0
      const activeAccounts = Array.isArray(accounts) ? accounts.filter((account: any) => account.isActive).length : 0

      // Process news data
      const latestNews = newsData.news ? newsData.news.slice(0, 5).map((news: any) => ({
        id: news.id,
        title: news.title,
        source: news.source,
        publishedAt: news.publishedAt,
        marketImpact: news.marketImpact || 50
      })) : []

      // Process transactions data
      const recentTransactions = Array.isArray(transactions)
        ? transactions.slice(0, 5).map((transaction: any) => ({
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount,
            status: transaction.status,
            createdAt: transaction.createdAt
          }))
        : []

      // Process bot instances data
      let activeBots = []
      try {
        if (userId) {
          const userIdForBots = userId
          const botsResponse = await fetch(`/api/users/${userIdForBots}/bot-instances`, {
            headers: {
              'Authorization': `Bearer ${useAuthStore.getState().token}`,
              'Content-Type': 'application/json'
            }
          })
          const botsData = await botsResponse.json()
          activeBots = Array.isArray(botsData) ? botsData.map((bot: any) => ({
            id: bot.id,
            name: bot.name,
            status: bot.status,
            profit: bot.profit || 0,
            pair: bot.pair || 'N/A'
          })) : []
        }
      } catch (error) {
        console.error('Failed to load bots:', error)
        activeBots = []
      }

      const finalData = {
        balance: totalBalance,
        activeBots,
        recentTransactions,
        latestNews,
        recentSignals,
        accountInfo: {
          totalBalance,
          activeAccounts,
          currency: 'USD'
        }
      }

      setData(finalData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  function getSignalBadgeClass(type: string) {
    switch (type) {
      case 'BUY': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'SELL': return 'bg-red-500/20 text-red-400 border-red-400/50'
      case 'HOLD': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  function getStatusBadgeClass(status: string) {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'PAUSED': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'PENDING': return 'bg-blue-500/20 text-blue-400 border-blue-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  async function handleVoucherSubmit() {
    if (!voucherCode.trim()) {
      setVoucherMessage({ type: 'error', text: 'Please enter a voucher code' })
      return
    }

    setVoucherLoading(true)
    setVoucherMessage(null)

    try {
      if (!userId) return
      const userIdForVoucher = userId
      if (!userId) return

      const result = await voucherService.useVoucher({ code: voucherCode.trim() })

      setVoucherMessage({
        type: 'success',
        text: `Voucher activated successfully! ${result.message || ''}`
      })
      setVoucherCode('')

      // Refresh dashboard data to show updated balance
      loadDashboardData()
    } catch (error: any) {
      setVoucherMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Failed to activate voucher'
      })
    } finally {
      setVoucherLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-600">
          <div className="text-sm font-mono animate-pulse">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
          [USER_DASHBOARD]
        </h1>
        <p className="text-green-600 text-sm font-mono mt-1">
          Welcome back, {userProfile?.email?.split('@')[0] || 'User'}
        </p>
      </div>

      {/* TradingView Chart Section */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-green-400 font-mono">CHART</h3>
          <div className="flex items-center space-x-2">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="bg-black/50 border border-green-500/50 text-green-400 font-mono text-xs px-2 py-1 rounded focus:outline-none focus:border-green-400"
            >
              {tradingSymbols.map((symbol) => (
                <option key={symbol.value} value={symbol.value}>
                  {symbol.label}
                </option>
              ))}
            </select>
            <span className="text-green-500 text-xs font-mono">LIVE</span>
          </div>
        </div>
        <div className="bg-black/50 rounded-lg border border-green-500/20 overflow-hidden">
          <iframe
            src={`https://www.tradingview.com/widgetembed/?frameElementId=tradingview-widget&symbol=${selectedSymbol}&interval=15&theme=dark&style=1&extensions=%5B%7B%22name%22%3A%22symbol-info%22%2C%22src%22%3Afalse%7D%5D&enablePublishing=false&allowScriptChange=4&locale=en&utm_source=www.tradingview.com&utm_medium=widget&utm_campaign=chart-widget&utm_term=${selectedSymbol}`}
            className="w-full h-96"
            frameBorder="0"
            allowtransparency
            scrolling="no"
            allowFullScreen
            key={selectedSymbol}
          ></iframe>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-green-600 text-xs font-mono">24H_CHANGE</div>
            <div className="text-green-400 font-mono text-sm">+2.45%</div>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-xs font-mono">VOLUME</div>
            <div className="text-green-400 font-mono text-sm">1.2B</div>
          </div>
          <div className="text-center">
            <div className="text-green-600 text-xs font-mono">TREND</div>
            <div className="text-green-400 font-mono text-sm">BULLISH</div>
          </div>
        </div>
      </div>

      {/* ROW 2: Active Bots | Recent Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Bots */}
        <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-sm font-bold text-green-400 font-mono mb-3">ACTIVE_BOTS</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto terminal-scrollbar">
            {data.activeBots.length > 0 ? (
              data.activeBots.map((bot) => (
                <div key={bot.id} className="flex items-center justify-between py-1 text-xs border-b border-green-500/20 hover:bg-green-500/5 transition-colors">
                  <div className="flex items-center justify-between flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-mono">{bot.name}</span>
                      <span className="text-green-600 font-mono">{bot.pair}</span>
                      <span className={`text-xs font-mono px-1 py-0.5 rounded border ${getStatusBadgeClass(bot.status)}`}>
                        {bot.status}
                      </span>
                    </div>
                    <div className={`text-xs font-mono font-semibold ${bot.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.profit >= 0 ? '+' : ''}{formatCurrency(bot.profit)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-green-600">
                <div className="text-4xl mb-2">🤖</div>
                <div className="text-xs font-mono mb-1">NO_ACTIVE_BOTS</div>
                <div className="text-xs font-mono">Create your first trading bot</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Signals */}
        <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-sm font-bold text-green-400 font-mono mb-3">RECENT_SIGNALS</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto terminal-scrollbar">
            {data.recentSignals.length > 0 ? (
              data.recentSignals.map((signal) => (
                <div key={signal.id} className="py-2 text-xs border-b border-green-500/20 hover:bg-green-500/5 transition-colors">
                  {/* Line 1: Type | Symbol | Confidence | Time */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono px-1 py-0.5 rounded border ${getSignalBadgeClass(signal.type)}`}>
                        {signal.type}
                      </span>
                      <span className="text-green-400 font-mono font-bold">{signal.symbol}</span>
                      <span className="text-green-600 font-mono">{signal.confidence}%</span>
                    </div>
                    <span className="text-green-700 font-mono text-xs">{formatTimeAgo(signal.createdAt)}</span>
                  </div>

                  {/* Line 2: Entry | SL | TP */}
                  <div className="flex items-center justify-between space-x-1">
                    <div className="flex items-center space-x-1 text-green-500">
                      <span className="font-mono">E:</span>
                      <span className="font-mono text-green-400">{signal.entryPrice || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-500">
                      <span className="font-mono">SL:</span>
                      <span className="font-mono text-red-400">{signal.stopLoss || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-green-500">
                      <span className="font-mono">TP:</span>
                      <span className="font-mono text-green-400">{signal.takeProfit || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-green-600">
                <div className="text-4xl mb-2">📡</div>
                <div className="text-xs font-mono mb-1">NO_SIGNALS</div>
                <div className="text-xs font-mono">Trading signals will appear here</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: Recent Transactions | Voucher Activation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-sm font-bold text-green-400 font-mono mb-3">RECENT_TRANSACTIONS</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto terminal-scrollbar">
            {data.recentTransactions.length > 0 ? (
              data.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-1 text-xs border-b border-green-500/20 hover:bg-green-500/5 transition-colors">
                  <div className="flex items-center justify-between flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-mono px-1 py-0.5 rounded border ${getSignalBadgeClass(transaction.type)}`}>
                        {transaction.type}
                      </span>
                      <span className={`text-xs font-mono px-1 py-0.5 rounded border ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      <span className="text-green-700 font-mono">{formatTimeAgo(transaction.createdAt)}</span>
                    </div>
                    <div className={`text-xs font-mono font-semibold ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-green-600">
                <div className="text-4xl mb-2">💳</div>
                <div className="text-xs font-mono mb-1">NO_TRANSACTIONS</div>
                <div className="text-xs font-mono">Your transaction history will appear here</div>
              </div>
            )}
          </div>
        </div>

        {/* Voucher Activation */}
        <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-sm font-bold text-green-400 font-mono mb-3">VOUCHER_ACTIVATION</h3>
          <div className="space-y-3">
            <div className="flex space-x-2">
              <input
                type="text"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Enter code..."
                className="flex-1 bg-black/50 border border-green-500/50 rounded px-3 py-2 text-green-400 font-mono text-sm placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
                disabled={voucherLoading}
              />
              <button
                onClick={handleVoucherSubmit}
                disabled={voucherLoading || !voucherCode.trim()}
                className="px-3 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded text-sm"
              >
                {voucherLoading ? '...' : 'ACTIVATE'}
              </button>
            </div>

            {voucherMessage && (
              <div className={`p-2 rounded border text-xs ${
                voucherMessage.type === 'success'
                  ? 'bg-green-500/20 text-green-400 border-green-500/50'
                  : 'bg-red-500/20 text-red-400 border-red-500/50'
              }`}>
                <div className="font-mono">{voucherMessage.text}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ROW 4: Latest News */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
        <h3 className="text-lg font-bold text-green-400 font-mono mb-4">LATEST_NEWS</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto terminal-scrollbar">
          {data.latestNews.length > 0 ? (
            data.latestNews.map((news) => (
              <div key={news.id} className="border-b border-green-500/20 pb-3 hover:bg-green-500/5 transition-colors rounded p-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-mono text-green-400 mb-1">{news.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-green-600">
                      <span className="font-mono">{news.source}</span>
                      <span className="font-mono">•</span>
                      <span className="font-mono">{formatTimeAgo(news.publishedAt)}</span>
                      {news.marketImpact && (
                        <>
                          <span className="font-mono">•</span>
                          <span className={`font-mono ${
                            news.marketImpact > 70 ? 'text-red-400' :
                            news.marketImpact > 40 ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            IMPACT: {news.marketImpact}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-green-600">
              <div className="text-4xl mb-2">📰</div>
              <div className="text-sm font-mono mb-1">NO_NEWS_AVAILABLE</div>
              <div className="text-xs font-mono">Market news will appear here</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => navigate('/dashboard/bots')}
              className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 font-mono hover:bg-blue-500/30 transition-all duration-300 rounded text-sm"
            >
              MANAGE_BOTS
            </button>
            <button
              onClick={() => navigate('/dashboard/signals')}
              className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 transition-all duration-300 rounded text-sm"
            >
              VIEW_SIGNALS
            </button>
            <button
              onClick={() => navigate('/dashboard/accounts')}
              className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-mono hover:bg-purple-500/30 transition-all duration-300 rounded text-sm"
            >
              ACCOUNTS
            </button>
            <button
              onClick={() => navigate('/dashboard/create-bot')}
              className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 font-mono hover:bg-orange-500/30 transition-all duration-300 rounded text-sm"
            >
              NEW_BOT
            </button>
          </div>
          <div className="text-green-600 text-xs font-mono">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}
