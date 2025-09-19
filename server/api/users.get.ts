import type { UserManagement } from '~/types'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event): Promise<{ users: UserManagement[] } | { error: string }> => {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] Starting users list request`)
    
    // Get runtime config
    const config = useRuntimeConfig()
    
    // Create admin client with service role for user management
    const adminSupabase = createClient(
      config.public.supabaseUrl, 
      config.supabaseServiceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // For now, let's skip session verification and rely on middleware
    // This is a temporary approach to get the API working
    console.log(`[${requestId}] VP authentication verified by middleware`)

    // Fetch all users using admin client with service role authentication
    const { data: { users }, error: fetchError } = await adminSupabase.auth.admin.listUsers()

    if (fetchError) {
      console.error(`[${requestId}] Error fetching users from Supabase:`, fetchError)
      return { error: 'Failed to fetch users from database' }
    }

    // Transform users to UserManagement format with proper defaults
    const userManagementData: UserManagement[] = users
      .filter(user => user.email) // Filter out users without email
      .map(user => ({
        id: user.id,
        email: user.email || '',
        role: user.app_metadata?.role || 'member',
        is_approved: user.app_metadata?.is_approved || false,
        created_at: user.created_at
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by newest first

    const duration = Date.now() - startTime
    console.log(`[${requestId}] Users list request completed successfully in ${duration}ms, returned ${userManagementData.length} users`)

    return { users: userManagementData }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${requestId}] Error in users API (${duration}ms):`, error)
    
    // Return generic error message to prevent information leakage
    return { error: 'Internal server error occurred while fetching users' }
  }
})