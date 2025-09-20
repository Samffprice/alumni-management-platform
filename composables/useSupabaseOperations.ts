import type { Contact, ContactInput, User, UpdateUserRoleRequest } from '~/types'

interface SupabaseOperationOptions {
  showLoading?: boolean
  loadingMessage?: string
  retryable?: boolean
  maxRetries?: number
  showNotifications?: boolean
}

export const useSupabaseOperations = () => {
  const supabase = useSupabaseClient()
  const { handleError, withRetry } = useErrorHandler()
  const { withLoading } = useLoading()
  const { showSuccess, showError } = useNotifications()

  /**
   * Execute Supabase operation with error handling and loading states
   */
  const executeOperation = async <T>(
    operation: () => Promise<T>,
    context: string,
    options: SupabaseOperationOptions = {}
  ): Promise<T> => {
    const {
      showLoading = true,
      loadingMessage,
      retryable = true,
      maxRetries = 3,
      showNotifications = true
    } = options

    const wrappedOperation = async () => {
      if (retryable) {
        return await withRetry({
          operation,
          maxRetries,
          onRetry: (attempt, error) => {
            console.log(`Retrying ${context} (attempt ${attempt}):`, error)
          }
        })
      } else {
        return await operation()
      }
    }

    try {
      if (showLoading) {
        return await withLoading(wrappedOperation, { message: loadingMessage })
      } else {
        return await wrappedOperation()
      }
    } catch (error) {
      const formattedError = handleError(error, context, {
        showNotification: showNotifications,
        retryable
      })
      throw formattedError
    }
  }

  // Contact Operations
  const contactOperations = {
    /**
     * Fetch contacts based on user role
     */
    async fetchContacts(userId?: string): Promise<Contact[]> {
      return executeOperation(
        async () => {
          // Try to use the view first, fallback to regular contacts table
          let query = supabase
            .from('contacts_with_user_info')
            .select('*')
            .order('created_at', { ascending: false })

          // Apply user-based filtering for members
          if (userId) {
            query = query.eq('added_by', userId)
          }

          let { data, error } = await query

          // If the view doesn't exist, fallback to regular contacts table
          if (error && (error.message?.includes('does not exist') || error.message?.includes('relation') || error.code === '42P01')) {
            console.warn('contacts_with_user_info view not found, falling back to contacts table:', error.message)
            
            let fallbackQuery = supabase
              .from('contacts')
              .select(`
                *,
                contact_meta (
                  id,
                  source_description,
                  created_at
                )
              `)
              .order('created_at', { ascending: false })

            if (userId) {
              fallbackQuery = fallbackQuery.eq('added_by', userId)
            }

            const fallbackResult = await fallbackQuery
            data = fallbackResult.data
            error = fallbackResult.error
            
            console.log('Fallback query result:', { data: data?.length, error: error?.message })
          }

          if (error) throw error
          return data || []
        },
        'Fetch Contacts',
        { loadingMessage: 'Loading contacts...' }
      )
    },

    /**
     * Add new contact
     */
    async addContact(contactData: ContactInput): Promise<Contact> {
      return executeOperation(
        async () => {
          const user = await supabase.auth.getUser()
          if (!user.data.user) {
            throw new Error('User not authenticated')
          }

          // Insert contact
          const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .insert({
              name: contactData.name,
              email: contactData.email,
              phone_number: contactData.phone_number,
              business_sector: contactData.business_sector,
              business_name: contactData.business_name,
              business_details: contactData.business_details,
              contact_type: contactData.contact_type,
              added_by: user.data.user.id
            })
            .select()
            .single()

          if (contactError) throw contactError

          // Insert contact meta
          const { error: metaError } = await supabase
            .from('contact_meta')
            .insert({
              contact_id: contact.id,
              source_description: contactData.source_description
            })

          if (metaError) throw metaError

          return contact
        },
        'Add Contact',
        { 
          loadingMessage: 'Adding contact...',
          showNotifications: true
        }
      ).then(result => {
        showSuccess('Contact Added', 'Contact has been successfully added to the database.')
        return result
      })
    },

    /**
     * Update existing contact
     */
    async updateContact(id: string, updates: Partial<ContactInput>): Promise<Contact> {
      return executeOperation(
        async () => {
          // Update contact
          const { data: contact, error: contactError } = await supabase
            .from('contacts')
            .update({
              name: updates.name,
              email: updates.email,
              phone_number: updates.phone_number,
              business_sector: updates.business_sector,
              business_name: updates.business_name,
              business_details: updates.business_details,
              contact_type: updates.contact_type
            })
            .eq('id', id)
            .select()
            .single()

          if (contactError) throw contactError

          // Update contact meta if source_description is provided
          if (updates.source_description) {
            const { error: metaError } = await supabase
              .from('contact_meta')
              .update({
                source_description: updates.source_description
              })
              .eq('contact_id', id)

            if (metaError) throw metaError
          }

          return contact
        },
        'Update Contact',
        { 
          loadingMessage: 'Updating contact...',
          showNotifications: true
        }
      ).then(result => {
        showSuccess('Contact Updated', 'Contact has been successfully updated.')
        return result
      })
    },

    /**
     * Delete contact
     */
    async deleteContact(id: string): Promise<void> {
      return executeOperation(
        async () => {
          const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id)

          if (error) throw error
        },
        'Delete Contact',
        { 
          loadingMessage: 'Deleting contact...',
          showNotifications: true
        }
      ).then(() => {
        showSuccess('Contact Deleted', 'Contact has been successfully removed.')
      })
    },

    /**
     * Get single contact by ID
     */
    async getContact(id: string): Promise<Contact> {
      return executeOperation(
        async () => {
          const { data, error } = await supabase
            .from('contacts')
            .select(`
              *,
              contact_meta (
                id,
                source_description,
                created_at
              )
            `)
            .eq('id', id)
            .single()

          if (error) throw error
          return data
        },
        'Get Contact',
        { loadingMessage: 'Loading contact details...' }
      )
    }
  }

  // User Operations
  const userOperations = {
    /**
     * Fetch all users (VP only)
     */
    async fetchUsers(): Promise<User[]> {
      return executeOperation(
        async () => {
          const { data, error } = await supabase.functions.invoke('get-users')
          
          if (error) throw error
          return data?.users || []
        },
        'Fetch Users',
        { loadingMessage: 'Loading users...' }
      )
    },

    /**
     * Update user role and approval status
     */
    async updateUserRole(request: UpdateUserRoleRequest): Promise<void> {
      return executeOperation(
        async () => {
          const { data, error } = await $fetch('/api/update-user-role', {
            method: 'POST',
            body: request
          })

          if (error || !data?.success) {
            throw new Error(data?.error || 'Failed to update user role')
          }
        },
        'Update User Role',
        { 
          loadingMessage: 'Updating user...',
          showNotifications: true
        }
      ).then(() => {
        showSuccess('User Updated', 'User role and permissions have been updated.')
      })
    }
  }

  // Authentication Operations
  const authOperations = {
    /**
     * Sign up new user
     */
    async signUp(email: string, password: string): Promise<any> {
      return executeOperation(
        async () => {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: 'member',
                is_approved: false
              }
            }
          })

          if (error) throw error
          return data
        },
        'Sign Up',
        { 
          loadingMessage: 'Creating account...',
          retryable: false,
          showNotifications: true
        }
      ).then(result => {
        if (result.user && !result.session) {
          showSuccess(
            'Account Created',
            'Please check your email and click the confirmation link to activate your account.'
          )
        }
        return result
      })
    },

    /**
     * Sign in user
     */
    async signIn(email: string, password: string): Promise<any> {
      return executeOperation(
        async () => {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          })

          if (error) throw error
          return data
        },
        'Sign In',
        { 
          loadingMessage: 'Signing in...',
          retryable: false,
          showNotifications: true
        }
      ).then(result => {
        showSuccess('Welcome Back', 'You have been successfully signed in.')
        return result
      })
    },

    /**
     * Sign out user
     */
    async signOut(): Promise<void> {
      return executeOperation(
        async () => {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
        },
        'Sign Out',
        { 
          loadingMessage: 'Signing out...',
          retryable: false,
          showNotifications: false
        }
      )
    },

    /**
     * Get current user
     */
    async getCurrentUser(): Promise<any> {
      return executeOperation(
        async () => {
          const { data, error } = await supabase.auth.getUser()
          if (error) throw error
          return data.user
        },
        'Get Current User',
        { 
          showLoading: false,
          showNotifications: false
        }
      )
    }
  }

  return {
    executeOperation,
    contacts: contactOperations,
    users: userOperations,
    auth: authOperations
  }
}