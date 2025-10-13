// API Response Types
export type ApiResult<T> = {
  success: boolean
  data?: T
  error?: string
}

export type PaginatedResult<T> = {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  isActive: boolean
  credits: string
  creditsPackage: string
  creditsExpiresAt?: string
  lastLoginAt?: string
  role: 'ADMIN' | 'USER'
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface LoginResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'USER'
    isActive: boolean
  }
  tokens: {
    accessToken: string
    refreshToken: string
  }
}

export interface RegisterResponse {
  user: {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'USER'
    isActive: boolean
  }
}

export interface UserListQuery {
  page?: number
  limit?: number
  search?: string
  role?: 'ADMIN' | 'USER'
  isActive?: boolean
}

export interface UserListResponse {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface AddCreditRequest {
  userId: string
  amount: number
  type: 'PURCHASE' | 'CONSUMPTION' | 'REFUND' | 'BONUS'
  description?: string
}

// Exchange Account Types
export interface ExchangeAccount {
  id: string
  userId: string
  exchange: 'BINANCE'
  apiKey: string
  apiSecret: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateExchangeAccountRequest {
  exchange: 'BINANCE'
  apiKey: string
  apiSecret: string
}

export interface ExchangeAccountStats {
  totalAccounts: number
  activeAccounts: number
  inactiveAccounts: number
  accountsByExchange: {
    BINANCE: number
  }
}

// Bot Instance Types
export interface BotInstance {
  id: string
  userId: string
  botType: 'SPOT_GRID' | 'FUTURES_GRID' | 'SPOT_DCA' | 'FUTURES_DCA' | 'DUAL_GRID' | 'HEDGE_GRID' | 'INVERTED_HEDGE_GRID' | 'TREND_GRID' | 'PREMIUM'
  symbol: string
  leverage?: string
  marginMode?: 'CROSS' | 'ISOLATED'
  isHedgeMode?: boolean
  status: 'RUNNING' | 'PAUSED' | 'STOPPED' | 'ERROR'
  capital: string
  allocationPct?: string
  riskPerTrade?: string
  maxDrawdownPct?: string
  exchangeAccountId: string
  config: Record<string, unknown>
  metadata?: Record<string, unknown>
  startedAt: string
  stoppedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBotInstanceRequest {
  botType: BotInstance['botType']
  symbol: string
  leverage?: string
  marginMode?: 'CROSS' | 'ISOLATED'
  isHedgeMode?: boolean
  capital: string
  allocationPct?: string
  riskPerTrade?: string
  maxDrawdownPct?: string
  exchangeAccountId: string
  config: Record<string, unknown>
}

export interface BotStats {
  totalBots: number
  runningBots: number
  pausedBots: number
  stoppedBots: number
  totalCapital: string
  performance: number
}

export interface BotPerformance {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalPnl: string
  winRate: number
  profitFactor: number
  maxDrawdown: string
}

export interface BotDetails extends BotInstance {
  exchangeAccount: ExchangeAccount
  trades: Trade[]
  performance: BotPerformance
}

// Signal Types
export interface Signal {
  id: string
  userId: string
  type: 'BUY' | 'SELL' | 'HOLD'
  symbol: string
  entryPrice: string
  stopLoss?: string
  takeProfit?: string
  timeframe?: 'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D1'
  leverage?: string
  confidence?: string
  reasoning?: string
  creditsUsed: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateSignalRequest {
  type: Signal['type']
  symbol: string
  entryPrice: string
  stopLoss?: string
  takeProfit?: string
  timeframe?: Signal['timeframe']
  leverage?: string
  confidence?: string
  reasoning?: string
}

export interface SignalStats {
  totalSignals: number
  buySignals: number
  sellSignals: number
  holdSignals: number
  avgConfidence: string
}

export interface SignalWithTrades extends Signal {
  trades: Trade[]
}

// Trade Types
export interface Trade {
  id: string
  userId: string
  signalId: string
  symbol: string
  type: 'BUY' | 'SELL' | 'HOLD'
  entryPrice: string
  exitPrice?: string
  quantity: string
  leverage?: string
  pnl?: string
  fees?: string
  status: 'OPEN' | 'CLOSED' | 'STOPPED' | 'LIQUIDATED'
  botInstanceId?: string
  exchangeTradeId?: string
  closedAt?: string
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface CreateTradeRequest {
  signalId: string
  symbol: string
  type: Trade['type']
  entryPrice: string
  quantity: string
  leverage?: string
  botInstanceId?: string
}

export interface TradeStats {
  totalTrades: number
  openTrades: number
  closedTrades: number
  totalPnl: string
  winRate: number
}

export interface TradeDetails extends Trade {
  signal: Signal
  botInstance?: BotInstance
}

// Transaction Types
export interface Transaction {
  id: string
  userId: string
  type: 'PURCHASE' | 'CONSUMPTION' | 'REFUND' | 'BONUS'
  creditsUsed: string
  creditsRemaining: string
  description?: string
  createdAt: string
}

export interface TransactionStats {
  totalTransactions: number
  totalCreditsUsed: string
  transactionsByType: {
    PURCHASE: number
    CONSUMPTION: number
    REFUND: number
    BONUS: number
  }
}

// Voucher Types
export interface Voucher {
  id: string
  code: string
  name: string
  description?: string
  value: string
  isUsed: boolean
  isActive: boolean
  userId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateVoucherRequest {
  code: string
  name: string
  description?: string
  value: string
}

export interface UseVoucherRequest {
  code: string
}

export interface VoucherBulkRequest {
  vouchers: CreateVoucherRequest[]
}

// Credit Package Types
export interface CreditPackage {
  id: string
  name: string
  credits: string
  price: string
  description?: string
  durationDays: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCreditPackageRequest {
  name: string
  credits: string
  price: string
  description?: string
  durationDays?: number
}

// News Types
export interface News {
  id: string
  title: string
  summary: string
  source: string
  createdAt: string
}

export interface CreateNewsRequest {
  title: string
  summary: string
  source: string
}

export interface NewsStats {
  totalNews: number
  recentNews: number
  newsBySource: Record<string, number>
}

// User Summary Types
export interface UserSummary {
  user: User
  exchangeAccounts: ExchangeAccount[]
  bots: {
    total: number
    running: number
    paused: number
    stopped: number
  }
  signals: {
    total: number
    buy: number
    sell: number
    hold: number
  }
  trades: {
    total: number
    open: number
    closed: number
    totalPnl: string
  }
  transactions: {
    total: number
    totalCreditsUsed: string
  }
}

// Summary Stats Types
export interface ExchangeAccountSummary {
  totalAccounts: number
  activeAccounts: number
  totalBalance: string
}

export interface BotSummary {
  totalBots: number
  runningBots: number
  pausedBots: number
  stoppedBots: number
  totalCapital: string
}

export interface SignalSummary {
  totalSignals: number
  buySignals: number
  sellSignals: number
  holdSignals: number
  avgConfidence: string
}

export interface TradeSummary {
  totalTrades: number
  openTrades: number
  closedTrades: number
  totalPnl: string
  winRate: number
}

export interface TransactionSummary {
  totalTransactions: number
  totalCreditsUsed: string
  transactionsByType: {
    PURCHASE: number
    CONSUMPTION: number
    REFUND: number
    BONUS: number
  }
}

export interface UseVoucherResponse {
  success: boolean
  message: string
  credits: string
}

// System Config Types
export interface SystemConfig {
  id: string
  key: string
  value: unknown
  description?: string
  createdAt: string
  updatedAt: string
}

// Error Types
export interface ApiError {
  success: false
  error: string
  code?: string
  details?: unknown
}

// Common Types
export type SortOrder = 'asc' | 'desc'
export type SortField = string

export interface ListQuery<T extends string = string> {
  page?: number
  limit?: number
  search?: string
  sortBy?: T
  sortOrder?: SortOrder
}

export interface ListResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}
