<template>
  <div class="space-y-6">
    <div class="text-center mb-6 sm:mb-8">
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Welcome back
      </h2>
      <p class="text-sm sm:text-base text-gray-600">
        Sign in to access the Alumni Network
      </p>
    </div>
    
    <form class="space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full pl-10 pr-3 py-3 border rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-aggie-500 focus:border-aggie-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                :class="getFieldClasses('email')"
                placeholder="Enter your email address"
                @blur="validateField('email')"
                @input="clearFieldError('email')"
              />
            </div>
            <div v-if="errors.email" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ errors.email }}
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                v-model="form.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full pl-10 pr-3 py-3 border rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-aggie-500 focus:border-aggie-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                :class="getFieldClasses('password')"
                placeholder="Enter your password"
                @blur="validateField('password')"
                @input="clearFieldError('password')"
              />
            </div>
            <div v-if="errors.password" class="mt-2 text-sm text-red-600 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ errors.password }}
            </div>
          </div>
        </div>

        <div v-if="generalError" class="rounded-xl bg-red-50 border border-red-200 p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-red-800">Sign in failed</p>
              <p class="text-sm text-red-700 mt-1">{{ generalError }}</p>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-aggie-600 to-aggie-700 hover:from-aggie-700 hover:to-aggie-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft hover:shadow-medium"
          >
            <span v-if="isSubmitting" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            </span>
            <span v-else class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-aggie-300 group-hover:text-aggie-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </span>
            {{ isSubmitting ? 'Signing in...' : 'Sign in to your account' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/signup" class="font-semibold text-aggie-600 hover:text-aggie-700 transition-colors duration-200">
              Create one here
            </NuxtLink>
          </p>
        </div>
      </form>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types'
import { useUserStore } from '~/store/user'


// Define layout
definePageMeta({
  layout: 'auth'
})

// Reactive form data
const form = reactive({
  email: '',
  password: ''
})

// Form state
const isSubmitting = ref(false)
const errors = reactive<Record<string, string>>({})
const generalError = ref('')

// Supabase client and user store
const supabase = useSupabaseClient()
const userStore = useUserStore()

// Validation rules
const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  return null
}

// Field validation
const validateField = (field: string) => {
  let error: string | null = null
  
  switch (field) {
    case 'email':
      error = validateEmail(form?.email || '')
      break
    case 'password':
      error = validatePassword(form?.password || '')
      break
  }
  
  if (error) {
    errors[field] = error
  } else {
    delete errors[field]
  }
}

// Clear field error
const clearFieldError = (field: string) => {
  if (errors[field]) {
    delete errors[field]
  }
  if (generalError.value) {
    generalError.value = ''
  }
}

// Get field CSS classes
const getFieldClasses = (field: string) => {
  if (errors[field]) {
    return 'border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
  }
  return 'border-gray-200 bg-white hover:border-gray-300 focus:ring-aggie-500 focus:border-aggie-500'
}

// Form validation
const isFormValid = computed(() => {
  return form?.email && 
         form?.password && 
         Object.keys(errors).length === 0
})

// Handle login
const handleLogin = async () => {
  // Clear previous errors
  generalError.value = ''
  
  // Validate all fields
  validateField('email')
  validateField('password')
  
  // Check if form is valid
  if (!isFormValid.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: form?.email || '',
      password: form?.password || ''
    })
    
    if (error) {
      console.error('Login error:', error)
      
      // Handle specific error cases
      if (error.message.includes('Invalid login credentials')) {
        generalError.value = 'Invalid email or password. Please check your credentials and try again.'
      } else if (error.message.includes('Email not confirmed')) {
        generalError.value = 'Please confirm your email address before signing in. Check your inbox for a confirmation link.'
      } else if (error.message.includes('Too many requests')) {
        generalError.value = 'Too many login attempts. Please wait a moment before trying again.'
      } else {
        generalError.value = error.message || 'An error occurred during sign in. Please try again.'
      }
      return
    }
    
    if (data.user && data.session) {
      // Try to fetch full name from user_profiles table
      let fullName = data.user.app_metadata?.full_name
      
      if (!fullName) {
        try {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name')
            .eq('user_id', data.user.id)
            .single()
          
          if (profile?.full_name) {
            fullName = profile.full_name
          }
        } catch (profileError) {
          // Profile fetch failed, continue without full name
          console.warn('Could not fetch user profile during login:', profileError)
        }
      }

      // Update Pinia store with user data
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        app_metadata: {
          role: data.user.app_metadata?.role || 'member',
          is_approved: data.user.app_metadata?.is_approved || false,
          full_name: fullName
        }
      }
      
      // Update user store
      userStore.updateUserState(user)
      
      // Clear form
      if (form) {
        form.email = ''
        form.password = ''
      }
      
      // Check if user is approved
      if (!user.app_metadata.is_approved) {
        // Redirect to pending approval page
        await navigateTo('/pending-approval')
      } else {
        // Use cookie redirect if available, otherwise go to dashboard
        const redirectInfo = useSupabaseCookieRedirect()
        const savedPath = redirectInfo.pluck()
        const redirectTo = savedPath || useRoute().query.redirect as string || '/dashboard'
        await navigateTo(redirectTo)
      }
    }
    
  } catch (error) {
    console.error('Unexpected error during login:', error)
    generalError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Check if user is already logged in
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // User is already logged in, redirect appropriately
    const userRole = user.app_metadata?.role || 'member'
    const isApproved = user.app_metadata?.is_approved || false
    
    if (!isApproved) {
      await navigateTo('/pending-approval')
    } else {
      await navigateTo('/dashboard')
    }
  }
})

// SEO
useHead({
  title: 'Sign In - Aggie Entrepreneurs Alumni',
  meta: [
    { name: 'description', content: 'Sign in to access the Aggie Entrepreneurs Alumni Network' }
  ]
})
</script>