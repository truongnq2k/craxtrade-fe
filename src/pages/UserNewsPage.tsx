import { useEffect, useState } from 'react'
import { DashboardLayout } from '../components/DashboardLayout'
import { apiFetch } from '../utils/api'

type News = {
  id: string
  title: string
  content: string
  source: string
  url?: string
  imageUrl?: string
  publishedAt: string
  sentiment: string
  impact: string
  symbols: string[]
  categories: string[]
}

export function UserNewsPage() {
  const [items, setItems] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState({
    sentiment: '',
    impact: '',
    symbol: ''
  })

  useEffect(() => {
    loadNews()
  }, [filter])

  async function loadNews() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filter.sentiment) params.append('sentiment', filter.sentiment)
      if (filter.impact) params.append('impact', filter.impact)
      if (filter.symbol) params.append('symbol', filter.symbol)
      
      const res = await apiFetch<{ success: boolean; data: any }>(`/api/news?${params.toString()}`)
      const data = (res as any).data?.news || (res as any).data || []
      setItems(data)
    } catch (err: any) {
      setError(err.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-4">Tin tức thị trường</h1>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Sentiment</label>
            <select
              value={filter.sentiment}
              onChange={(e) => setFilter({...filter, sentiment: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="POSITIVE">Tích cực</option>
              <option value="NEGATIVE">Tiêu cực</option>
              <option value="NEUTRAL">Trung tính</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tác động</label>
            <select
              value={filter.impact}
              onChange={(e) => setFilter({...filter, impact: e.target.value})}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="HIGH">Cao</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Symbol</label>
            <input
              type="text"
              value={filter.symbol}
              onChange={(e) => setFilter({...filter, symbol: e.target.value})}
              placeholder="BTC, ETH, ..."
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>
      
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {!loading && !error && (
        <div className="space-y-4">
          {items.map((news) => (
            <div key={news.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{news.title}</h3>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    news.sentiment === 'POSITIVE' ? 'bg-green-100 text-green-800' :
                    news.sentiment === 'NEGATIVE' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {news.sentiment}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    news.impact === 'HIGH' ? 'bg-red-100 text-red-800' :
                    news.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {news.impact}
                  </span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-3">{news.content}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Nguồn: {news.source}</span>
                  <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-1">
                  {news.symbols.slice(0, 3).map((symbol) => (
                    <span key={symbol} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {symbol}
                    </span>
                  ))}
                  {news.symbols.length > 3 && (
                    <span className="text-xs">+{news.symbols.length - 3}</span>
                  )}
                </div>
              </div>
              
              {news.url && (
                <div className="mt-3">
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Đọc thêm →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
