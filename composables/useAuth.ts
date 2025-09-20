import { useUserStore } from "~/store/user"

/**
 * Auth composable for consistent authentication handling
 * Works with both SSR and client-side rendering
 */
export const useAuth = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Helper function to safely get user store
  const getUserStore = () => {
    try {
      return useUserStore()
    } catch (error) {
      console.warn('User store not available:', error)
      return null
    }
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => {
    return !!user.value
  })

  /**
   * Check if user is approved - either explicitly approved or has a role assigned
   */
  const isApproved = computed(() => {
    if (!user.value) return false
    const isExplicitlyApproved = user.value.app_metadata?.is_approved || false
    const hasRole = user.value.app_metadata?.role && user.value.app_metadata.role !== 'pending'
    return isExplicitlyApproved || hasRole
  })

  /**
   * Get user role
   */
  const userRole = computed(() => {
    return user.value?.app_metadata?.role || 'member'
  })

  /**
   * Check if user is VP
   */
  const isVP = computed(() => {
    return isApproved.value && userRole.value === 'vp'
  })

  /**
   * Check if user can edit contacts (officer or VP)
   */
  const canEditContacts = computed(() => {
    return isApproved.value && ['officer', 'vp'].includes(userRole.value)
  })

  /**
   * Check if user can delete contacts (VP only)
   */
  const canDeleteContacts = computed(() => {
    return isVP.value
  })

  /**
   * Sign out user
   */
  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      const userStore = getUserStore()
      if (userStore) {
        userStore.clearUser()
      }
      await navigateTo('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  /**
   * Refresh user session and sync user store with fresh data
   */
  const refreshUserSession = async () => {
    try {
      // Force refresh the session to get latest user metadata
      const { data: { session }, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        return false
      }
      
      if (session?.user) {
        // Sync the refreshed user data
        await syncUserStore()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error in refreshUserSession:', error)
      return false
    }
  }

  /**
   * Sync user store with current user state
   */
  const syncUserStore = async () => {
    const userStore = getUserStore()
    if (!userStore) return

    if (user.value) {
      // Always try to sync if user exists, even if store already has user data
      // Try to fetch full name from user_profiles table
      let fullName = user.value.app_metadata?.full_name
      
      if (!fullName) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', user.value.id)
            .single()
          
          if (profile?.full_name) {
            fullName = profile.full_name
          }
        } catch (profileError) {
          // Profile fetch failed, continue without full name
          console.warn('Could not fetch user profile in syncUserStore:', profileError)
        }
      }

      const userData = {
        id: user.value.id,
        email: user.value.email || '',
        app_metadata: {
          role: user.value.app_metadata?.role || 'member',
          is_approved: user.value.app_metadata?.is_approved || false,
          full_name: fullName
        }
      }
      userStore.updateUserState(userData)
    } else if (!user.value && userStore.user) {
      userStore.clearUser()
    }
  }

  return {
    user: readonly(user),
    isAuthenticated,
    isApproved,
    userRole,
    isVP,
    canEditContacts,
    canDeleteContacts,
    signOut,
    syncUserStore,
    refreshUserSession
  }
}