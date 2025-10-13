import { apiFetch, ApiPaths } from '../utils/api'
import type { Trade, CreateTradeRequest, TradeStats, TradeDetails, TradeSummary } from '../types'

export const tradeService = {
  async getAllTrades(): Promise<Trade[]> {
    return apiFetch<Trade[]>(ApiPaths.trades)
  },

  async getTradeById(id: string): Promise<Trade> {
    return apiFetch<Trade>(ApiPaths.tradeById(id))
  },

  async createTrade(tradeData: CreateTradeRequest): Promise<Trade> {
    return apiFetch<Trade>(ApiPaths.trades, {
      method: 'POST',
      body: tradeData
    })
  },

  async updateTrade(id: string, tradeData: Partial<Trade>): Promise<Trade> {
    return apiFetch<Trade>(ApiPaths.tradeById(id), {
      method: 'PUT',
      body: tradeData
    })
  },

  async closeTrade(id: string): Promise<Trade> {
    return apiFetch<Trade>(ApiPaths.tradeClose(id), {
      method: 'POST'
    })
  },

  async deleteTrade(id: string): Promise<void> {
    return apiFetch<void>(ApiPaths.tradeById(id), {
      method: 'DELETE'
    })
  },

  async getTradeWithDetails(id: string): Promise<TradeDetails> {
    return apiFetch<TradeDetails>(ApiPaths.tradeDetails(id))
  },

  async getOpenTrades(): Promise<Trade[]> {
    return apiFetch<Trade[]>(ApiPaths.openTrades)
  },

  async getTradesByBot(botId: string): Promise<Trade[]> {
    return apiFetch<Trade[]>(ApiPaths.tradesByBot(botId))
  },

  async getTradesBySignal(signalId: string): Promise<Trade[]> {
    return apiFetch<Trade[]>(ApiPaths.tradesBySignal(signalId))
  },

  async getTradeStats(): Promise<TradeStats> {
    return apiFetch<TradeStats>(ApiPaths.tradeStats)
  },

  async getUserTrades(userId: string): Promise<Trade[]> {
    return apiFetch<Trade[]>(ApiPaths.userTrades(userId))
  },

  async getUserTradeSummary(userId: string): Promise<TradeSummary> {
    return apiFetch<TradeSummary>(ApiPaths.userTradeSummary(userId))
  },

  async getBotTradeSummary(botId: string): Promise<TradeSummary> {
    return apiFetch<TradeSummary>(ApiPaths.botTradeSummary(botId))
  }
}
