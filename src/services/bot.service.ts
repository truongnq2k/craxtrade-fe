import { apiFetch, ApiPaths } from '../utils/api'
import type { BotInstance, CreateBotInstanceRequest, BotStats, BotDetails, BotPerformance } from '../types'

export const botService = {
  async getAllBots(): Promise<BotInstance[]> {
    return apiFetch<BotInstance[]>(ApiPaths.botInstances)
  },

  async getBotById(id: string): Promise<BotInstance> {
    return apiFetch<BotInstance>(ApiPaths.botInstanceById(id))
  },

  async getBotWithDetails(id: string): Promise<BotDetails> {
    return apiFetch<BotDetails>(ApiPaths.botInstanceDetails(id))
  },

  async createBot(botData: CreateBotInstanceRequest): Promise<BotInstance> {
    return apiFetch<BotInstance>(ApiPaths.botInstances, {
      method: 'POST',
      body: botData
    })
  },

  async updateBot(id: string, botData: Partial<BotInstance>): Promise<BotInstance> {
    return apiFetch<BotInstance>(ApiPaths.botInstanceById(id), {
      method: 'PUT',
      body: botData
    })
  },

  async deleteBot(id: string): Promise<void> {
    return apiFetch<void>(ApiPaths.botInstanceById(id), {
      method: 'DELETE'
    })
  },

  async startBot(id: string): Promise<BotInstance> {
    return apiFetch<BotInstance>(ApiPaths.botInstanceStart(id), {
      method: 'POST'
    })
  },

  async stopBot(id: string): Promise<BotInstance> {
    return apiFetch<BotInstance>(ApiPaths.botInstanceStop(id), {
      method: 'POST'
    })
  },

  async pauseBot(id: string): Promise<BotInstance> {
    return apiFetch<BotInstance>(ApiPaths.botInstancePause(id), {
      method: 'POST'
    })
  },

  async resumeBot(id: string): Promise<BotInstance> {
    return apiFetch<BotInstance>(ApiPaths.botInstanceResume(id), {
      method: 'POST'
    })
  },

  async getBotPerformance(id: string): Promise<BotPerformance> {
    return apiFetch<BotPerformance>(ApiPaths.botInstancePerformance(id))
  },

  async getBotStats(): Promise<BotStats> {
    return apiFetch<BotStats>(ApiPaths.botInstanceStats)
  },

  async getBotsByType(type: string): Promise<BotInstance[]> {
    return apiFetch<BotInstance[]>(ApiPaths.botInstancesByType(type))
  },

  async getBotsBySymbol(symbol: string): Promise<BotInstance[]> {
    return apiFetch<BotInstance[]>(ApiPaths.botInstancesBySymbol(symbol))
  },

  async getBotsByStatus(status: string): Promise<BotInstance[]> {
    return apiFetch<BotInstance[]>(ApiPaths.botInstancesByStatus(status))
  }
}
