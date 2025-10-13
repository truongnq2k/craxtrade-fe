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
  createdAt: string
}

export function AdminNewsPage() {
  const [items, setItems] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<{ totalNews: number; publishedNews: number; activeNews: number; avgSentiment: string; positiveNews: number; negativeNews: number; highImpactNews: number } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<News | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    source: '',
    url: '',
    imageUrl: '',
    publishedAt: '',
    sentiment: 'NEUTRAL',
    impact: 'MEDIUM',
    symbols: '',
    categories: ''
  })

  useEffect(() => {
    loadNews()
    loadStats()
  }, [])

  async function loadNews() {
    try {
      setLoading(true)
      const res = await apiFetch<{ success: boolean; data: { news: News[] } }>('/api/news')
      const data = res.data?.news || []
      setItems(data)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  async function loadStats() {
    try {
      const res = await apiFetch<{ success: boolean; data: typeof stats }>('/api/news/stats')
      setStats(res.data)
    } catch (err: unknown) {
      console.error('Load stats failed:', err)
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      content: '',
      source: '',
      url: '',
      imageUrl: '',
      publishedAt: '',
      sentiment: 'NEUTRAL',
      impact: 'MEDIUM',
      symbols: '',
      categories: ''
    })
    setEditingItem(null)
    setShowForm(false)
  }

  function startEdit(item: News) {
    setFormData({
      title: item.title,
      content: item.content,
      source: item.source,
      url: item.url || '',
      imageUrl: item.imageUrl || '',
      publishedAt: item.publishedAt.split('T')[0],
      sentiment: item.sentiment,
      impact: item.impact,
      symbols: item.symbols.join(', '),
      categories: item.categories.join(', ')
    })
    setEditingItem(item)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const submitData = {
        ...formData,
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : undefined,
        symbols: formData.symbols.split(',').map(s => s.trim()).filter(Boolean),
        categories: formData.categories.split(',').map(s => s.trim()).filter(Boolean)
      }

      if (editingItem) {
        await apiFetch(`/api/news/${editingItem.id}`, {
          method: 'PUT',
          body: submitData
        })
      } else {
        await apiFetch('/api/news', {
          method: 'POST',
          body: submitData
        })
      }
      resetForm()
      loadNews()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Save failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Bạn có chắc muốn xóa tin này?')) return
    try {
      await apiFetch(`/api/news/${id}`, { method: 'DELETE' })
      loadNews()
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Delete failed')
    }
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Quản lý tin tức</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Thêm tin mới
        </button>
      </div>
      
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.totalNews || 0}</div>
            <div className="text-sm text-gray-600">Tổng tin tức</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.positiveNews || 0}</div>
            <div className="text-sm text-gray-600">Tin tích cực</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.negativeNews || 0}</div>
            <div className="text-sm text-gray-600">Tin tiêu cực</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.highImpactNews || 0}</div>
            <div className="text-sm text-gray-600">Tác động cao</div>
          </div>
        </div>
      )}
      
      {error && <div className="text-red-600 mb-4">{error}</div>}
      
      {/* Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-medium mb-4">
            {editingItem ? 'Chỉnh sửa tin tức' : 'Thêm tin tức mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiêu đề</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nội dung</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full border rounded px-3 py-2"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nguồn</label>
                <input
                  type="text"
                  required
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày xuất bản</label>
                <input
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({...formData, publishedAt: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sentiment</label>
                <select
                  value={formData.sentiment}
                  onChange={(e) => setFormData({...formData, sentiment: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="POSITIVE">Positive</option>
                  <option value="NEGATIVE">Negative</option>
                  <option value="NEUTRAL">Neutral</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tác động</label>
                <select
                  value={formData.impact}
                  onChange={(e) => setFormData({...formData, impact: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Symbols (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.symbols}
                  onChange={(e) => setFormData({...formData, symbols: e.target.value})}
                  placeholder="BTC, ETH, BNB..."
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Categories (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({...formData, categories: e.target.value})}
                  placeholder="DeFi, NFT, Gaming..."
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingItem ? 'Cập nhật' : 'Thêm'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading && <div>Đang tải...</div>}
      
      {!loading && (
        <div className="space-y-4">
          {items.map((news) => (
            <div key={news.id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-medium">{news.title}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEdit(news)}
                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                  >
                    Sửa
                  </button>
                  <button 
                    onClick={() => handleDelete(news.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-3 line-clamp-3">{news.content}</p>
              
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Nguồn: {news.source}</span>
                  <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
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
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
