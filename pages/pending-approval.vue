<template>
  <div class="space-y-6">
    <div class="text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100">
          <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          Account Pending Approval
        </h2>
        
        <div class="mt-4 space-y-4">
          <p class="text-gray-600">
            Your account has been created and your email has been confirmed. However, your account is currently pending approval from a Vice President.
          </p>
          
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-blue-800">
                  What happens next?
                </h3>
                <div class="mt-2 text-sm text-blue-700">
                  <ul class="list-disc list-inside space-y-1">
                    <li>A VP will review your account request</li>
                    <li>You'll receive an email notification once approved</li>
                    <li>After approval, you can access the alumni platform</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="userEmail" class="text-sm text-gray-500">
            Account: {{ userEmail }}
          </div>
        </div>
        
        <div class="mt-8 space-y-3">
          <button
            @click="checkApprovalStatus"
            :disabled="isChecking"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isChecking" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
            <span v-else>Check Approval Status</span>
          </button>
          
          <button
            @click="handleLogout"
            :disabled="isLoggingOut"
            class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoggingOut ? 'Signing out...' : 'Sign Out' }}
          </button>
        </div>
        
        <div v-if="statusMessage" class="mt-4">
          <div 
            class="rounded-md p-4"
            :class="statusMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
          >
            <div class="text-sm">
              {{ statusMessage.text }}
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/store/user'


// Define layout
definePageMeta({
  layout: 'auth'
})

// State
const isChecking = ref(false)
const isLoggingOut = ref(false)
const userEmail = ref('')
const statusMessage = ref<{ type: 'success' | 'error', text: string } | null>(null)

// Supabase client and user store
const supabase = useSupabaseClient()
const userStore = useUserStore()

// Check approval status
const checkApprovalStatus = async () => {
  isChecking.value = true
  statusMessage.value = null
  
  try {
    // Refresh user data from Supabase
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error checking user status:', error)
      statusMessage.value = {
        type: 'error',
        text: 'Unable to check approval status. Please try again.'
      }
      return
    }
    
    if (!user) {
      // User is not logged in, redirect to login
      await navigateTo('/login')
      return
    }
    
    const isApproved = user.app_metadata?.is_approved || false
    
    if (isApproved) {
      // User has been approved! Update store and redirect
      userStore.updateUserState({
        id: user.id,
        email: user.email || '',
        app_metadata: {
          role: user.app_metadata?.role || 'member',
          is_approved: true
        }
      })
      
      statusMessage.value = {
        type: 'success',
        text: 'Great news! Your account has been approved. Redirecting to dashboard...'
      }
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigateTo('/dashboard')
      }, 2000)
    } else {
      statusMessage.value = {
        type: 'error',
        text: 'Your account is still pending approval. Please check back later or contact a VP.'
      }
    }
    
  } catch (error) {
    console.error('Unexpected error checking approval status:', error)
    statusMessage.value = {
      type: 'error',
      text: 'An unexpected error occurred. Please try again.'
    }
  } finally {
    isChecking.value = false
  }
}

// Handle logout
const handleLogout = async () => {
  isLoggingOut.value = true
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      statusMessage.value = {
        type: 'error',
        text: 'Error signing out. Please try again.'
      }
      return
    }
    
    // Clear user store
    userStore.clearUser()
    
    // Redirect to login
    await navigateTo('/login')
    
  } catch (error) {
    console.error('Unexpected error during logout:', error)
    statusMessage.value = {
      type: 'error',
      text: 'An unexpected error occurred during sign out.'
    }
  } finally {
    isLoggingOut.value = false
  }
}

// Get current user info on mount
onMounted(async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      userEmail.value = user.email || ''
      
      // Check if user is actually approved (in case they navigated here directly)
      const isApproved = user.app_metadata?.is_approved || false
      if (isApproved) {
        // User is approved, redirect to dashboard
        await navigateTo('/dashboard')
      }
    } else {
      // No user found, redirect to login
      await navigateTo('/login')
    }
  } catch (error) {
    console.error('Error getting user on mount:', error)
    await navigateTo('/login')
  }
})

// SEO
useHead({
  title: 'Pending Approval - Aggie Entrepreneurs Alumni',
  meta: [
    { name: 'description', content: 'Your account is pending approval from a Vice President' }
  ]
})
</script>