import { apiFetch, ApiPaths } from '../utils/api'
import type { Signal, CreateSignalRequest, SignalStats, SignalWithTrades, SignalSummary } from '../types'

export type { Signal }

export const signalService = {
  async getAllSignals(): Promise<Signal[]> {
    return apiFetch<Signal[]>(ApiPaths.signals)
  },

  async getSignalById(id: string): Promise<Signal> {
    return apiFetch<Signal>(ApiPaths.signalById(id))
  },

  async createSignal(signalData: CreateSignalRequest): Promise<Signal> {
    return apiFetch<Signal>(ApiPaths.signals, {
      method: 'POST',
      body: signalData
    })
  },

  async updateSignal(id: string, signalData: Partial<Signal>): Promise<Signal> {
    return apiFetch<Signal>(ApiPaths.signalById(id), {
      method: 'PUT',
      body: signalData
    })
  },

  async deleteSignal(id: string): Promise<void> {
    return apiFetch<void>(ApiPaths.signalById(id), {
      method: 'DELETE'
    })
  },

  async getSignalWithTrades(id: string): Promise<SignalWithTrades> {
    return apiFetch<SignalWithTrades>(ApiPaths.signalWithTrades(id))
  },

  async getSignalsBySymbol(symbol: string): Promise<Signal[]> {
    return apiFetch<Signal[]>(ApiPaths.signalsBySymbol(symbol))
  },

  async getSignalsByType(type: string): Promise<Signal[]> {
    return apiFetch<Signal[]>(ApiPaths.signalsByType(type))
  },

  async getRecentSignals(): Promise<Signal[]> {
    return apiFetch<Signal[]>(ApiPaths.recentSignals)
  },

  async getSignalStats(): Promise<SignalStats> {
    return apiFetch<SignalStats>(ApiPaths.signalStats)
  },

  async getUserSignals(userId: string): Promise<Signal[]> {
    return apiFetch<Signal[]>(ApiPaths.userSignals(userId))
  },

  async getUserSignalSummary(userId: string): Promise<SignalSummary> {
    return apiFetch<SignalSummary>(ApiPaths.userSignalSummary(userId))
  },

  async createAISignal(symbol: string, timeframe: string): Promise<Signal> {
    return apiFetch<Signal>('/api/signals/ai/create', {
      method: 'POST',
      body: { symbol, timeframe }
    })
  },

  async createBatchAISignals(symbols: string[], timeframe: string): Promise<Signal[]> {
    return apiFetch<Signal[]>('/api/signals/ai/batch', {
      method: 'POST',
      body: { symbols, timeframe }
    })
  }
}
