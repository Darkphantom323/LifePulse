'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api'

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  console.log('Raw token from localStorage:', token)
  console.log('Token length:', token?.length)
  console.log('Token starts with:', token?.substring(0, 20))
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
  
  console.log('Authorization header being sent:', headers.Authorization)
  return headers
}

// Helper function to make authenticated requests
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  console.log('Making request to:', `${API_BASE_URL}${url}`)
  console.log('Request options:', options)
  console.log('Headers:', getAuthHeaders())
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  })
  
  console.log('Response status:', response.status)
  console.log('Response headers:', Object.fromEntries(response.headers.entries()))
  
  if (response.status === 401) {
    console.log('401 Unauthorized - removing token and redirecting')
    // Save debug info before redirect
    localStorage.setItem('debugInfo', JSON.stringify({
      url: `${API_BASE_URL}${url}`,
      status: response.status,
      timestamp: new Date().toISOString(),
      error: '401 Unauthorized'
    }))
    // Token expired, redirect to login
    localStorage.removeItem('token')
    alert('401 Unauthorized Error - Check console and network tab!')
    window.location.href = '/auth/signin'
    throw new Error('Authentication required')
  }
  
  if (!response.ok) {
    const errorText = await response.text()
    console.log('Error response text:', errorText)
    
    let error
    try {
      error = JSON.parse(errorText)
    } catch {
      error = { message: errorText || 'Request failed' }
    }
    
    console.log('Parsed error:', error)
    
    // Save debug info before potential redirect
    localStorage.setItem('debugInfo', JSON.stringify({
      url: `${API_BASE_URL}${url}`,
      status: response.status,
      errorText: errorText,
      parsedError: error,
      timestamp: new Date().toISOString()
    }))
    
    // Show alert with error details before throwing
    alert(`API Error ${response.status}: ${error.message || errorText}`)
    
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  
  const data = await response.json()
  
  // Handle ApiResponse wrapper - extract data field if it exists
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data
  }
  
  return data
}

// Dashboard hook
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => authenticatedFetch('/dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Goals hooks
export function useGoals() {
  return useQuery({
    queryKey: ['goals'],
    queryFn: () => authenticatedFetch('/goals')
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (goalData: any) => {
      return authenticatedFetch('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData)
      })
    },
    onMutate: async (goalData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['goals'] })

      // Snapshot the previous value
      const previousGoals = queryClient.getQueryData(['goals'])

      // Create optimistic goal with temporary ID
      const optimisticGoal = {
        id: `temp-${Date.now()}`,
        ...goalData,
        currentValue: 0,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Optimistically update the cache
      queryClient.setQueryData(['goals'], (old: any) => {
        return old ? [optimisticGoal, ...old] : [optimisticGoal]
      })

      return { previousGoals }
    },
    onSuccess: (data, variables, context) => {
      // Replace the optimistic goal with the real one
      queryClient.setQueryData(['goals'], (old: any) => {
        if (!old) return old
        return old.map((goal: any) => 
          goal.id?.toString().startsWith('temp-') ? { ...goal, id: data.id } : goal
        )
      })
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, updates }: { goalId: string, updates: any }) => {
      return authenticatedFetch(`/goals/${goalId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    },
    onMutate: async ({ goalId, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['goals'] })

      // Snapshot the previous value
      const previousGoals = queryClient.getQueryData(['goals'])

      // Optimistically update the cache
      queryClient.setQueryData(['goals'], (old: any) => {
        if (!old) return old
        return old.map((goal: any) => 
          goal.id?.toString() === goalId ? { ...goal, ...updates } : goal
        )
      })

      // Return context with previous data
      return { previousGoals }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals)
      }
    },
    onSettled: () => {
      // Always refetch after mutation settles
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (goalId: string) => {
      return authenticatedFetch(`/goals/${goalId}`, {
        method: 'DELETE'
      })
    },
    onMutate: async (goalId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['goals'] })

      // Snapshot the previous value
      const previousGoals = queryClient.getQueryData(['goals'])

      // Optimistically remove the goal
      queryClient.setQueryData(['goals'], (old: any) => {
        if (!old) return old
        return old.filter((goal: any) => goal.id?.toString() !== goalId)
      })

      return { previousGoals }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(['goals'], context.previousGoals)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useIncrementGoal() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ goalId, increment }: { goalId: string, increment: number }) => {
      // Get current goal to calculate new currentValue
      const currentGoals = queryClient.getQueryData(['goals']) as any[]
      const currentGoal = currentGoals?.find((goal: any) => goal.id?.toString() === goalId)
      const newCurrentValue = Math.max(0, (currentGoal?.currentValue || 0) + increment)
      
      return authenticatedFetch(`/goals/${goalId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ currentValue: newCurrentValue })
      })
    },
    onSuccess: () => {
      // Refetch goals data from server after successful update
      queryClient.invalidateQueries({ queryKey: ['goals'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      console.error('Failed to increment goal:', error)
    }
  })
}

// Hydration hooks
export function useHydration(params?: { today?: boolean, startDate?: string, endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.today) searchParams.set('today', 'true')
  if (params?.startDate) searchParams.set('startDate', params.startDate)
  if (params?.endDate) searchParams.set('endDate', params.endDate)
  
  return useQuery({
    queryKey: ['hydration', params],
    queryFn: () => authenticatedFetch(`/hydration?${searchParams}`),
    staleTime: 1 * 60 * 1000, // 1 minute - refresh more frequently for real-time updates
    refetchOnWindowFocus: true, // Refetch when user returns to the window
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes in background
  })
}

export function useAddHydration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (amount: number) => {
      return authenticatedFetch('/hydration', {
        method: 'POST',
        body: JSON.stringify({ amount })
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useDeleteLastHydration() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      return authenticatedFetch('/hydration', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hydration'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Get hydration analytics data
export function useHydrationAnalytics(params?: { startDate?: string, endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.set('startDate', params.startDate)
  if (params?.endDate) searchParams.set('endDate', params.endDate)
  
  return useQuery({
    queryKey: ['hydration-analytics', params],
    queryFn: () => authenticatedFetch(`/hydration?${searchParams}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Meditation hooks
export function useMeditation(params?: { startDate?: string, endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.set('startDate', params.startDate)
  if (params?.endDate) searchParams.set('endDate', params.endDate)
  
  return useQuery({
    queryKey: ['meditation', params],
    queryFn: () => authenticatedFetch(`/meditation?${searchParams}`),
    staleTime: 1 * 60 * 1000, // 1 minute - refresh more frequently
    refetchOnWindowFocus: true,
  })
}

// Get meditation analytics data
export function useMeditationAnalytics(params?: { startDate?: string, endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.set('startDate', params.startDate)
  if (params?.endDate) searchParams.set('endDate', params.endDate)
  
  return useQuery({
    queryKey: ['meditation-analytics', params],
    queryFn: () => authenticatedFetch(`/meditation?${searchParams}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useAddMeditation() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sessionData: { duration: number, type: string, notes?: string }) => {
      return authenticatedFetch('/meditation', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meditation'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// Schedule hooks
export function useSchedule(params?: { startDate?: string, endDate?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.startDate) searchParams.set('startDate', params.startDate)
  if (params?.endDate) searchParams.set('endDate', params.endDate)
  
  return useQuery({
    queryKey: ['schedule', params],
    queryFn: () => authenticatedFetch(`/schedule?${searchParams}`)
  })
}

export function useCreateScheduleEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventData: any) => {
      return authenticatedFetch('/schedule', {
        method: 'POST',
        body: JSON.stringify(eventData)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useUpdateScheduleEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ eventId, updates }: { eventId: string, updates: any }) => {
      return authenticatedFetch(`/schedule/${eventId}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

export function useDeleteScheduleEvent() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (eventId: string) => {
      return authenticatedFetch(`/schedule/${eventId}`, {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

// User Profile hooks
export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => authenticatedFetch('/user/profile'),
    staleTime: 1 * 60 * 1000, // 1 minute - refresh more frequently for streak updates
    refetchOnWindowFocus: true,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (profileData: { name?: string, bio?: string, profilePictureUrl?: string }) => {
      return authenticatedFetch('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    }
  })
}

export function useUploadProfilePicture() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (file: File) => {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', file)
      
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type)
      console.log('Using token:', token?.substring(0, 20) + '...')
      
      const response = await fetch(`${API_BASE_URL}/user/profile/picture`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      })
      
      console.log('Upload response status:', response.status)
      console.log('Upload response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.status === 401) {
        localStorage.removeItem('token')
        alert('401 Unauthorized - Please sign in again')
        window.location.href = '/auth/signin'
        throw new Error('Authentication required')
      }
      
      if (!response.ok) {
        const errorText = await response.text()
        console.log('Upload error response:', errorText)
        
        let error
        try {
          error = JSON.parse(errorText)
        } catch {
          error = { message: errorText || 'Upload failed' }
        }
        
        const errorMessage = error.message || `Upload failed with status ${response.status}`
        console.error('Upload error:', errorMessage)
        throw new Error(errorMessage)
      }
      
      const data = await response.json()
      console.log('Upload success response:', data)
      
      // Extract data from ApiResponse wrapper
      if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return data.data
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    }
  })
}

export function useDeleteProfilePicture() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      return authenticatedFetch('/user/profile/picture', {
        method: 'DELETE'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    }
  })
}

// Update user streak
export function useUpdateStreak() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      return authenticatedFetch('/user/streak', {
        method: 'POST'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
} 