import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  const requestId = Math.random().toString(36).substring(7)
  
  try {
    console.log(`[${requestId}] Starting user approval fix`)
    
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

    // Get all users
    const { data: { users }, error: fetchError } = await adminSupabase.auth.admin.listUsers()

    if (fetchError) {
      console.error(`[${requestId}] Error fetching users:`, fetchError)
      return { success: false, error: 'Failed to fetch users' }
    }

    let updatedCount = 0
    const updates = []

    // Check each user and fix approval status
    for (const user of users) {
      const metadata = user.app_metadata || {}
      const hasRole = metadata.role && metadata.role !== 'pending'
      const isApproved = metadata.is_approved || false

      // If user has a role but is not marked as approved, fix it
      if (hasRole && !isApproved) {
        console.log(`[${requestId}] Fixing approval for user ${user.id} with role ${metadata.role}`)
        
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
          user.id,
          {
            app_metadata: {
              ...metadata,
              is_approved: true
            }
          }
        )

        if (updateError) {
          console.error(`[${requestId}] Failed to update user ${user.id}:`, updateError)
          updates.push({ userId: user.id, success: false, error: updateError.message })
        } else {
          updatedCount++
          updates.push({ userId: user.id, success: true, role: metadata.role })
        }
      }
    }

    const duration = Date.now() - startTime
    console.log(`[${requestId}] User approval fix completed in ${duration}ms, updated ${updatedCount} users`)

    return {
      success: true,
      message: `Updated ${updatedCount} users`,
      updates
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[${requestId}] Error in fix user approval API (${duration}ms):`, error)
    
    return { success: false, error: 'Internal server error' }
  }
})