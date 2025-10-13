import { apiFetch, ApiPaths } from '../utils/api'
import type { Transaction, TransactionStats, TransactionSummary } from '../types'

export const transactionService = {
  async getAllTransactions(): Promise<Transaction[]> {
    return apiFetch<Transaction[]>(ApiPaths.transactions)
  },

  async getTransactionById(id: string): Promise<Transaction> {
    return apiFetch<Transaction>(ApiPaths.transactionById(id))
  },

  async getTransactionStats(): Promise<TransactionStats> {
    return apiFetch<TransactionStats>(ApiPaths.transactionStats)
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return apiFetch<Transaction[]>(ApiPaths.userTransactions(userId))
  },

  async getUserTransactionSummary(userId: string): Promise<TransactionSummary> {
    return apiFetch<TransactionSummary>(ApiPaths.userTransactionSummary(userId))
  }
}
