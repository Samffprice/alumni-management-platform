import { createClient } from '@supabase/supabase-js'

interface CreateUserProfileRequest {
  userId: string
  fullName: string
  phoneNumber: string
  userPosition?: string
}

export default defineEventHandler(async (event): Promise<{ success: boolean; error?: string }> => {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] Starting create user profile request`)
    
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

    // Parse request body
    const body = await readBody(event) as CreateUserProfileRequest
    
    if (!body.userId || !body.fullName || !body.phoneNumber) {
      console.error(`[${requestId}] Missing required fields`)
      return { success: false, error: 'Missing required fields' }
    }

    // Validate input
    if (body.fullName.trim().length < 2) {
      return { success: false, error: 'Full name must be at least 2 characters' }
    }

    // Create user profile directly in the table since we're using service role
    const { data, error } = await adminSupabase
      .from('user_profiles')
      .insert({
        user_id: body.userId,
        full_name: body.fullName.trim(),
        phone_number: body.phoneNumber,
        user_position: body.userPosition || 'Member'
      })
      .select()
      .single()

    if (error) {
      console.error(`[${requestId}] Error creating user profile:`, error)
      return { success: false, error: 'Failed to create user profile' }
    }

    const duration = Date.now() - startTime
    console.log(`[${requestId}] User profile created successfully in ${duration}ms`)

    return { success: true }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${requestId}] Error in create user profile API (${duration}ms):`, error)
    
    return { success: false, error: 'Internal server error' }
  }
})