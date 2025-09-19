/**
 * VP-only middleware
 * Protects admin routes that should only be accessible to VPs
 * 
 * Requirements: 2.6, 2.7
 */
export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()

  // If no user, redirect to login (this should be caught by auth.global.ts first)
  if (!user.value) {
    return navigateTo('/login')
  }

  // Check if user is approved and is a VP using Supabase user data directly
  const isApproved = user.value.app_metadata?.is_approved || false
  const role = user.value.app_metadata?.role || 'member'

  if (!isApproved || role !== 'vp') {
    // User is not a VP, throw 403 error
    throw createError({
      statusCode: 403,
      statusMessage: 'Access Denied: VP privileges required'
    })
  }

  // User is a VP, allow access
  // Note: User store sync will happen in the page components via plugins
})