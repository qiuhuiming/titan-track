import { authService } from './authService'

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000'

export interface ApiError {
  status: number
  message: string
  detail?: unknown
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    const token = authService.getAccessToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const headers = this.getHeaders()

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: response.statusText,
      }
      try {
        error.detail = await response.json()
      } catch {
        // Ignore JSON parse errors
      }
      throw new Error(`API error: ${String(response.status)} ${response.statusText}`)
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path)
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('POST', path, body)
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>('PUT', path, body)
  }

  delete(path: string): Promise<undefined> {
    return this.request<undefined>('DELETE', path)
  }

  /**
   * Check if the API is reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health')
      return true
    } catch {
      return false
    }
  }
}

export const apiService = new ApiService()
