<template>
  <div class="bg-white shadow-soft rounded-2xl border border-gray-100/60 overflow-hidden">
    <!-- Table Header -->
    <div class="px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-aggie-50/50 to-white border-b border-gray-100/60">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-xl flex items-center justify-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 text-aggie-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        <div>
          <h3 class="text-lg sm:text-xl font-bold text-gray-900">User Management</h3>
          <p class="text-xs sm:text-sm text-gray-600">
            Manage user roles and approval status
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="px-4 sm:px-8 py-8 sm:py-12 text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-2xl mb-4">
        <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-2 border-aggie-600 border-t-transparent"></div>
      </div>
      <p class="text-sm sm:text-base font-medium text-gray-700">Loading users...</p>
      <p class="text-xs sm:text-sm text-gray-500 mt-1">Please wait while we fetch the user data</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="px-4 sm:px-8 py-8 sm:py-12 text-center">
      <div class="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl mb-4">
        <svg class="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">Failed to load users</h3>
      <p class="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">{{ error }}</p>
      <button 
        @click="fetchUsers"
        class="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-aggie-600 to-aggie-700 hover:from-aggie-700 hover:to-aggie-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 transition-all duration-200 hover:shadow-medium"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Try Again
      </button>
    </div>



    <!-- Users Content - Both Desktop and Mobile -->
    <div v-else-if="users.length > 0">
      <!-- Desktop Table -->
      <div class="hidden lg:block overflow-hidden">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              <th scope="col" class="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>User</span>
                </div>
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Role</span>
                </div>
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Status</span>
                </div>
              </th>
              <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                  </svg>
                  <span>Joined</span>
                </div>
              </th>
              <th scope="col" class="px-8 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gradient-to-r hover:from-gray-50 hover:to-aggie-50/20 transition-all duration-200 group">
              <!-- User Info -->
              <td class="px-8 py-6 whitespace-nowrap">
                <div class="flex items-center space-x-4">
                  <div class="flex-shrink-0">
                    <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-aggie-100 to-aggie-200 flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-200 group-hover:scale-105">
                      <span class="text-base font-bold text-aggie-700">
                        {{ getInitials(user.full_name || user.email) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <button
                      @click="viewUserProfile(user.id)"
                      class="text-left w-full hover:bg-aggie-50 rounded-lg p-2 -m-2 transition-all duration-200 group"
                    >
                      <div class="text-base font-bold text-gray-900 truncate group-hover:text-aggie-600 transition-colors duration-200">
                        {{ user.full_name || user.email }}
                      </div>
                      <div class="flex items-center space-x-2 mt-1">
                        <span class="text-xs text-gray-500">Email:</span>
                        <span class="text-xs text-gray-600 truncate">
                          {{ user.email }}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-6 whitespace-nowrap">
                <select
                  :value="user.role"
                  @change="updateUserRole(user.id, $event.target.value as UserRole)"
                  :disabled="updatingUsers.has(user.id)"
                  class="text-sm border-gray-200 rounded-lg focus:ring-aggie-500 focus:border-aggie-500 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white shadow-soft hover:shadow-medium transition-all duration-200 px-3 py-2 font-medium"
                >
                  <option value="member">Member</option>
                  <option value="officer">Officer</option>
                  <option value="vp">Vice President</option>
                </select>
              </td>

              <!-- Status -->
              <td class="px-6 py-6 whitespace-nowrap">
                <div class="flex items-center space-x-2">
                  <div 
                    :class="[
                      'w-2 h-2 rounded-full',
                      user.is_approved ? 'bg-green-400 animate-pulse' : 'bg-yellow-400 animate-pulse'
                    ]"
                  ></div>
                  <span 
                    :class="[
                      'inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full shadow-soft',
                      user.is_approved 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-200' 
                        : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-200'
                    ]"
                  >
                    {{ user.is_approved ? 'Approved' : 'Pending' }}
                  </span>
                </div>
              </td>

              <!-- Joined Date -->
              <td class="px-6 py-6 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ formatDate(user.created_at) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getRelativeTime(user.created_at) }}
                </div>
              </td>

              <!-- Actions -->
              <td class="px-8 py-6 whitespace-nowrap text-right">
                <div class="flex justify-end space-x-2">
                  <!-- Approval Actions -->
                  <button
                    v-if="!user.is_approved"
                    @click="approveUser(user.id)"
                    :disabled="updatingUsers.has(user.id)"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium"
                  >
                    <span v-if="updatingUsers.has(user.id)" class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></span>
                    <svg v-else class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {{ updatingUsers.has(user.id) ? 'Approving...' : 'Approve' }}
                  </button>
                  <button
                    v-else
                    @click="unapproveUser(user.id)"
                    :disabled="updatingUsers.has(user.id)"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium"
                  >
                    <span v-if="updatingUsers.has(user.id)" class="inline-block animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent mr-2"></span>
                    <svg v-else class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {{ updatingUsers.has(user.id) ? 'Unapproving...' : 'Unapprove' }}
                  </button>

                  <!-- Remove User Action -->
                  <button
                    @click="confirmRemoveUser(user)"
                    :disabled="updatingUsers.has(user.id)"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium"
                  >
                    <svg class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <!-- Mobile Cards -->
      <div class="lg:hidden space-y-4 p-4">
      <div 
        v-for="user in users" 
        :key="user.id" 
        class="bg-white border border-gray-200 rounded-xl p-4 shadow-soft hover:shadow-medium transition-all duration-200"
      >
        <!-- User Header -->
        <div class="flex items-center space-x-3 mb-4">
          <div class="flex-shrink-0">
            <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-aggie-100 to-aggie-200 flex items-center justify-center shadow-soft">
              <span class="text-base font-bold text-aggie-700">
                {{ getInitials(user.full_name || user.email) }}
              </span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <button
              @click="viewUserProfile(user.id)"
              class="text-left w-full hover:bg-aggie-50 rounded-lg p-2 -m-2 transition-all duration-200"
            >
              <div class="text-base font-bold text-gray-900 truncate hover:text-aggie-600 transition-colors duration-200">
                {{ user.full_name || user.email }}
              </div>
              <div class="text-sm text-gray-600 truncate">
                {{ user.email }}
              </div>
            </button>
          </div>
          <!-- Status Badge -->
          <div class="flex-shrink-0">
            <span 
              :class="[
                'inline-flex items-center px-2 py-1 text-xs font-bold rounded-full',
                user.is_approved 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              ]"
            >
              {{ user.is_approved ? 'Approved' : 'Pending' }}
            </span>
          </div>
        </div>

        <!-- User Details -->
        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span class="text-gray-500 font-medium">Role:</span>
            <div class="mt-1">
              <select
                :value="user.role"
                @change="updateUserRole(user.id, $event.target.value as UserRole)"
                :disabled="updatingUsers.has(user.id)"
                class="text-sm border-gray-200 rounded-lg focus:ring-aggie-500 focus:border-aggie-500 disabled:bg-gray-50 disabled:cursor-not-allowed bg-white shadow-soft w-full px-2 py-1"
              >
                <option value="member">Member</option>
                <option value="officer">Officer</option>
                <option value="vp">Vice President</option>
              </select>
            </div>
          </div>
          <div>
            <span class="text-gray-500 font-medium">Joined:</span>
            <div class="mt-1 text-gray-900">
              {{ formatDate(user.created_at) }}
            </div>
            <div class="text-xs text-gray-500">
              {{ getRelativeTime(user.created_at) }}
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-100">
          <!-- Approval Actions -->
          <button
            v-if="!user.is_approved"
            @click="approveUser(user.id)"
            :disabled="updatingUsers.has(user.id)"
            class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium min-h-[44px]"
          >
            <span v-if="updatingUsers.has(user.id)" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ updatingUsers.has(user.id) ? 'Approving...' : 'Approve' }}
          </button>
          <button
            v-else
            @click="unapproveUser(user.id)"
            :disabled="updatingUsers.has(user.id)"
            class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium min-h-[44px]"
          >
            <span v-if="updatingUsers.has(user.id)" class="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></span>
            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ updatingUsers.has(user.id) ? 'Unapproving...' : 'Unapprove' }}
          </button>

          <!-- Remove User Action -->
          <button
            @click="confirmRemoveUser(user)"
            :disabled="updatingUsers.has(user.id)"
            class="flex-1 inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium min-h-[44px]"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
            Remove
          </button>
        </div>
      </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="px-4 sm:px-8 py-12 sm:py-16 text-center">
      <div class="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4 sm:mb-6">
        <svg class="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      </div>
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 mb-2">No users found</h3>
      <p class="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto mb-4">
        Users will appear here once they register for the platform.
      </p>
      <div class="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 max-w-md mx-auto">
        <p class="font-medium mb-1">Possible reasons:</p>
        <ul class="text-left space-y-1">
          <li>• No users have registered yet</li>
          <li>• You may not have VP privileges</li>
          <li>• Your account may not be approved</li>
        </ul>
      </div>
      <button 
        @click="fetchUsers"
        class="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 transition-all duration-200"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Retry
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserManagement, UserRole, UpdateUserRoleRequest, UpdateUserRoleResponse } from '~/types'
import { useUserStore } from '~/store/user'

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
const router = useRouter()
const userStore = useUserStore()

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
  const confirmMessage = `⚠️ WARNING: This will permanently delete the user "${user.email}" and ALL contacts they have added to the system.

This action cannot be undone and will:
• Delete the user's account
• Delete all contacts they added
• Remove their profile information

Are you absolutely sure you want to proceed?`

  if (confirm(confirmMessage)) {
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

// Get relative time helper
const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays} days ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`
  return `${Math.floor(diffInDays / 365)} years ago`
}

// Get initials helper
const getInitials = (name: string): string => {
  if (!name) return '?'
  
  // If it's an email, use the first character
  if (name.includes('@')) {
    return name.charAt(0).toUpperCase()
  }
  
  // For full names, get first letter of each word (max 2)
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

// View user profile
const viewUserProfile = (userId: string) => {
  // Navigate to user profile page
  router.push(`/profile/${userId}`)
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