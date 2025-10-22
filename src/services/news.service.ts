import { apiFetch } from '../utils/api'
import type {
  News,
  NewsListQuery,
  NewsStats,
  CreateNewsRequest,
  UpdateNewsRequest
} from '../types'

interface PaginationData {
  page: number
  limit: number
  total: number
  pages: number
}

interface NewsListResponse {
  news: News[]
  pagination: PaginationData
}

// API Response wrapper types
interface ApiResponse<T> {
  success: boolean
  data: T
}


export const newsService = {
  // Get all news with advanced filtering
  async getNews(query?: NewsListQuery): Promise<NewsListResponse> {
    const params = new URLSearchParams()

    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    if (query?.search) params.append('search', query.search)
    if (query?.source) params.append('source', query.source)
    if (query?.category) params.append('category', query.category)
    if (query?.sentiment) params.append('sentiment', query.sentiment)
    if (query?.minMarketImpact !== undefined) params.append('minMarketImpact', query.minMarketImpact.toString())
    if (query?.maxMarketImpact !== undefined) params.append('maxMarketImpact', query.maxMarketImpact.toString())
    if (query?.symbol) params.append('symbol', query.symbol)
    if (query?.startDate) params.append('startDate', query.startDate)
    if (query?.endDate) params.append('endDate', query.endDate)

    const response = await apiFetch<ApiResponse<NewsListResponse>>(`/api/news?${params}`)
    return response.data
  },

  // Get news by ID
  async getNewsById(id: string): Promise<News> {
    const response = await apiFetch<ApiResponse<News>>(`/api/news/${id}`)
    return response.data
  },

  // Get recent news
  async getRecentNews(limit: number = 10): Promise<News[]> {
    const response = await apiFetch<ApiResponse<News[]>>(`/api/news/recent?limit=${limit}`)
    return response.data
  },

  // Get high impact news
  async getHighImpactNews(minImpact: number = 50, limit: number = 20): Promise<News[]> {
    const response = await apiFetch<ApiResponse<News[]>>(`/api/news/high-impact?minImpact=${minImpact}&limit=${limit}`)
    return response.data
  },

  // Get news by cryptocurrency symbol
  async getNewsBySymbol(symbol: string, limit: number = 20): Promise<News[]> {
    const response = await apiFetch<ApiResponse<News[]>>(`/api/news/symbol/${symbol}?limit=${limit}`)
    return response.data
  },

  // Get news by source
  async getNewsBySource(source: string): Promise<News[]> {
    const response = await apiFetch<ApiResponse<News[]>>(`/api/news/source/${encodeURIComponent(source)}`)
    return response.data
  },

  // Create news (admin only)
  async createNews(newsData: CreateNewsRequest): Promise<News> {
    const response = await apiFetch<ApiResponse<News>>('/api/news', {
      method: 'POST',
      body: JSON.stringify(newsData),
    })
    return response.data
  },

  // Update news (admin only)
  async updateNews(id: string, newsData: UpdateNewsRequest): Promise<News> {
    const response = await apiFetch<ApiResponse<News>>(`/api/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(newsData),
    })
    return response.data
  },

  // Delete news (admin only)
  async deleteNews(id: string): Promise<void> {
    await apiFetch(`/api/news/${id}`, {
      method: 'DELETE',
    })
  },

  // Get news statistics (admin only)
  async getNewsStats(): Promise<NewsStats> {
    const response = await apiFetch<ApiResponse<NewsStats>>('/api/news/stats')
    return response.data
  },

  
  // Utility functions
  formatMarketImpact(impact: number): {
    value: number
    label: string
    color: string
    bgColor: string
    icon: string
  } {
    if (impact >= 70) {
      return {
        value: impact,
        label: 'Very Bullish',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: '🚀'
      }
    } else if (impact >= 30) {
      return {
        value: impact,
        label: 'Bullish',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        icon: '📈'
      }
    } else if (impact >= 10) {
      return {
        value: impact,
        label: 'Slightly Bullish',
        color: 'text-green-400',
        bgColor: 'bg-green-25',
        icon: '↗️'
      }
    } else if (impact >= -10) {
      return {
        value: impact,
        label: 'Neutral',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        icon: '➡️'
      }
    } else if (impact >= -30) {
      return {
        value: impact,
        label: 'Slightly Bearish',
        color: 'text-red-400',
        bgColor: 'bg-red-25',
        icon: '↘️'
      }
    } else if (impact >= -70) {
      return {
        value: impact,
        label: 'Bearish',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        icon: '📉'
      }
    } else {
      return {
        value: impact,
        label: 'Very Bearish',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: '📉'
      }
    }
  },

  formatSentiment(sentiment?: string): {
    label: string
    color: string
    bgColor: string
    icon: string
  } {
    switch (sentiment) {
      case 'POSITIVE':
        return {
          label: 'Positive',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '😊'
        }
      case 'NEGATIVE':
        return {
          label: 'Negative',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: '😟'
        }
      default:
        return {
          label: 'Neutral',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '😐'
        }
    }
  },

  formatRiskLevel(risk?: string): {
    label: string
    color: string
    bgColor: string
  } {
    switch (risk) {
      case 'HIGH':
        return {
          label: 'High',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      case 'MEDIUM':
        return {
          label: 'Medium',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        }
      default:
        return {
          label: 'Low',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
    }
  },

  formatTimeHorizon(horizon?: string): {
    label: string
    color: string
  } {
    switch (horizon) {
      case 'SHORT_TERM':
        return {
          label: 'Short Term',
          color: 'text-blue-600'
        }
      case 'LONG_TERM':
        return {
          label: 'Long Term',
          color: 'text-purple-600'
        }
      default:
        return {
          label: 'Medium Term',
          color: 'text-gray-600'
        }
    }
  },

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()

    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) {
      return 'Just now'
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }
}
