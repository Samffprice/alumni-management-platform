import { defineStore } from 'pinia'
import type { User, UserRole, UserState } from '~/types'

export const useUserStore = defineStore('user', {
    state: (): UserState => ({
        user: null,
        role: 'member',
        is_approved: false,
        loading: false
    }),

    actions: {
        /**
         * Fetch current user and their metadata from Supabase
         * This method is now primarily for client-side use
         */
        async fetchUser(): Promise<void> {
            this.loading = true

            try {
                // Use the Supabase user composable for SSR compatibility
                const user = useSupabaseUser()
                
                if (user.value) {
                    // Extract role and approval status from user metadata
                    const role = user.value.app_metadata?.role || 'member'
                    const is_approved = user.value.app_metadata?.is_approved || false

                    // Update store state
                    this.user = {
                        id: user.value.id,
                        email: user.value.email || '',
                        app_metadata: {
                            role: role as UserRole,
                            is_approved
                        }
                    }
                    this.role = role as UserRole
                    this.is_approved = is_approved
                } else {
                    this.clearUser()
                }
            } catch (error) {
                console.error('Error in fetchUser:', error)

                // Use error handler for consistent error handling if available
                try {
                    const { handleError } = useErrorHandler()
                    handleError(error, 'Fetch User', {
                        showNotification: false, // Don't show notification for user fetch errors
                        retryable: true
                    })
                } catch {
                    // Error handler might not be available in all contexts
                    console.warn('Error handler not available')
                }

                this.clearUser()
            } finally {
                this.loading = false
            }
        },

        /**
         * Clear user state (for logout)
         */
        clearUser(): void {
            this.user = null
            this.role = 'member'
            this.is_approved = false
            this.loading = false
        },

        /**
         * Update user state with new user data
         */
        updateUserState(user: User): void {
            this.user = user
            this.role = user.app_metadata.role
            this.is_approved = user.app_metadata.is_approved
        }
    },

    getters: {
        /**
         * Check if user is approved - either explicitly approved or has a role assigned
         */
        isApproved: (state): boolean => {
            if (!state.user) return false
            const isExplicitlyApproved = state.is_approved
            const hasRole = state.role && state.role !== 'pending'
            return isExplicitlyApproved || hasRole
        },

        /**
         * Check if user can edit contacts (officer or VP)
         */
        canEditContacts: (state): boolean => {
            return state.is_approved && ['officer', 'vp'].includes(state.role)
        },

        /**
         * Check if user can delete contacts (VP only)
         */
        canDeleteContacts: (state): boolean => {
            return state.is_approved && state.role === 'vp'
        },

        /**
         * Check if user is a VP
         */
        isVP: (state): boolean => {
            return state.is_approved && state.role === 'vp'
        },

        /**
         * Check if user is authenticated
         */
        isAuthenticated: (state): boolean => {
            return state.user !== null
        },

        /**
         * Get user's display name (full name from profile or email)
         */
        displayName: (state): string => {
            // Try to get full name from user metadata first
            const fullName = state.user?.app_metadata?.full_name
            if (fullName) {
                return fullName
            }
            return state.user?.email || 'Guest'
        },

        /**
         * Check if user is an officer or higher
         */
        isOfficerOrHigher: (state): boolean => {
            return state.is_approved && ['officer', 'vp'].includes(state.role)
        },

        /**
         * Get user role display name
         */
        roleDisplayName: (state): string => {
            const roleNames = {
                member: 'Member',
                officer: 'Officer',
                vp: 'Vice President'
            }
            return roleNames[state.role] || 'Member'
        }
    }
})