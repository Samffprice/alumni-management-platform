<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Mobile-Friendly Page Header -->
    <div class="bg-white/95 backdrop-blur-sm shadow-soft border-b border-gray-100/60">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-4 sm:py-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div class="flex-1 min-w-0">
              <!-- Simplified Breadcrumb - Hidden on mobile -->
              <nav class="hidden sm:flex mb-2" aria-label="Breadcrumb">
                <ol class="flex items-center space-x-4">
                  <li>
                    <div>
                      <NuxtLink to="/dashboard" class="text-gray-400 hover:text-gray-500">
                        <svg class="flex-shrink-0 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                        </svg>
                        <span class="sr-only">Home</span>
                      </NuxtLink>
                    </div>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <svg class="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-4 text-sm font-medium text-gray-500">Admin</span>
                    </div>
                  </li>
                  <li>
                    <div class="flex items-center">
                      <svg class="flex-shrink-0 h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                      </svg>
                      <span class="ml-4 text-sm font-medium text-gray-900" aria-current="page">Users</span>
                    </div>
                  </li>
                </ol>
              </nav>
              
              <div>
                <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold leading-7 text-gray-900 truncate">
                  User Management
                </h1>
                <p class="mt-1 text-xs sm:text-sm text-gray-500">
                  Manage user accounts, roles, and approval status
                </p>
              </div>
            </div>
            
            <!-- Refresh Button -->
            <div class="flex items-center justify-center sm:justify-end">
              <button
                @click="refreshUsers"
                :disabled="refreshing"
                class="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 rounded-xl shadow-soft text-sm font-semibold text-gray-700 bg-white hover:bg-aggie-50 hover:border-aggie-200 hover:text-aggie-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-medium"
              >
                <svg 
                  :class="['h-4 w-4 mr-2', refreshing ? 'animate-spin' : '']" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ refreshing ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Back Button -->
      <div class="mb-4 sm:mb-6">
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-aggie-700 bg-white hover:bg-aggie-50 border border-gray-200 hover:border-aggie-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>
      </div>
      <!-- VP Access Check -->
      <div v-if="!userStore.isVP" class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
        <div class="flex flex-col sm:flex-row sm:items-start">
          <div class="flex-shrink-0 self-center sm:self-start">
            <svg class="h-6 w-6 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="mt-3 sm:mt-0 sm:ml-3 text-center sm:text-left">
            <h3 class="text-sm sm:text-base font-medium text-red-800">
              Access Denied
            </h3>
            <div class="mt-2 text-sm text-red-700">
              <p>
                You need Vice President privileges to access user management. 
                Please contact an administrator if you believe this is an error.
              </p>
            </div>
            <div class="mt-4">
              <div class="flex justify-center sm:justify-start">
                <NuxtLink
                  to="/dashboard"
                  class="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-red-800 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600 transition-colors duration-200"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Return to Dashboard
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Management Table -->
      <div v-else>
        <UserManagementTable :refresh-trigger="refreshTrigger" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/store/user'

// Page metadata
definePageMeta({
  middleware: ['vp-only'],
  layout: 'default'
})

// Set page title
useHead({
  title: 'User Management - Aggie Entrepreneurs Alumni Platform'
})

// Composables
const userStore = useUserStore()

// Reactive state
const refreshing = ref(false)
const refreshTrigger = ref(0)

// Refresh users function
const refreshUsers = async () => {
  refreshing.value = true
  
  // Increment trigger to force UserManagementTable to refresh
  refreshTrigger.value++
  
  // Add a small delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500))
  
  refreshing.value = false
}

// Ensure auth state is synced
const { syncUserStore } = useAuth()
onMounted(async () => {
  await syncUserStore()
})
</script>