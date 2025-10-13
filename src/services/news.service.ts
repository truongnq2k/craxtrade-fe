import { apiFetch, ApiPaths } from '../utils/api'
import type { News, CreateNewsRequest, NewsStats } from '../types'

export const newsService = {
  async getAllNews(): Promise<News[]> {
    return apiFetch<News[]>(ApiPaths.news)
  },

  async getNewsById(id: string): Promise<News> {
    return apiFetch<News>(ApiPaths.newsById(id))
  },

  async createNews(newsData: CreateNewsRequest): Promise<News> {
    return apiFetch<News>(ApiPaths.news, {
      method: 'POST',
      body: newsData
    })
  },

  async updateNews(id: string, newsData: Partial<News>): Promise<News> {
    return apiFetch<News>(ApiPaths.newsById(id), {
      method: 'PUT',
      body: newsData
    })
  },

  async deleteNews(id: string): Promise<void> {
    return apiFetch<void>(ApiPaths.newsById(id), {
      method: 'DELETE'
    })
  },

  async getRecentNews(): Promise<News[]> {
    return apiFetch<News[]>(ApiPaths.recentNews)
  },

  async getNewsBySource(source: string): Promise<News[]> {
    return apiFetch<News[]>(ApiPaths.newsBySource(source))
  },

  async getNewsStats(): Promise<NewsStats> {
    return apiFetch<NewsStats>(ApiPaths.newsStats)
  }
}
