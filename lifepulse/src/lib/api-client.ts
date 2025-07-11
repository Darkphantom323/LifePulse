const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    
    // Get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearToken()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/signin'
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Auth endpoints
  async register(userData: { name: string; email: string; password: string }) {
    return this.request<ApiResponse<{ token: string; id: string; name: string; email: string }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<ApiResponse<{ token: string; id: string; name: string; email: string }>>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  // Goals endpoints
  async getGoals() {
    return this.request<any[]>('/goals')
  }

  async createGoal(goalData: any) {
    return this.request<ApiResponse<string>>('/goals', {
      method: 'POST',
      body: JSON.stringify(goalData),
    })
  }

  async updateGoal(goalId: string, goalData: any) {
    return this.request<ApiResponse<any>>(`/goals/${goalId}`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    })
  }

  async deleteGoal(goalId: string) {
    return this.request<ApiResponse<string>>(`/goals/${goalId}`, {
      method: 'DELETE',
    })
  }

  async updateGoalProgress(goalId: string, currentValue: number) {
    return this.request<ApiResponse<string>>(`/goals/${goalId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ currentValue }),
    })
  }

  // Hydration endpoints
  async getHydrationEntries(params?: { today?: boolean; startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.today) searchParams.append('today', 'true')
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    
    const queryString = searchParams.toString()
    return this.request<any>('/hydration' + (queryString ? `?${queryString}` : ''))
  }

  async addHydrationEntry(amount: number) {
    return this.request<ApiResponse<string>>('/hydration', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }

  async deleteLastHydrationEntry() {
    return this.request<ApiResponse<string>>('/hydration', {
      method: 'DELETE',
    })
  }

  // Meditation endpoints
  async getMeditationSessions(params?: { startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    
    const queryString = searchParams.toString()
    return this.request<any[]>('/meditation' + (queryString ? `?${queryString}` : ''))
  }

  async addMeditationSession(sessionData: any) {
    return this.request<ApiResponse<string>>('/meditation', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    })
  }

  // Schedule endpoints
  async getScheduleEvents(params?: { startDate?: string; endDate?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    
    const queryString = searchParams.toString()
    return this.request<any[]>('/schedule' + (queryString ? `?${queryString}` : ''))
  }

  async createScheduleEvent(eventData: any) {
    return this.request<ApiResponse<string>>('/schedule', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  async updateScheduleEvent(eventId: string, eventData: any) {
    return this.request<ApiResponse<any>>(`/schedule/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    })
  }

  async deleteScheduleEvent(eventId: string) {
    return this.request<ApiResponse<string>>(`/schedule/${eventId}`, {
      method: 'DELETE',
    })
  }

  // Dashboard endpoint
  async getDashboardData() {
    return this.request<any>('/dashboard')
  }
}

export const apiClient = new ApiClient()
export default apiClient 