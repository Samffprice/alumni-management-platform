export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  
  // Check if user is authenticated
  if (!user.value) {
    return navigateTo('/login')
  }
  
  // Check if user is approved
  const isApproved = user.value.app_metadata?.is_approved || false
  if (!isApproved) {
    return navigateTo('/pending-approval')
  }
  
  // Check if user has officer or VP role
  const userRole = user.value.app_metadata?.role || 'member'
  if (!['officer', 'vp'].includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied. Officer or VP role required.'
    })
  }
})