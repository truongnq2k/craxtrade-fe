import { apiFetch } from '../utils/api'

export interface Transaction {
  id: string
  userId: string
  type: 'PURCHASE' | 'CONSUMPTION' | 'REFUND' | 'BONUS'
  creditsUsed: number
  creditsRemaining: number
  description: string
  createdAt: string
  updatedAt: string
}

export interface TransactionListResult {
  transactions: Transaction[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface TransactionStats {
  totalCreditsUsed: number
  totalCreditsAdded: number
  netCredits: number
  transactionCount: number
  breakdownByType: Record<string, {
  count: number
  totalAmount: number
  }>
}

export interface UserTransactionSummary {
  userId: string
  currentCredits: number
  currentCreditsPackage: number
  totalCreditsUsed: number
  totalCreditsAdded: number
  lastTransaction?: Transaction
}

export const transactionService = {
  async getUserTransactions(userId: string, options?: {
    page?: number
    limit?: number
    type?: string
    startDate?: string
    endDate?: string
  }): Promise<TransactionListResult> {
    const params = new URLSearchParams()
    
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.type) params.append('type', options.type)
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    
    const response = await apiFetch<{ success: boolean; data: TransactionListResult }>(`/api/users/${userId}/transactions?${params}`)
    return response.data
  },

  async getUserTransactionSummary(userId: string): Promise<UserTransactionSummary> {
    const response = await apiFetch<{ success: boolean; data: UserTransactionSummary }>(`/api/users/${userId}/transaction-summary`)
    return response.data
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await apiFetch<{ success: boolean; data: Transaction }>(`/api/transactions/${id}`)
    return response.data
  },

  async getAllTransactions(options?: {
    page?: number
    limit?: number
    userId?: string
    type?: string
    startDate?: string
    endDate?: string
  }): Promise<TransactionListResult> {
    const params = new URLSearchParams()
    
    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.userId) params.append('userId', options.userId)
    if (options?.type) params.append('type', options.type)
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    
    const response = await apiFetch<{ success: boolean; data: TransactionListResult }>(`/api/transactions?${params}`)
    return response.data
  },

  async getTransactionStats(options?: {
    userId?: string
    startDate?: string
    endDate?: string
  }): Promise<TransactionStats> {
    const params = new URLSearchParams()
    
    if (options?.userId) params.append('userId', options.userId)
    if (options?.startDate) params.append('startDate', options.startDate)
    if (options?.endDate) params.append('endDate', options.endDate)
    
    const response = await apiFetch<{ success: boolean; data: TransactionStats }>(`/api/transactions/stats?${params}`)
    return response.data
  }
}
