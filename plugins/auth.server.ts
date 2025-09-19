import { useUserStore } from "~/store/user"

/**
 * Server-side auth plugin to sync user store with Supabase user state
 */
export default defineNuxtPlugin(() => {
  // Only run on server-side
  if (!import.meta.server) return

  const user = useSupabaseUser()
  
  // On server-side, sync user store if user exists
  if (user.value) {
    try {
      const userStore = useUserStore()
      
      // Update store with server-side user data
      const userData = {
        id: user.value.id,
        email: user.value.email || '',
        app_metadata: {
          role: user.value.app_metadata?.role || 'member',
          is_approved: user.value.app_metadata?.is_approved || false
        }
      }
      userStore.updateUserState(userData)
    } catch (error) {
      // Silently handle errors on server-side
      console.warn('Could not sync user store on server:', error)
    }
  }
})