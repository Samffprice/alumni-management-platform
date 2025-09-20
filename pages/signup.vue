<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-sm text-gray-600">
        Join the Alumni Network
      </p>
    </div>
    
    <form class="space-y-6" @submit.prevent="handleSignup">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="fullName" class="sr-only">Full Name</label>
            <input
              id="fullName"
              v-model="form.fullName"
              name="fullName"
              type="text"
              autocomplete="name"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="getFieldClasses('fullName')"
              placeholder="Full Name"
              @blur="validateField('fullName')"
              @input="clearFieldError('fullName')"
            />
            <div v-if="errors.fullName" class="mt-1 text-sm text-red-600">
              {{ errors.fullName }}
            </div>
          </div>
          
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
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
            <label for="phoneNumber" class="sr-only">Phone Number</label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              name="phoneNumber"
              type="tel"
              autocomplete="tel"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="getFieldClasses('phoneNumber')"
              placeholder="Phone Number"
              @blur="validateField('phoneNumber')"
              @input="clearFieldError('phoneNumber')"
            />
            <div v-if="errors.phoneNumber" class="mt-1 text-sm text-red-600">
              {{ errors.phoneNumber }}
            </div>
          </div>
          
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="new-password"
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
            <div class="mt-1 text-xs text-gray-500">
              Password must contain at least 8 characters with uppercase, lowercase, number, and special character
            </div>
          </div>
          
          <div>
            <label for="confirmPassword" class="sr-only">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              name="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :class="getFieldClasses('confirmPassword')"
              placeholder="Confirm Password"
              @blur="validateField('confirmPassword')"
              @input="clearFieldError('confirmPassword')"
            />
            <div v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </div>
          </div>
        </div>

        <div v-if="generalError" class="rounded-md bg-red-50 p-4">
          <div class="text-sm text-red-700">
            {{ generalError }}
          </div>
        </div>

        <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
          <div class="text-sm text-green-700">
            {{ successMessage }}
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
            {{ isSubmitting ? 'Creating account...' : 'Sign up' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-gray-600">
            Already have an account?
            <NuxtLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </NuxtLink>
          </p>
        </div>
      </form>
  </div>
</template>

<script setup lang="ts">
import type { ValidationError } from '~/types'

// Define layout
definePageMeta({
  layout: 'auth'
})

// Reactive form data
const form = reactive({
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: ''
})

// Form state
const isSubmitting = ref(false)
const errors = reactive<Record<string, string>>({})
const generalError = ref('')
const successMessage = ref('')

// Supabase client
const supabase = useSupabaseClient()

// Validation rules
const validateFullName = (fullName: string): string | null => {
  if (!fullName) return 'Full name is required'
  if (fullName.trim().length < 2) return 'Full name must be at least 2 characters'
  if (fullName.length > 100) return 'Full name must be no more than 100 characters'
  return null
}

const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  if (email.length > 255) return 'Email must be no more than 255 characters'
  return null
}

const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return 'Phone number is required'
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
    return 'Please enter a valid phone number'
  }
  return null
}

const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters long'
  if (password.length > 128) return 'Password must be no more than 128 characters long'
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  if (!passwordRegex.test(password)) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  }
  return null
}

const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (!confirmPassword) return 'Please confirm your password'
  if (password !== confirmPassword) return 'Passwords do not match'
  return null
}

// Field validation
const validateField = (field: string) => {
  let error: string | null = null
  
  switch (field) {
    case 'fullName':
      error = validateFullName(form?.fullName || '')
      break
    case 'email':
      error = validateEmail(form?.email || '')
      break
    case 'phoneNumber':
      error = validatePhoneNumber(form?.phoneNumber || '')
      break
    case 'password':
      error = validatePassword(form?.password || '')
      break
    case 'confirmPassword':
      error = validateConfirmPassword(form?.password || '', form?.confirmPassword || '')
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
  return form?.fullName && 
         form?.email && 
         form?.phoneNumber &&
         form?.password && 
         form?.confirmPassword && 
         Object.keys(errors).length === 0
})

// Handle signup
const handleSignup = async () => {
  // Clear previous errors
  generalError.value = ''
  successMessage.value = ''
  
  // Validate all fields
  validateField('fullName')
  validateField('email')
  validateField('phoneNumber')
  validateField('password')
  validateField('confirmPassword')
  
  // Check if form is valid
  if (!isFormValid.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: form?.email || '',
      password: form?.password || '',
      options: {
        data: {
          role: 'member',
          is_approved: false,
          full_name: form?.fullName || '',
          phone_number: form?.phoneNumber || ''
        }
      }
    })
    
    if (error) {
      console.error('Signup error:', error)
      
      // Handle specific error cases
      if (error.message.includes('already registered')) {
        generalError.value = 'An account with this email already exists. Please try logging in instead.'
      } else if (error.message.includes('Invalid email')) {
        errors.email = 'Please enter a valid email address'
      } else if (error.message.includes('Password')) {
        errors.password = error.message
      } else {
        generalError.value = error.message || 'An error occurred during signup. Please try again.'
      }
      return
    }
    
    if (data.user) {
      // Create user profile after successful signup
      try {
        const { error: profileError } = await $fetch('/api/create-user-profile', {
          method: 'POST',
          body: {
            userId: data.user.id,
            fullName: form?.fullName || '',
            phoneNumber: form?.phoneNumber || '',
            userPosition: 'Member' // Default position based on role
          }
        })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't fail the signup for profile creation errors
        }
      } catch (profileError) {
        console.error('Profile creation failed:', profileError)
        // Don't fail the signup for profile creation errors
      }
      
      // Success - show confirmation message
      successMessage.value = 'Account created successfully! Please check your email to confirm your account, then wait for approval from a VP.'
      
      // Clear form
      if (form) {
        form.fullName = ''
        form.email = ''
        form.phoneNumber = ''
        form.password = ''
        form.confirmPassword = ''
      }
      
      // Redirect to email confirmation page after a delay
      setTimeout(() => {
        navigateTo('/confirm')
      }, 3000)
    }
    
  } catch (error) {
    console.error('Unexpected error during signup:', error)
    generalError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// SEO
useHead({
  title: 'Sign Up - Aggie Entrepreneurs Alumni',
  meta: [
    { name: 'description', content: 'Create an account to join the Aggie Entrepreneurs Alumni Network' }
  ]
})
</script>