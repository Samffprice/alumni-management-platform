<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-aggie-50/30 flex items-center justify-center px-4">
    <div class="max-w-lg w-full space-y-8">
      <div class="text-center">
        <div class="flex justify-center mb-8">
          <div class="w-20 h-20 bg-gradient-to-br from-aggie-600 to-aggie-700 rounded-2xl flex items-center justify-center shadow-strong hover:shadow-medium transition-all duration-300 hover:scale-105 animate-fade-in">
            <span class="text-white font-bold text-3xl">AE</span>
          </div>
        </div>
        <h1 class="text-4xl font-bold text-gray-900 mb-3 animate-slide-up">
          Aggie Entrepreneurs
        </h1>
        <p class="text-lg text-gray-600 animate-slide-up" style="animation-delay: 0.1s">
          Alumni Management Platform
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center animate-fade-in">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-2xl mb-4">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-aggie-600 border-t-transparent"></div>
        </div>
        <p class="text-lg font-medium text-gray-700">Loading...</p>
        <p class="text-sm text-gray-500 mt-1">Checking your authentication status</p>
      </div>

      <!-- Welcome Message for Unauthenticated Users -->
      <div v-else-if="!isAuthenticated" class="text-center space-y-8 animate-slide-up" style="animation-delay: 0.2s">
        <div class="bg-white/95 backdrop-blur-sm shadow-strong rounded-2xl p-8 border border-gray-100/60">
          <div class="mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
              Welcome to the Alumni Network
            </h2>
            <p class="text-gray-600 leading-relaxed">
              Connect with fellow Aggie Entrepreneurs alumni, mentors, and build your professional network.
            </p>
          </div>
          <div class="space-y-4">
            <NuxtLink
              to="/login"
              class="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-xl shadow-soft text-base font-semibold text-white bg-gradient-to-r from-aggie-600 to-aggie-700 hover:from-aggie-700 hover:to-aggie-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 transition-all duration-200 hover:shadow-medium group"
            >
              <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In
            </NuxtLink>
            <NuxtLink
              to="/signup"
              class="w-full flex justify-center items-center py-3 px-6 border border-gray-200 rounded-xl shadow-soft text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 transition-all duration-200 hover:shadow-medium group"
            >
              <svg class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create Account
            </NuxtLink>
          </div>
        </div>
        
        <div class="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/60 rounded-xl p-6 hover:shadow-soft transition-all duration-300">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <h3 class="text-base font-bold text-blue-900 mb-2">
                New to the platform?
              </h3>
              <p class="text-sm text-blue-800 leading-relaxed">
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
/* Enhanced animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.8s ease-out;
  animation-fill-mode: both;
}

/* Backdrop blur support */
@supports (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(12px);
  }
}

/* Hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}
</style>