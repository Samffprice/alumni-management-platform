/**
 * Client-side auth plugin to handle auth state changes and hydration
 */
export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  // Helper function to get user store safely with retry
  const getUserStore = () => {
    try {
      return useUserStore()
    } catch (error) {
      // Store not available yet, return null
      return null
    }
  }

  // Sync user store with Supabase user state
  const syncUserState = () => {
    const userStore = getUserStore()
    if (!userStore) return false // Return false if store not available

    if (user.value && !userStore.user) {
      const userData = {
        id: user.value.id,
        email: user.value.email || '',
        app_metadata: {
          role: user.value.app_metadata?.role || 'member',
          is_approved: user.value.app_metadata?.is_approved || false
        }
      }
      userStore.updateUserState(userData)
      return true
    } else if (!user.value && userStore.user) {
      userStore.clearUser()
      return true
    }
    return true
  }

  // Initial sync with retry
  const initSync = () => {
    if (!syncUserState()) {
      // If sync failed, retry after a short delay
      setTimeout(initSync, 100)
    }
  }

  // Start initial sync on next tick
  nextTick(initSync)

  // Listen for auth state changes with safe store access
  supabase.auth.onAuthStateChange(async (event, session) => {
    // Try to get store, but don't fail if not available
    const userStore = getUserStore()
    if (!userStore) {
      // Store not ready yet, schedule retry
      setTimeout(() => {
        const retryStore = getUserStore()
        if (retryStore) {
          // Process the auth change with retry
          if (event === 'SIGNED_IN' && session?.user) {
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              app_metadata: {
                role: session.user.app_metadata?.role || 'member',
                is_approved: session.user.app_metadata?.is_approved || false
              }
            }
            retryStore.updateUserState(userData)
          } else if (event === 'SIGNED_OUT') {
            retryStore.clearUser()
          }
        }
      }, 100)
      return
    }

    if (event === 'SIGNED_IN' && session?.user) {
      // User signed in, update store
      const userData = {
        id: session.user.id,
        email: session.user.email || '',
        app_metadata: {
          role: session.user.app_metadata?.role || 'member',
          is_approved: session.user.app_metadata?.is_approved || false
        }
      }
      userStore.updateUserState(userData)
    } else if (event === 'SIGNED_OUT') {
      // User signed out, clear store
      userStore.clearUser()
    }
  })
})