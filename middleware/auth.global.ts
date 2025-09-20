/**
 * Global authentication middleware
 * Runs on all routes to check authentication status and approval
 * 
 * Requirements: 1.3, 1.4, 1.5
 */
export default defineNuxtRouteMiddleware(async (to) => {
  // Skip middleware for auth-related pages and index page to prevent redirect loops
  // Index page (/) handles its own authentication and redirects
  const authPages = ['/login', '/signup', '/confirm', '/pending-approval', '/']
  if (authPages.includes(to.path)) {
    return
  }

  const user = useSupabaseUser()

  // If no user, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }

  // Check if user is approved - either explicitly approved or has a role assigned
  const isExplicitlyApproved = user.value.app_metadata?.is_approved || false
  const hasRole = user.value.app_metadata?.role && user.value.app_metadata.role !== 'pending'
  const isApproved = isExplicitlyApproved || hasRole
  
  if (!isApproved) {
    // User is authenticated but not approved, redirect to pending approval page
    return navigateTo('/pending-approval')
  }

  // User is authenticated and approved, allow access
})