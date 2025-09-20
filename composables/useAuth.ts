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
   * Sync user store with current user state
   */
  const syncUserStore = () => {
    const userStore = getUserStore()
    if (!userStore) return

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
    syncUserStore
  }
}