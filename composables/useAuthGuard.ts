/**
 * Auth guard composable for protecting pages and components
 */
export const useAuthGuard = () => {
  const { isAuthenticated, isApproved, isVP, canEditContacts } = useAuth()

  /**
   * Require authentication - throws error if not authenticated
   */
  const requireAuth = () => {
    if (!isAuthenticated.value) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      })
    }
  }

  /**
   * Require approval - throws error if not approved
   */
  const requireApproval = () => {
    requireAuth()
    if (!isApproved.value) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account approval required'
      })
    }
  }

  /**
   * Require VP privileges - throws error if not VP
   */
  const requireVP = () => {
    requireApproval()
    if (!isVP.value) {
      throw createError({
        statusCode: 403,
        statusMessage: 'VP privileges required'
      })
    }
  }

  /**
   * Require edit permissions - throws error if cannot edit
   */
  const requireEditPermissions = () => {
    requireApproval()
    if (!canEditContacts.value) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Edit permissions required'
      })
    }
  }

  return {
    requireAuth,
    requireApproval,
    requireVP,
    requireEditPermissions
  }
}