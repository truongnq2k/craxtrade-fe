import { apiFetch, ApiPaths } from '../utils/api'
import type { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  RegisterResponse,
  ApiResponse 
} from '../types'

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiFetch<ApiResponse<LoginResponse>>(ApiPaths.login, {
      method: 'POST',
      body: credentials,
      auth: false
    })
  },

  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    // Register doesn't return tokens from backend, so we login after registration
    await apiFetch<RegisterResponse>(ApiPaths.signup, {
      method: 'POST',
      body: userData,
      auth: false
    })

    // After successful registration, login to get tokens
    const loginResponse = await apiFetch<ApiResponse<LoginResponse>>(ApiPaths.login, {
      method: 'POST',
      body: {
        email: userData.email,
        password: userData.password
      },
      auth: false
    })

    return loginResponse
  },

  async logout(): Promise<void> {
    // Backend might not have logout endpoint, but we can clear token client-side
    return Promise.resolve()
  },

  // Helper method to handle authentication flow
  async authenticateUser(credentials: LoginRequest, isRegister = false): Promise<ApiResponse<LoginResponse>> {
    if (isRegister) {
      return this.register(credentials as RegisterRequest)
    }
    return this.login(credentials)
  },

  // Extract token from response
  extractToken(response: ApiResponse<LoginResponse>): string {
    if (!response.success || !response.data?.tokens?.accessToken) {
      throw new Error('Invalid authentication response')
    }
    return response.data.tokens.accessToken
  }
}
