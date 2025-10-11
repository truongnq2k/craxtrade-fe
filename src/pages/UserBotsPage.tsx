import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'
import { useAuth } from '../hooks/useAuth'

type BotInstance = {
  id: string
  name: string
  botType: string
  symbol: string
  status: string
  capital: number
  leverage: number
}

export function UserBotsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<BotInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (!user?.sub && !(user as any)?.userId) {
          setError('Thiếu userId trong token')
          return
        }
        const userId = (user as any)?.userId || (user as any)?.id || (user as any)?.sub
        const res = await apiFetch<{ success: boolean; data: any }>(`/api/users/${userId}/bot-instances`)
        const data = (res as any).data?.bots || (res as any).data || []
        setItems(data)
      } catch (err: any) {
        setError(err.message || 'Load failed')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function handleBotAction(botId: string, action: 'start' | 'stop' | 'pause' | 'resume') {
    try {
      await apiFetch(`/api/bot-instances/${botId}/${action}`, { method: 'POST' })
      // Reload data
      window.location.reload()
    } catch (err: any) {
      setError(err.message || 'Action failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Bot Trading của tôi</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Tạo Bot mới
        </button>
      </div>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {!loading && !error && (
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-3 py-2">Tên Bot</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Symbol</th>
                <th className="px-3 py-2">Vốn</th>
                <th className="px-3 py-2">Leverage</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((bot) => (
                <tr key={bot.id} className="border-t">
                  <td className="px-3 py-2">{bot.name}</td>
                  <td className="px-3 py-2">{bot.botType}</td>
                  <td className="px-3 py-2">{bot.symbol}</td>
                  <td className="px-3 py-2">{bot.capital}</td>
                  <td className="px-3 py-2">{bot.leverage}x</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      bot.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      bot.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                      bot.status === 'STOPPED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bot.status}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      {bot.status === 'STOPPED' && (
                        <button 
                          onClick={() => handleBotAction(bot.id, 'start')}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                        >
                          Start
                        </button>
                      )}
                      {bot.status === 'ACTIVE' && (
                        <>
                          <button 
                            onClick={() => handleBotAction(bot.id, 'pause')}
                            className="bg-yellow-600 text-white px-2 py-1 rounded text-xs hover:bg-yellow-700"
                          >
                            Pause
                          </button>
                          <button 
                            onClick={() => handleBotAction(bot.id, 'stop')}
                            className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                          >
                            Stop
                          </button>
                        </>
                      )}
                      {bot.status === 'PAUSED' && (
                        <button 
                          onClick={() => handleBotAction(bot.id, 'resume')}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                        >
                          Resume
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
