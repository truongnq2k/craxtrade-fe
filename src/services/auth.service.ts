import { apiFetch, ApiPaths } from '../utils/api'
import type { LoginRequest, RegisterRequest, LoginResponse } from '../types'

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>(ApiPaths.login, {
      method: 'POST',
      body: credentials,
      auth: false
    })
  },

  async register(userData: RegisterRequest): Promise<LoginResponse> {
    return apiFetch<LoginResponse>(ApiPaths.signup, {
      method: 'POST',
      body: userData,
      auth: false
    })
  },

  async logout(): Promise<void> {
    // Backend might not have logout endpoint, but we can clear token client-side
    return Promise.resolve()
  }
}
