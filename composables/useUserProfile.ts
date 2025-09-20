import type { UserProfile } from '~/types'

export const useUserProfile = () => {
  const supabase = useSupabaseClient()
  const { handleError } = useErrorHandler()
  const { showSuccess } = useNotifications()

  /**
   * Get user profile by user ID
   */
  const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await $fetch(`/api/user-profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.profile
    } catch (error) {
      console.error('Error fetching user profile:', error)
      handleError(error, 'Get User Profile', { showNotification: false })
      return null
    }
  }

  /**
   * Create user profile
   */
  const createUserProfile = async (
    userId: string,
    fullName: string,
    phoneNumber: string,
    userPosition?: string
  ): Promise<boolean> => {
    try {
      const response = await $fetch('/api/create-user-profile', {
        method: 'POST',
        body: {
          userId,
          fullName,
          phoneNumber,
          userPosition
        }
      })

      if (response.error) {
        throw new Error(response.error)
      }

      return response.success
    } catch (error) {
      console.error('Error creating user profile:', error)
      handleError(error, 'Create User Profile', { showNotification: true })
      return false
    }
  }

  /**
   * Update user profile
   */
  const updateUserProfile = async (
    fullName: string,
    phoneNumber?: string,
    userPosition?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('upsert_user_profile', {
        p_full_name: fullName,
        p_phone_number: phoneNumber,
        p_user_position: userPosition
      })

      if (error) {
        throw error
      }

      showSuccess('Profile Updated', 'Your profile has been successfully updated.')
      return true
    } catch (error) {
      console.error('Error updating user profile:', error)
      handleError(error, 'Update User Profile', { showNotification: true })
      return false
    }
  }

  /**
   * Get current user's profile
   */
  const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
    try {
      const user = useSupabaseUser()
      if (!user.value) {
        return null
      }

      return await getUserProfile(user.value.id)
    } catch (error) {
      console.error('Error fetching current user profile:', error)
      return null
    }
  }

  return {
    getUserProfile,
    createUserProfile,
    updateUserProfile,
    getCurrentUserProfile
  }
}