<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Access the Alumni Network
      </p>
    </div>
    
    <form class="space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="getFieldClasses('email')"
              placeholder="Email address"
              @blur="validateField('email')"
              @input="clearFieldError('email')"
            />
            <div v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </div>
          </div>
          
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="getFieldClasses('password')"
              placeholder="Password"
              @blur="validateField('password')"
              @input="clearFieldError('password')"
            />
            <div v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </div>
          </div>
        </div>

        <div v-if="generalError" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {{ generalError }}
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting || !isFormValid"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-indigo-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isSubmitting ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Don't have an account?
            <NuxtLink to="/signup" class="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
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
    return 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
  }
  return 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
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
      // Update Pinia store with user data
      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        app_metadata: {
          role: data.user.app_metadata?.role || 'member',
          is_approved: data.user.app_metadata?.is_approved || false
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