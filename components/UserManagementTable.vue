<template>
  <div class="bg-white shadow-sm rounded-lg border border-gray-200">
    <!-- Table Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">User Management</h3>
      <p class="mt-1 text-sm text-gray-500">
        Manage user roles and approval status
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="px-6 py-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-500">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-6 py-8 text-center">
      <div class="text-red-600 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <p class="text-sm text-gray-900 font-medium">Failed to load users</p>
      <p class="text-sm text-gray-500">{{ error }}</p>
      <button 
        @click="fetchUsers"
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Try Again
      </button>
    </div>

    <!-- Users Table -->
    <div v-else-if="users.length > 0" class="overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
            <!-- User Info -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ user.email.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.email }}
                  </div>
                  <div class="text-sm text-gray-500">
                    ID: {{ user.id.substring(0, 8) }}...
                  </div>
                </div>
              </div>
            </td>

            <!-- Role -->
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                :value="user.role"
                @change="updateUserRole(user.id, $event.target.value as UserRole)"
                :disabled="updatingUsers.has(user.id)"
                class="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="member">Member</option>
                <option value="officer">Officer</option>
                <option value="vp">Vice President</option>
              </select>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  user.is_approved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ user.is_approved ? 'Approved' : 'Pending' }}
              </span>
            </td>

            <!-- Joined Date -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(user.created_at) }}
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex justify-end space-x-2">
                <!-- Approval Actions -->
                <button
                  v-if="!user.is_approved"
                  @click="approveUser(user.id)"
                  :disabled="updatingUsers.has(user.id)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <span v-if="updatingUsers.has(user.id)" class="inline-block animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></span>
                  {{ updatingUsers.has(user.id) ? 'Approving...' : 'Approve' }}
                </button>
                <button
                  v-else
                  @click="unapproveUser(user.id)"
                  :disabled="updatingUsers.has(user.id)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <span v-if="updatingUsers.has(user.id)" class="inline-block animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></span>
                  {{ updatingUsers.has(user.id) ? 'Unapproving...' : 'Unapprove' }}
                </button>

                <!-- Remove User Action -->
                <button
                  @click="confirmRemoveUser(user)"
                  :disabled="updatingUsers.has(user.id)"
                  class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Remove
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="px-6 py-8 text-center">
      <div class="text-gray-400 mb-2">
        <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      <p class="text-sm text-gray-900 font-medium">No users found</p>
      <p class="text-sm text-gray-500">Users will appear here once they register</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserManagement, UserRole, UpdateUserRoleRequest, UpdateUserRoleResponse } from '~/types'

// Props
interface Props {
  refreshTrigger?: number
}

const props = withDefaults(defineProps<Props>(), {
  refreshTrigger: 0
})

// Reactive state
const users = ref<UserManagement[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const updatingUsers = ref(new Set<string>())

// Composables
const supabase = useSupabaseClient()
const { addNotification } = useNotifications()
const { secureApiCall } = useSecureApi()

// Fetch users from server API
const fetchUsers = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await secureApiCall<{ users: UserManagement[] } | { error: string }>('/api/users')

    if ('error' in response) {
      throw new Error(response.error)
    }

    users.value = response.users.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = err instanceof Error ? err.message : 'Failed to fetch users'
    addNotification({
      type: 'error',
      message: 'Failed to load users. Please try again.'
    })
  } finally {
    loading.value = false
  }
}

// Update user role
const updateUserRole = async (userId: string, newRole: UserRole) => {
  if (updatingUsers.value.has(userId)) return
  
  updatingUsers.value.add(userId)
  
  try {
    const requestData: UpdateUserRoleRequest = {
      targetUserId: userId,
      newRole
    }

    const data = await secureApiCall<UpdateUserRoleResponse>('/api/update-user-role', {
      method: 'POST',
      body: requestData
    })

    if (!data.success) {
      throw new Error(data.error || 'Failed to update user role')
    }

    // Update local state
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole
    }

    addNotification({
      type: 'success',
      message: `User role updated to ${newRole}`
    })
  } catch (err) {
    console.error('Error updating user role:', err)
    addNotification({
      type: 'error',
      message: err instanceof Error ? err.message : 'Failed to update user role'
    })
    
    // Refresh to get current state
    await fetchUsers()
  } finally {
    updatingUsers.value.delete(userId)
  }
}

// Approve user
const approveUser = async (userId: string) => {
  if (updatingUsers.value.has(userId)) return
  
  updatingUsers.value.add(userId)
  
  try {
    const requestData: UpdateUserRoleRequest = {
      targetUserId: userId,
      isApproved: true
    }

    const data = await secureApiCall<UpdateUserRoleResponse>('/api/update-user-role', {
      method: 'POST',
      body: requestData
    })

    if (!data.success) {
      throw new Error(data.error || 'Failed to approve user')
    }

    // Update local state
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].is_approved = true
    }

    addNotification({
      type: 'success',
      message: 'User approved successfully'
    })
  } catch (err) {
    console.error('Error approving user:', err)
    addNotification({
      type: 'error',
      message: err instanceof Error ? err.message : 'Failed to approve user'
    })
    
    // Refresh to get current state
    await fetchUsers()
  } finally {
    updatingUsers.value.delete(userId)
  }
}

// Unapprove user
const unapproveUser = async (userId: string) => {
  if (updatingUsers.value.has(userId)) return
  
  updatingUsers.value.add(userId)
  
  try {
    const requestData: UpdateUserRoleRequest = {
      targetUserId: userId,
      isApproved: false
    }

    const data = await secureApiCall<UpdateUserRoleResponse>('/api/update-user-role', {
      method: 'POST',
      body: requestData
    })

    if (!data.success) {
      throw new Error(data.error || 'Failed to unapprove user')
    }

    // Update local state
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value[userIndex].is_approved = false
    }

    addNotification({
      type: 'success',
      message: 'User unapproved successfully'
    })
  } catch (err) {
    console.error('Error unapproving user:', err)
    addNotification({
      type: 'error',
      message: err instanceof Error ? err.message : 'Failed to unapprove user'
    })
    
    // Refresh to get current state
    await fetchUsers()
  } finally {
    updatingUsers.value.delete(userId)
  }
}

// Confirm and remove user
const confirmRemoveUser = (user: UserManagement) => {
  if (confirm(`Are you sure you want to permanently remove ${user.email}? This action cannot be undone.`)) {
    removeUser(user.id)
  }
}

// Remove user (delete from Supabase Auth)
const removeUser = async (userId: string) => {
  if (updatingUsers.value.has(userId)) return
  
  updatingUsers.value.add(userId)
  
  try {
    const data = await secureApiCall<{ success: boolean; error?: string }>('/api/delete-user', {
      method: 'POST',
      body: { targetUserId: userId }
    })

    if (!data.success) {
      throw new Error(data.error || 'Failed to remove user')
    }

    // Remove from local state
    const userIndex = users.value.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users.value.splice(userIndex, 1)
    }

    addNotification({
      type: 'success',
      message: 'User removed successfully'
    })
  } catch (err) {
    console.error('Error removing user:', err)
    addNotification({
      type: 'error',
      message: err instanceof Error ? err.message : 'Failed to remove user'
    })
    
    // Refresh to get current state
    await fetchUsers()
  } finally {
    updatingUsers.value.delete(userId)
  }
}

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Watch for refresh trigger changes
watch(() => props.refreshTrigger, () => {
  fetchUsers()
})

// Initial load
onMounted(() => {
  fetchUsers()
})
</script>