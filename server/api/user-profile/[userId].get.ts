import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] Starting get user profile request`)
    
    // Get runtime config
    const config = useRuntimeConfig()
    
    // Create admin client with service role
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

    // Get user ID from route params
    const userId = getRouterParam(event, 'userId')
    
    if (!userId) {
      console.error(`[${requestId}] Missing userId parameter`)
      return { error: 'User ID is required' }
    }

    // Verify the requesting user has permission
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      console.error(`[${requestId}] Missing authorization header`)
      return { error: 'Authorization required' }
    }

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error(`[${requestId}] Invalid token:`, authError)
      return { error: 'Invalid authorization' }
    }

    // Check if user has permission to view this profile
    const userRole = user.app_metadata?.role || 'member'
    const isApproved = user.app_metadata?.is_approved || false
    
    // Users can view their own profile, officers and VPs can view any profile
    if (user.id !== userId && (!isApproved || !['officer', 'vp'].includes(userRole))) {
      console.error(`[${requestId}] Insufficient permissions`)
      return { error: 'Insufficient permissions' }
    }

    // Get user profile using the database function
    const { data, error } = await adminSupabase.rpc('get_user_profile', {
      target_user_id: userId
    })

    if (error) {
      console.error(`[${requestId}] Error fetching user profile:`, error)
      return { error: 'Failed to fetch user profile' }
    }

    if (!data || data.length === 0) {
      console.log(`[${requestId}] User profile not found`)
      return { error: 'User profile not found' }
    }

    const duration = Date.now() - startTime
    console.log(`[${requestId}] User profile fetched successfully in ${duration}ms`)

    return { profile: data[0] }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${requestId}] Error in get user profile API (${duration}ms):`, error)
    
    return { error: 'Internal server error' }
  }
})