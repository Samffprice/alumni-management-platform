<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-maroon-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-xl">AE</span>
          </div>
        </div>
        <h1 class="mt-6 text-3xl font-bold text-gray-900">
          Aggie Entrepreneurs
        </h1>
        <p class="mt-2 text-sm text-gray-600">
          Alumni Management Platform
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>

      <!-- Welcome Message for Unauthenticated Users -->
      <div v-else-if="!isAuthenticated" class="text-center space-y-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Welcome to the Alumni Network
          </h2>
          <p class="text-gray-600 mb-6">
            Connect with fellow Aggie Entrepreneurs alumni, mentors, and build your professional network.
          </p>
          <div class="space-y-3">
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/signup"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Create Account
            </NuxtLink>
          </div>
        </div>
        
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">
                New to the platform?
              </h3>
              <p class="text-sm text-blue-700 mt-1">
                Create an account to start building your alumni network. Your account will need approval from an administrator before you can access all features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Reactive state
const loading = ref(true)
const isAuthenticated = ref(false)

// Check authentication and redirect
const checkAuthAndRedirect = async () => {
  try {
    loading.value = true
    
    // Check if user is authenticated
    const user = useSupabaseUser()
    
    if (user.value) {
      // User is authenticated, check if approved
      const isApproved = user.value.app_metadata?.is_approved || false
      
      if (isApproved) {
        // Redirect to dashboard
        await navigateTo('/dashboard')
        return
      } else {
        // Redirect to pending approval
        await navigateTo('/pending-approval')
        return
      }
    }
    
    // User is not authenticated, show welcome screen
    isAuthenticated.value = false
    
  } catch (error) {
    console.error('Error checking authentication:', error)
    isAuthenticated.value = false
  } finally {
    loading.value = false
  }
}

// Initialize on mount
onMounted(async () => {
  await checkAuthAndRedirect()
})

// SEO
useHead({
  title: 'Aggie Entrepreneurs Alumni Network',
  meta: [
    { name: 'description', content: 'Connect with fellow Aggie Entrepreneurs alumni and build your professional network.' },
    { name: 'keywords', content: 'Aggie Entrepreneurs, Alumni, Network, Texas A&M, Entrepreneurship' }
  ]
})
</script>

<style scoped>
/* Custom maroon color for Aggie theme */
.bg-maroon-600 {
  background-color: #722f37;
}
</style>