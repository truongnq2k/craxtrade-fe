import { apiFetch, ApiPaths } from '../utils/api'
import type { ExchangeAccount, CreateExchangeAccountRequest, BotInstance, ExchangeAccountStats } from '../types'

export const exchangeAccountService = {
  async getAllExchangeAccounts(): Promise<ExchangeAccount[]> {
    return apiFetch<ExchangeAccount[]>(ApiPaths.exchangeAccounts)
  },

  async getExchangeAccountById(id: string): Promise<ExchangeAccount> {
    return apiFetch<ExchangeAccount>(ApiPaths.exchangeAccountById(id))
  },

  async createExchangeAccount(accountData: CreateExchangeAccountRequest): Promise<ExchangeAccount> {
    return apiFetch<ExchangeAccount>(ApiPaths.exchangeAccounts, {
      method: 'POST',
      body: accountData
    })
  },

  async updateExchangeAccount(id: string, accountData: Partial<ExchangeAccount>): Promise<ExchangeAccount> {
    return apiFetch<ExchangeAccount>(ApiPaths.exchangeAccountById(id), {
      method: 'PUT',
      body: accountData
    })
  },

  async deleteExchangeAccount(id: string): Promise<void> {
    return apiFetch<void>(ApiPaths.exchangeAccountById(id), {
      method: 'DELETE'
    })
  },

  async toggleAccountActive(id: string): Promise<ExchangeAccount> {
    return apiFetch<ExchangeAccount>(ApiPaths.exchangeAccountToggle(id), {
      method: 'PUT'
    })
  },

  async getAccountWithBots(id: string): Promise<{ exchangeAccount: ExchangeAccount; bots: BotInstance[] }> {
    return apiFetch<{ exchangeAccount: ExchangeAccount; bots: BotInstance[] }>(ApiPaths.exchangeAccountBots(id))
  },

  async getAccountsByType(type: string): Promise<ExchangeAccount[]> {
    return apiFetch<ExchangeAccount[]>(ApiPaths.exchangeAccountsByType(type))
  },

  async getExchangeAccountStats(): Promise<ExchangeAccountStats> {
    return apiFetch<ExchangeAccountStats>(ApiPaths.exchangeAccountStats)
  }
}
