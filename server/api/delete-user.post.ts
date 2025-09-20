import { createClient } from '@supabase/supabase-js'

interface DeleteUserRequest {
  targetUserId: string
}

interface DeleteUserResponse {
  success: boolean
  error?: string
}

// Input validation helper
const validateRequest = (body: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Check if body exists
  if (!body || typeof body !== 'object') {
    errors.push('Request body is required')
    return { isValid: false, errors }
  }
  
  // Validate targetUserId
  if (!body.targetUserId || typeof body.targetUserId !== 'string') {
    errors.push('Target user ID is required and must be a string')
  } else if (body.targetUserId.length < 10) {
    errors.push('Target user ID appears to be invalid')
  }
  
  return { isValid: errors.length === 0, errors }
}

export default defineEventHandler(async (event): Promise<DeleteUserResponse> => {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    // Log request start
    console.log(`[${requestId}] Starting user deletion request`)
    
    // Parse and validate request body
    const body = await readBody<DeleteUserRequest>(event)
    const { targetUserId } = body
    
    // Validate input
    const validation = validateRequest(body)
    if (!validation.isValid) {
      console.warn(`[${requestId}] Request validation failed:`, validation.errors)
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`
      }
    }

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
      return {
        success: false,
        error: 'Authentication required'
      }
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the JWT token and get user
    const { data: { user }, error: authError } = await adminSupabase.auth.getUser(token)
    
    if (authError || !user) {
      console.warn(`[${requestId}] Invalid token or user not found:`, authError)
      return {
        success: false,
        error: 'Invalid authentication token'
      }
    }

    // Verify user is VP and approved
    const userRole = user.app_metadata?.role
    const isApproved = user.app_metadata?.is_approved || false
    
    if (userRole !== 'vp' || !isApproved) {
      console.warn(`[${requestId}] Access denied - user role: ${userRole}, approved: ${isApproved}`)
      return {
        success: false,
        error: 'Access denied: VP privileges required'
      }
    }

    // Prevent self-deletion
    if (user.id === targetUserId) {
      console.warn(`[${requestId}] Attempted self-deletion by user: ${user.id}`)
      return {
        success: false,
        error: 'Cannot delete your own account'
      }
    }

    console.log(`[${requestId}] VP authentication verified - User: ${user.id}`)
    
    // Verify target user exists before attempting deletion
    const { data: targetUser, error: fetchError } = await adminSupabase.auth.admin.getUserById(targetUserId)
    if (fetchError || !targetUser.user) {
      console.error(`[${requestId}] Target user not found:`, fetchError)
      return {
        success: false,
        error: 'Target user not found'
      }
    }

    // Delete user using admin client with service role authentication
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(targetUserId)

    if (deleteError) {
      console.error(`[${requestId}] Failed to delete user:`, deleteError)
      return {
        success: false,
        error: 'Failed to delete user: Database operation failed'
      }
    }

    const duration = Date.now() - startTime
    console.log(`[${requestId}] User deletion completed successfully in ${duration}ms`)

    return {
      success: true
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${requestId}] Error in delete-user API (${duration}ms):`, error)
    
    // Return generic error message to prevent information leakage
    return {
      success: false,
      error: 'Internal server error occurred while deleting user'
    }
  }
})