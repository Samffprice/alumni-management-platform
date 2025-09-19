<template>
  <div class="space-y-6">
    <div class="text-center">
        <!-- Loading state -->
        <div v-if="isLoading" class="space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 class="text-2xl font-bold text-gray-900">
            Confirming your email...
          </h2>
          <p class="text-gray-600">
            Please wait while we verify your email address.
          </p>
        </div>

        <!-- Success state -->
        <div v-else-if="confirmationStatus === 'success'" class="space-y-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">
            Email Confirmed!
          </h2>
          <p class="text-gray-600">
            Your email address has been successfully verified. Your account is now pending approval from a VP.
          </p>
          <div class="mt-6">
            <button
              @click="goToPendingApproval"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Continue to Approval Status
            </button>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="confirmationStatus === 'error'" class="space-y-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">
            Confirmation Failed
          </h2>
          <p class="text-gray-600">
            {{ errorMessage || 'There was an error confirming your email address. The link may be expired or invalid.' }}
          </p>
          <div class="mt-6 space-y-3">
            <button
              @click="resendConfirmation"
              :disabled="isResending"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isResending ? 'Sending...' : 'Resend Confirmation Email' }}
            </button>
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Sign In
            </NuxtLink>
          </div>
        </div>

        <!-- Default state (no confirmation attempt yet) -->
        <div v-else class="space-y-4">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900">
            Check Your Email
          </h2>
          <p class="text-gray-600">
            We've sent a confirmation link to your email address. Please click the link to verify your account.
          </p>
          <div class="mt-6">
            <NuxtLink
              to="/login"
              class="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Sign In
            </NuxtLink>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
// Define layout
definePageMeta({
  layout: 'auth'
})

// State
const isLoading = ref(false)
const isResending = ref(false)
const confirmationStatus = ref<'pending' | 'success' | 'error'>('pending')
const errorMessage = ref('')

// Supabase client
const supabase = useSupabaseClient()
const route = useRoute()

// Handle email confirmation using the official pattern
const user = useSupabaseUser()
const redirectInfo = useSupabaseCookieRedirect()

// Watch for user changes and handle redirect
watch(user, () => {
  if (user.value) {
    confirmationStatus.value = 'success'
    
    // Check if user is approved
    const isApproved = user.value.app_metadata?.is_approved || false
    
    if (isApproved) {
      // Get redirect path and clear it from the cookie
      const path = redirectInfo.pluck()
      // Redirect to the saved path, or fallback to dashboard
      return navigateTo(path || '/dashboard')
    } else {
      // User is confirmed but not approved, go to pending approval
      setTimeout(() => {
        navigateTo('/pending-approval')
      }, 2000) // Give user time to see success message
    }
  }
}, { immediate: true })

// Handle email confirmation
const handleEmailConfirmation = async () => {
  const { token_hash, type } = route.query
  
  if (!token_hash || type !== 'signup') {
    // No confirmation parameters, show default state
    return
  }
  
  isLoading.value = true
  
  try {
    // The Supabase module handles the confirmation automatically
    // We just need to wait for the user state to update
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token_hash as string,
      type: 'signup'
    })
    
    if (error) {
      console.error('Email confirmation error:', error)
      confirmationStatus.value = 'error'
      
      if (error.message.includes('expired')) {
        errorMessage.value = 'The confirmation link has expired. Please request a new one.'
      } else if (error.message.includes('invalid')) {
        errorMessage.value = 'The confirmation link is invalid. Please request a new one.'
      } else {
        errorMessage.value = error.message
      }
    }
  } catch (error) {
    console.error('Unexpected error during email confirmation:', error)
    confirmationStatus.value = 'error'
    errorMessage.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Resend confirmation email
const resendConfirmation = async () => {
  // We can't resend without the user's email, so redirect to signup
  await navigateTo('/signup')
}

// Go to pending approval page
const goToPendingApproval = async () => {
  await navigateTo('/pending-approval')
}

// Handle confirmation on mount
onMounted(() => {
  handleEmailConfirmation()
})

// SEO
useHead({
  title: 'Confirm Email - Aggie Entrepreneurs Alumni',
  meta: [
    { name: 'description', content: 'Confirm your email address to complete your account setup' }
  ]
})
</script>