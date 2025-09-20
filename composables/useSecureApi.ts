/**
 * Secure API composable that automatically includes JWT tokens
 * Use this for all admin API calls that require authentication
 */
export const useSecureApi = () => {
  const supabase = useSupabaseClient()

  /**
   * Get the current user's JWT token
   */
  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.access_token || null
    } catch (error) {
      console.error('Error getting auth token:', error)
      return null
    }
  }

  /**
   * Make a secure API call with automatic JWT token inclusion
   */
  const secureApiCall = async <T>(
    url: string, 
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
      body?: any
    } = {}
  ): Promise<T> => {
    const token = await getAuthToken()
    
    if (!token) {
      throw new Error('Authentication token not available')
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    try {
      const response = await $fetch<T>(url, {
        method: options.method || 'GET',
        headers,
        body: options.body
      })

      return response
    } catch (error) {
      // Handle authentication errors specifically
      if (error instanceof Error && error.message.includes('Authentication')) {
        // Try to refresh the session and retry once
        await supabase.auth.refreshSession()
        const newToken = await getAuthToken()
        
        if (newToken) {
          headers.Authorization = `Bearer ${newToken}`
          return await $fetch<T>(url, {
            method: options.method || 'GET',
            headers,
            body: options.body
          })
        }
      }
      
      throw error
    }
  }

  return {
    secureApiCall,
    getAuthToken
  }
}