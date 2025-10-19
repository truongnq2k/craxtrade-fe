import { useState, useEffect } from 'react'
import { apiFetch } from '../utils/api'

type News = {
  id: string
  title: string
  summary: string
  source: string
  url?: string
  imageUrl?: string
  createdAt: string
  sentiment?: string 
  impact?: string
  symbols?: string[]
  categories?: string[]
}

interface MatrixDrop {
  x: number
  y: number
  speed: number
}

export function UserNewsPage() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [matrixRain, setMatrixRain] = useState<MatrixDrop[]>([])
  const [filterSentiment, setFilterSentiment] = useState<string>('')
  const [filterImpact, setFilterImpact] = useState<string>('')
  const [filterSymbol, setFilterSymbol] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

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

  useEffect(() => {
    loadNews()
  }, [filterSentiment, filterImpact, filterSymbol])

  async function loadNews() {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      if (filterSentiment) params.append('sentiment', filterSentiment)
      if (filterImpact) params.append('impact', filterImpact)
      if (filterSymbol) params.append('symbol', filterSymbol)
      
      const response = await apiFetch(`/api/news?${params.toString()}`) as { data?: { news?: News[] } | News[]; success?: boolean }
      // Handle different response formats safely
      if (response && typeof response === 'object' && 'data' in response) {
        const data = response.data
        if (Array.isArray(data)) {
          setNews(data)
        } else if (data && typeof data === 'object' && 'news' in data) {
          setNews(Array.isArray(data.news) ? data.news : [])
        } else {
          setNews([])
        }
      } else if (Array.isArray(response)) {
        setNews(response)
      } else {
        setNews([])
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || '[ERROR] Load failed')
    } finally {
      setLoading(false)
    }
  }


  function getSentimentIcon(sentiment?: string) {
    switch (sentiment) {
      case 'POSITIVE': return '📈'
      case 'NEGATIVE': return '📉'
      case 'NEUTRAL': return '📊'
      default: return '📰'
    }
  }

  function getSentimentBadgeClass(sentiment?: string) {
    switch (sentiment) {
      case 'POSITIVE': return 'bg-green-500/20 text-green-400 border-green-400/50'
      case 'NEGATIVE': return 'bg-red-500/20 text-red-400 border-red-400/50'
      case 'NEUTRAL': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  function getImpactBadgeClass(impact?: string) {
    switch (impact) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-400/50'
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50'
      case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-400/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/50'
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredNews = news.filter(article => {
    if (filterSentiment && article.sentiment !== filterSentiment) return false
    if (filterImpact && article.impact !== filterImpact) return false
    if (filterSymbol && article.symbols && !article.symbols.some(symbol => 
      symbol.toLowerCase().includes(filterSymbol.toLowerCase())
    )) return false
    return true
  })

  const paginatedNews = filteredNews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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
        <button 
          onClick={() => loadNews()}
          className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/30 transition-all duration-300 rounded"
        >
          [REFRESH_NEWS]
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-400 text-sm font-mono bg-red-500/10 border border-red-500/30 rounded px-4 py-3">
          <span className="text-red-500">$</span> {error}
        </div>
      )}

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

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-green-400 text-xs font-mono">FILTER_SENTIMENT</label>
          <select
            value={filterSentiment}
            onChange={(e) => {
              setFilterSentiment(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
          >
            <option value="">All Sentiments</option>
            <option value="POSITIVE">POSITIVE</option>
            <option value="NEGATIVE">NEGATIVE</option>
            <option value="NEUTRAL">NEUTRAL</option>
          </select>
          
          <label className="text-green-400 text-xs font-mono ml-4">FILTER_IMPACT</label>
          <select
            value={filterImpact}
            onChange={(e) => {
              setFilterImpact(e.target.value)
              setCurrentPage(1)
            }}
            className="bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono focus:outline-none focus:border-green-400 transition-all duration-300"
          >
            <option value="">All Impacts</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>

          <label className="text-green-400 text-xs font-mono ml-4">FILTER_SYMBOL</label>
          <input
            type="text"
            value={filterSymbol}
            onChange={(e) => {
              setFilterSymbol(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="BTC, ETH, ..."
            className="bg-black/50 border border-green-500/50 rounded px-4 py-2 text-green-400 font-mono placeholder-green-600 focus:outline-none focus:border-green-400 transition-all duration-300"
          />
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
        {!loading && paginatedNews.length === 0 && (
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

        {!loading && paginatedNews.length > 0 && (
          <>
            <div className="space-y-4">
              {paginatedNews.map((article) => (
                <div key={article.id} className="bg-black/70 border border-green-500/20 rounded-lg p-6 hover:border-green-400/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-green-300 font-mono">
                      {getSentimentIcon(article.sentiment)} {article.title}
                    </h3>
                    <div className="flex gap-2">
                      {article.sentiment && (
                        <span className={`text-xs font-mono px-2 py-1 rounded border ${getSentimentBadgeClass(article.sentiment)}`}>
                          {article.sentiment}
                        </span>
                      )}
                      {article.impact && (
                        <span className={`text-xs font-mono px-2 py-1 rounded border ${getImpactBadgeClass(article.impact)}`}>
                          {article.impact}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-green-400 mb-4 leading-relaxed font-mono text-sm">
                    {article.summary || 'No summary available'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                      <div className="text-green-500 text-xs font-mono">
                        <span className="text-green-600">SOURCE:</span> {article.source}
                      </div>
                      <div className="text-green-500 text-xs font-mono">
                        <span className="text-green-600">TIME:</span> {formatDate(article.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {article.symbols && article.symbols.slice(0, 3).map((symbol) => (
                        <span key={symbol} className="text-xs font-mono px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-400/50">
                          {symbol}
                        </span>
                      ))}
                      {article.symbols && article.symbols.length > 3 && (
                        <span className="text-xs text-green-500 font-mono">
                          +{article.symbols.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {article.url && (
                    <div className="mt-4 pt-4 border-t border-green-500/20">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-mono inline-flex items-center gap-1 transition-colors duration-200"
                      >
                        [READ_MORE] →
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-green-500/30">
              <div className="text-green-600 text-xs font-mono">
                <div className="animate-pulse">Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredNews.length)}</div>
                <div className="mt-1">Total: {filteredNews.length} articles</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                >
                  [PREV]
                </button>
                <button
                  onClick={() => loadNews()}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 transition-all duration-300 rounded"
                >
                  [REFRESH]
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage * pageSize >= filteredNews.length}
                  className="px-3 py-1 bg-black/50 border border-green-500/50 text-green-400 font-mono hover:bg-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 rounded"
                >
                  [NEXT]
                </button>
              </div>
            </div>
          </>
        )}

        {/* Terminal Info */}
        <div className="mt-6 text-center">
          <div className="text-xs font-mono text-green-600">
            <div className="animate-pulse">NEWS_API: CONNECTED</div>
            <div className="mt-1">SCANNER: ACTIVE</div>
            <div className="mt-1">UPDATES: REAL_TIME</div>
          </div>
        </div>
      </div>
    </div>
  )
}
