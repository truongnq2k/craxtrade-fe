import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, ApiPaths } from '../utils/api'
import { useAuthStore } from '../store/auth'
import { botService } from '../services/bot.service'

interface BotInstance {
  id: string
  userId: string
  name: string
  botType: string
  symbol: string
  status: string
  capital: number
  leverage: number
  allocationPct: number
  riskPerTrade: number
  maxDrawdownPct: number
  marginMode: string
  isHedgeMode: boolean
  isActive: boolean
  exchangeAccountId: string
  createdAt: string
  updatedAt: string
  startedAt: string | null
  stoppedAt: string | null
  config: Record<string, unknown>
  metadata: Record<string, unknown>
}

export function UserBotsPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [bots, setBots] = useState<BotInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function load() {
      try {
        if (!user?.sub && !user?.userId) {
          setError('Thiếu userId trong token')
          return
        }
        const userId = user?.sub || user?.userId
        if (!userId) {
          setError('Thiếu userId trong token')
          return
        }
        
        // Use direct API call since service doesn't have getUserBots method
        const res = await apiFetch<{ success: boolean; data: BotInstance[] }>(ApiPaths.userBots(userId))
        setBots(res.data || [])
      } catch (err: unknown) {
        const error = err as { message?: string }
        setError(error.message || 'Load failed')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleBotAction(botId: string, action: 'start' | 'stop' | 'pause' | 'resume') {
    try {
      switch (action) {
        case 'start':
          await botService.startBot(botId)
          break
        case 'stop':
          await botService.stopBot(botId)
          break
        case 'pause':
          await botService.pauseBot(botId)
          break
        case 'resume':
          await botService.resumeBot(botId)
          break
      }

      // Reload the bots data after action
      const userId = user?.sub || user?.userId
      if (userId) {
        const res = await apiFetch<{ success: boolean; data: BotInstance[] }>(ApiPaths.userBots(userId))
        setBots(res.data || [])
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Action failed')
    }
  }

  function getBotStatusColor(status: string) {
    switch (status) {
      case 'RUNNING':
        return 'text-green-400 bg-green-500/20'
      case 'PAUSED':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'STOPPED':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  function getBotStatusText(status: string) {
    switch (status) {
      case 'RUNNING':
        return '[ACTIVE]'
      case 'PAUSED':
        return '[PAUSED]'
      case 'STOPPED':
        return '[STOPPED]'
      default:
        return '[UNKNOWN]'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [TRADING_BOTS]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            Trading Bot Management
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/create-bot')}
          className="px-4 py-2 bg-green-500 text-black font-mono font-bold rounded hover:bg-green-400 transition-all duration-300"
        >
          [CREATE_QUANTUM_BOT]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> ERROR: {error}
        </div>
      )}

      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="text-green-400 font-mono">
            Loading...
          </div>
          <div className="text-green-600 text-sm mt-2">
            Please wait while we load the data
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && bots.length === 0 && (
        <div className="text-center py-12 bg-black/50 border border-green-500/30 rounded-lg">
          <div className="text-green-400 text-lg font-mono mb-2">
            No trading bots found
          </div>
          <div className="text-green-600 text-sm">
            Create your first trading bot
          </div>
          <button
            onClick={() => navigate('/dashboard/create-bot')}
            className="mt-4 px-4 py-2 bg-green-500 text-black font-mono rounded hover:bg-green-400 transition-all duration-300"
          >
            [INITIATE_QUANTUM_BOT]
          </button>
        </div>
      )}

      {/* Bots Table */}
      {!loading && !error && bots.length > 0 && (
        <div className="bg-black/50 border border-green-500/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/80 border-b border-green-500/50">
                <tr>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">BOT_NAME</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">TYPE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">SYMBOL</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">CAPITAL</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">LEVERAGE</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">STATUS</th>
                  <th className="px-4 py-3 text-left text-green-400 font-mono text-xs uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-500/20">
                {bots.map((bot) => (
                  <tr key={bot.id} className="hover:bg-green-500/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono text-xs bg-black/50 px-2 py-1 rounded">
                        {bot.name?.substring(0, 12) || 'N/A'}...
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 font-mono text-xs bg-green-500/10 px-2 py-1 rounded">
                        {bot.botType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono text-xs bg-black/50 px-2 py-1 rounded">
                        {bot.symbol}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono text-xs">
                        ${bot.capital?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-300 font-mono text-xs">
                        {bot.leverage}x
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono px-2 py-1 rounded ${getBotStatusColor(bot.status)}`}>
                        {getBotStatusText(bot.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {bot.status === 'STOPPED' && (
                          <button
                            onClick={() => handleBotAction(bot.id, 'start')}
                            className="px-2 py-1 bg-green-500/20 border border-green-500/50 text-green-400 font-mono text-xs hover:bg-green-500/30 transition-all duration-300"
                          >
                            [START]
                          </button>
                        )}
                        {bot.status === 'RUNNING' && (
                          <>
                            <button
                              onClick={() => handleBotAction(bot.id, 'pause')}
                              className="px-2 py-1 bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 font-mono text-xs hover:bg-yellow-500/30 transition-all duration-300"
                            >
                              [PAUSE]
                            </button>
                            <button
                              onClick={() => handleBotAction(bot.id, 'stop')}
                              className="px-2 py-1 bg-red-500/20 border border-red-500/50 text-red-400 font-mono text-xs hover:bg-red-500/30 transition-all duration-300"
                            >
                              [STOP]
                            </button>
                          </>
                        )}
                        {bot.status === 'PAUSED' && (
                          <button
                            onClick={() => handleBotAction(bot.id, 'resume')}
                            className="px-2 py-1 bg-blue-500/20 border border-blue-500/50 text-blue-400 font-mono text-xs hover:bg-blue-500/30 transition-all duration-300"
                          >
                            [RESUME]
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Status */}
      {!loading && !error && (
        <div className="bg-black/50 border border-green-500/30 rounded-lg p-4">
          <div className="flex justify-between items-center text-xs font-mono text-green-600">
            <div className="flex items-center space-x-4">
              <span>SYSTEM: OPERATIONAL</span>
              <span>•</span>
              <span>BOTS: {bots.length}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>QUANTUM: ONLINE</span>
              <span>•</span>
              <span>STATUS: SECURE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
