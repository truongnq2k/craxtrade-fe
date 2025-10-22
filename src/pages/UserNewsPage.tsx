import { useState, useEffect } from 'react'
import { newsService } from '../services/news.service'
import type { News } from '../types'

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function UserNewsPage() {
  const [newsData, setNewsData] = useState<{
    news: News[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }>({ news: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [highImpactNews, setHighImpactNews] = useState<News[]>([])
  const [showHighImpact, setShowHighImpact] = useState(false)

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 30)
    const drops = Array(columns).fill(0).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      speed: Math.random() * 2.2 + 0.4
    }))
    setMatrixRain(drops)

    const animateRain = () => {
      setMatrixRain(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > window.innerHeight ? 0 : drop.y + drop.speed
      })))
    }

    const interval = setInterval(animateRain, 75)
    return () => clearInterval(interval)
  }, [])

  // Load news data
  useEffect(() => {
    loadNews()
  }, [currentPage])

  // Load high impact news
  useEffect(() => {
    loadHighImpactNews()
    // Refresh high impact news every 2 minutes
    const interval = setInterval(loadHighImpactNews, 120000)
    return () => clearInterval(interval)
  }, [])

  async function loadNews() {
    try {
      setLoading(true)
      setError(null)

      const query = {
        page: currentPage,
        limit: 10
      }

      const data = await newsService.getNews(query)

      // Validate response structure
      if (!data || !data.news || !data.pagination) {
        throw new Error('[ERROR] Invalid API response structure')
      }

      setNewsData(data)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] Load failed')
      // Reset to safe default on error
      setNewsData({ news: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } })
    } finally {
      setLoading(false)
    }
  }

  async function loadHighImpactNews() {
    try {
      const data = await newsService.getHighImpactNews(60, 5) // Get news with 60+ impact
      setHighImpactNews(data)
    } catch (error) {
      console.error('Failed to load high impact news:', error)
    }
  }


  
  function handlePageChange(page: number) {
    setCurrentPage(page)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-green-400 font-mono tracking-wider" style={{ textShadow: '0 0 10px #00ff00' }}>
            [NEWS_TERMINAL]
          </h1>
          <p className="text-green-600 text-sm font-mono mt-1">
            $ ./market_intelligence_scanner.sh
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowHighImpact(!showHighImpact)}
            className={`px-4 py-2 border font-mono transition-all duration-300 rounded ${
              showHighImpact
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : 'bg-green-500/20 border-green-500/50 text-green-400 hover:bg-green-500/30'
            }`}
          >
            [{showHighImpact ? 'HIDE_HIGH_IMPACT' : 'SHOW_HIGH_IMPACT'}]
          </button>
          <button
            onClick={() => loadNews()}
            className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 transition-all duration-300 rounded"
          >
            [REFRESH_NEWS]
          </button>
        </div>
      </div>

      {/* High Impact News Alert */}
      {highImpactNews.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-yellow-400 font-bold font-mono">⚠️ HIGH IMPACT NEWS ALERT</h3>
            <span className="text-yellow-500 text-xs font-mono">
              {highImpactNews.length} article{highImpactNews.length > 1 ? 's' : ''} with 60+ impact
            </span>
          </div>
          <div className="space-y-2">
            {highImpactNews.slice(0, 3).map((news) => (
              <div key={news.id} className="bg-black/30 rounded p-3">
                <div className="flex justify-between items-start">
                  <h4 className="text-yellow-300 font-mono text-sm flex-1 mr-2">{news.title}</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded font-mono">
                      {news.marketImpact}
                    </span>
                    <span className="text-xs text-gray-400">
                      {newsService.formatTimeAgo(news.publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> {error}
        </div>
      )}

      {/* News Filters */}
      
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {matrixRain.map((drop, i) => (
          <div
            key={i}
            className="absolute text-green-500 text-xs font-mono opacity-50"
            style={{
              left: `${drop.x}px`,
              top: `${drop.y}px`,
              transform: `translateY(${drop.y}px)`
            }}
          >
            {String.fromCharCode(0x30A0 + Math.random() * 96)}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* News List */}
      <div className="bg-black/90 border border-green-500/30 rounded-lg p-6">
        <div className="text-green-600 text-xs font-mono mb-6 animate-pulse">
          $ ./load_news_database.sh
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-green-600">
            <div className="text-sm font-mono animate-pulse">
              $ ./scanning_news_feeds.sh
            </div>
            <div className="text-xs mt-2">
              Retrieving market intelligence from quantum database...
            </div>
          </div>
        )}

        {/* News Articles */}
        {!loading && (!newsData?.news || newsData.news.length === 0) && (
          <div className="text-center py-12 text-green-600">
            <div className="mb-4">
              <div className="inline-block">
                <div className="w-24 h-24 border-4 border-green-500 rounded-full flex items-center justify-center bg-black/50">
                  <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2zM4 4h16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"/>
                    <path d="M9 9h6M4 15h6M14 9h6M4 11h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"/>
                    <circle cx="8" cy="6" r="1" fill="currentColor" className="text-green-500"/>
                    <circle cx="16" cy="6" r="1" fill="currentColor" className="text-green-500"/>
                    <circle cx="12" cy="6" r="1" fill="currentColor" className="text-green-500"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="text-sm font-mono mb-2">
              $ ./no_news_found.sh
            </div>
            <div className="text-xs mt-2">
              No news articles found for the selected criteria
            </div>
          </div>
        )}

        {!loading && newsData?.news && newsData.news.length > 0 && (
          <>
            {/* News Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-500/30">
                    <th className="text-left py-3 px-4 font-mono text-green-400">TITLE</th>
                    <th className="text-left py-3 px-4 font-mono text-green-400">SOURCE</th>
                    <th className="text-center py-3 px-4 font-mono text-green-400">IMPACT</th>
                    <th className="text-left py-3 px-4 font-mono text-green-400">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {newsData.news.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-green-500/20 hover:bg-green-500/5 transition-colors duration-200"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <a
                            href={article.originalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-300 font-mono text-sm hover:text-green-200 transition-colors duration-200 mb-1 inline-block hover:underline"
                          >
                            {article.title}
                          </a>
                          {article.summary && (
                            <p className="text-gray-400 text-xs font-mono line-clamp-2 mt-1">
                              {article.summary}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-400 font-mono text-xs">
                          {article.source}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <span className={`px-2 py-1 rounded text-xs font-mono ${
                            article.marketImpact >= 70
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : article.marketImpact >= 40
                              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              : 'bg-green-500/20 text-green-400 border border-green-500/30'
                          }`}>
                            {article.marketImpact}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-gray-400 font-mono text-xs">
                          {newsService.formatTimeAgo(article.publishedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {newsData?.pagination && newsData.pagination.pages > 1 && (
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-green-500/30">
                <div className="text-green-600 text-xs font-mono">
                  <div className="animate-pulse">
                    Showing {((newsData.pagination.page - 1) * newsData.pagination.limit) + 1}-
                    {Math.min(newsData.pagination.page * newsData.pagination.limit, newsData.pagination.total)}
                  </div>
                  <div className="mt-1">Total: {newsData.pagination.total} articles</div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(newsData.pagination.page - 1)}
                    disabled={newsData.pagination.page === 1}
                    className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                  >
                    [PREV]
                  </button>
                  <span className="px-3 py-1 text-green-400 font-mono">
                    {newsData.pagination.page} / {newsData.pagination.pages}
                  </span>
                  <button
                    onClick={() => handlePageChange(newsData.pagination.page + 1)}
                    disabled={newsData.pagination.page >= newsData.pagination.pages}
                    className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                  >
                    [NEXT]
                  </button>
                </div>
              </div>
            )}
          </>
        )}

            </div>
    </div>
  )
}
