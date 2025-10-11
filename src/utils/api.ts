import { useAuthStore } from '../store/auth'

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:9999'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export async function apiFetch<T>(path: string, options: {
  method?: HttpMethod
  body?: unknown
  headers?: Record<string, string>
  auth?: boolean
} = {}): Promise<T> {
  const state = useAuthStore.getState()
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (options.auth !== false && state.token) {
    headers['Authorization'] = `Bearer ${state.token}`
  }

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data?.error || data?.message || `HTTP ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export const ApiPaths = {
  // Auth
  login: '/api/login',
  signup: '/api/signup',
  
  // Users
  users: '/api/users',
  userById: (id: string) => `/api/users/${id}`,
  userByEmail: (email: string) => `/api/users/email/${email}`,
  userToggle: (id: string) => `/api/users/${id}/toggle`,
  userPassword: (id: string) => `/api/users/${id}/password`,
  userCredits: '/api/users/credits',
  
  // User specific endpoints
  userExchangeAccounts: (userId: string) => `/api/users/${userId}/exchange-accounts`,
  userExchangeSummary: (userId: string) => `/api/users/${userId}/exchange-summary`,
  userBots: (userId: string) => `/api/users/${userId}/bot-instances`,
  userBotSummary: (userId: string) => `/api/users/${userId}/bot-summary`,
  userSignals: (userId: string) => `/api/users/${userId}/signals`,
  userSignalSummary: (userId: string) => `/api/users/${userId}/signal-summary`,
  userTrades: (userId: string) => `/api/users/${userId}/trades`,
  userTradeSummary: (userId: string) => `/api/users/${userId}/trade-summary`,
  userTransactions: (userId: string) => `/api/users/${userId}/transactions`,
  userTransactionSummary: (userId: string) => `/api/users/${userId}/transaction-summary`,
  
  // Exchange Accounts
  exchangeAccounts: '/api/exchange-accounts',
  exchangeAccountById: (id: string) => `/api/exchange-accounts/${id}`,
  exchangeAccountToggle: (id: string) => `/api/exchange-accounts/${id}/toggle`,
  exchangeAccountValidate: (id: string) => `/api/exchange-accounts/${id}/validate-access`,
  exchangeAccountBots: (id: string) => `/api/exchange-accounts/${id}/bots`,
  exchangeAccountStats: '/api/exchange-accounts/stats',
  exchangeAccountsByType: (type: string) => `/api/exchange-accounts/exchange/${type}`,
  
  // Bot Instances
  botInstances: '/api/bot-instances',
  botInstanceById: (id: string) => `/api/bot-instances/${id}`,
  botInstanceDetails: (id: string) => `/api/bot-instances/${id}/details`,
  botInstancePerformance: (id: string) => `/api/bot-instances/${id}/performance`,
  botInstanceValidate: (id: string) => `/api/bot-instances/${id}/validate-access`,
  botInstanceStart: (id: string) => `/api/bot-instances/${id}/start`,
  botInstanceStop: (id: string) => `/api/bot-instances/${id}/stop`,
  botInstancePause: (id: string) => `/api/bot-instances/${id}/pause`,
  botInstanceResume: (id: string) => `/api/bot-instances/${id}/resume`,
  botInstanceStats: '/api/bot-instances/stats',
  botInstancesByType: (type: string) => `/api/bot-instances/type/${type}`,
  botInstancesBySymbol: (symbol: string) => `/api/bot-instances/symbol/${symbol}`,
  botInstancesByStatus: (status: string) => `/api/bot-instances/status/${status}`,
  
  // Signals
  signals: '/api/signals',
  signalById: (id: string) => `/api/signals/${id}`,
  signalWithTrades: (id: string) => `/api/signals/${id}/trades`,
  signalValidate: (id: string, userId: string) => `/api/signals/${id}/validate/${userId}`,
  signalStats: '/api/signals/stats',
  signalsBySymbol: (symbol: string) => `/api/signals/symbol/${symbol}`,
  signalsByType: (type: string) => `/api/signals/type/${type}`,
  recentSignals: '/api/signals/recent',
  
  // Trades
  trades: '/api/trades',
  tradeById: (id: string) => `/api/trades/${id}`,
  tradeDetails: (id: string) => `/api/trades/${id}/details`,
  tradeClose: (id: string) => `/api/trades/${id}/close`,
  tradeValidate: (id: string, userId: string) => `/api/trades/${id}/validate/${userId}`,
  tradeStats: '/api/trades/stats',
  openTrades: '/api/trades/open',
  tradesByBot: (botId: string) => `/api/bot-instances/${botId}/trades`,
  tradesBySignal: (signalId: string) => `/api/signals/${signalId}/trades`,
  botTradeSummary: (botId: string) => `/api/bot-instances/${botId}/trade-summary`,
  
  // Transactions
  transactions: '/api/transactions',
  transactionById: (id: string) => `/api/transactions/${id}`,
  transactionStats: '/api/transactions/stats',
  
  // Vouchers
  vouchers: '/api/vouchers',
  voucherByCode: (code: string) => `/api/vouchers/code/${code}`,
  voucherUse: (id: string) => `/api/vouchers/${id}/use`,
  voucherBulk: '/api/vouchers/bulk',
  
  // News
  news: '/api/news',
  newsById: (id: string) => `/api/news/${id}`,
  newsStats: '/api/news/stats',
  recentNews: '/api/news/recent',
  newsBySource: (source: string) => `/api/news/source/${source}`,
  
  // Credit Packages
  creditPackages: '/api/credit-packages',
  creditPackageById: (id: string) => `/api/credit-packages/${id}`,
  activeCreditPackages: '/api/credit-packages/active',
}



