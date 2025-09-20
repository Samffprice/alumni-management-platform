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

    // Server-side session validation for additional security
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn(`[${requestId}] Missing or invalid authorization header`)
      return { error: 'Authentication required' }
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token)
    
    if (authError || !user) {
      console.warn(`[${requestId}] Invalid token or user not found:`, authError)
      return { error: 'Invalid authentication token' }
    }

    // Verify user is VP and approved
    const userRole = user.app_metadata?.role
    const isApproved = user.app_metadata?.is_approved || false
    
    if (userRole !== 'vp' || !isApproved) {
      console.warn(`[${requestId}] Access denied - user role: ${userRole}, approved: ${isApproved}`)
      return { error: 'Access denied: VP privileges required' }
    }

    console.log(`[${requestId}] VP authentication verified - User: ${user.id}`)

    // Fetch all users using admin client with service role authentication
    const { data: { users }, error: fetchError } = await adminSupabase.auth.admin.listUsers()

    if (fetchError) {
      console.error(`[${requestId}] Error fetching users from Supabase:`, fetchError)
      return { error: 'Failed to fetch users from database' }
    }

    // Fetch user profiles to get full names
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('user_profiles')
      .select('user_id, full_name')

    if (profilesError) {
      console.warn(`[${requestId}] Error fetching user profiles:`, profilesError)
      // Continue without profiles - we'll just use emails
    }

    // Create a map of user_id to full_name for quick lookup
    const profilesMap = new Map<string, string>()
    if (profiles) {
      profiles.forEach(profile => {
        profilesMap.set(profile.user_id, profile.full_name)
      })
    }

    // Transform users to UserManagement format with proper defaults
    const userManagementData: UserManagement[] = users
      .filter(user => user.email) // Filter out users without email
      .map(user => ({
        id: user.id,
        email: user.email || '',
        full_name: profilesMap.get(user.id),
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