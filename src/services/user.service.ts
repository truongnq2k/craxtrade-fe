import { apiFetch, ApiPaths } from '../utils/api'
import type { User, ExchangeAccount, BotInstance, Signal, Trade, Transaction, ExchangeAccountSummary, BotSummary, SignalSummary, TradeSummary, TransactionSummary } from '../types'

export const userService = {
  async getAllUsers(): Promise<User[]> {
    return apiFetch<User[]>(ApiPaths.users)
  },

  async getUserById(id: string): Promise<User> {
    return apiFetch<User>(ApiPaths.userById(id))
  },

  async getUserByEmail(email: string): Promise<User> {
    return apiFetch<User>(ApiPaths.userByEmail(email))
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    return apiFetch<User>(ApiPaths.userById(id), {
      method: 'PUT',
      body: userData
    })
  },

  async updateUserPassword(id: string, passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    return apiFetch<void>(ApiPaths.userPassword(id), {
      method: 'PUT',
      body: passwordData
    })
  },

  async toggleUserActive(id: string): Promise<User> {
    return apiFetch<User>(ApiPaths.userToggle(id), {
      method: 'PUT'
    })
  },

  async addCredits(userId: string, amount: string): Promise<User> {
    return apiFetch<User>(ApiPaths.userCredits, {
      method: 'POST',
      body: { userId, amount }
    })
  },

  async getUserExchangeAccounts(userId: string): Promise<ExchangeAccount[]> {
    return apiFetch<ExchangeAccount[]>(ApiPaths.userExchangeAccounts(userId))
  },

  async getUserExchangeSummary(userId: string): Promise<ExchangeAccountSummary> {
    return apiFetch<ExchangeAccountSummary>(ApiPaths.userExchangeSummary(userId))
  },

  async getUserBots(userId: string): Promise<BotInstance[]> {
    return apiFetch<BotInstance[]>(ApiPaths.userBots(userId))
  },

  async getUserBotSummary(userId: string): Promise<BotSummary> {
    return apiFetch<BotSummary>(ApiPaths.userBotSummary(userId))
  },

  async getUserSignals(userId: string): Promise<Signal[]> {
    return apiFetch<Signal[]>(ApiPaths.userSignals(userId))
  },

  async getUserSignalSummary(userId: string): Promise<SignalSummary> {
    return apiFetch<SignalSummary>(ApiPaths.userSignalSummary(userId))
  },

  async getUserTrades(userId: string): Promise<Trade[]> {
    return apiFetch<Trade[]>(ApiPaths.userTrades(userId))
  },

  async getUserTradeSummary(userId: string): Promise<TradeSummary> {
    return apiFetch<TradeSummary>(ApiPaths.userTradeSummary(userId))
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return apiFetch<Transaction[]>(ApiPaths.userTransactions(userId))
  },

  async getUserTransactionSummary(userId: string): Promise<TransactionSummary> {
    return apiFetch<TransactionSummary>(ApiPaths.userTransactionSummary(userId))
  }
}
