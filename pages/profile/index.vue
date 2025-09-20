<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
        <p class="mt-2 text-gray-600">Manage your profile information</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white shadow rounded-lg p-6">
        <LoadingSkeleton type="profile" />
      </div>

      <!-- Profile Form -->
      <div v-else class="bg-white shadow rounded-lg">
        <form @submit.prevent="handleUpdateProfile" class="px-6 py-6 space-y-6">
          <!-- Full Name -->
          <div>
            <label for="fullName" class="block text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              id="fullName"
              v-model="form.fullName"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.fullName }"
            />
            <p v-if="errors.fullName" class="mt-1 text-sm text-red-600">
              {{ errors.fullName }}
            </p>
          </div>

          <!-- Phone Number -->
          <div>
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              v-model="form.phoneNumber"
              type="tel"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-300': errors.phoneNumber }"
            />
            <p v-if="errors.phoneNumber" class="mt-1 text-sm text-red-600">
              {{ errors.phoneNumber }}
            </p>
          </div>

          <!-- Position (read-only, based on role) -->
          <div>
            <label for="position" class="block text-sm font-medium text-gray-700">
              Position
            </label>
            <input
              id="position"
              :value="userPosition"
              type="text"
              readonly
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              Position is automatically set based on your role
            </p>
          </div>

          <!-- Email (read-only) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              :value="user?.email"
              type="email"
              readonly
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
            />
            <p class="mt-1 text-sm text-gray-500">
              Contact a VP to change your email address
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="generalError" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">
              {{ generalError }}
            </div>
          </div>

          <!-- Success Message -->
          <div v-if="successMessage" class="rounded-md bg-green-50 p-4">
            <div class="text-sm text-green-700">
              {{ successMessage }}
            </div>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="isSubmitting || !isFormValid"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
              <span v-else>Update Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types'
import { useUserProfile } from '~/composables/useUserProfile'
import { useLoading } from '~/composables/useLoading'
import LoadingSkeleton from '~/components/LoadingSkeleton.vue'

// Define page meta
definePageMeta({
  // Global auth middleware handles authentication automatically
})

// Composables
const user = useSupabaseUser()
const { getCurrentUserProfile, updateUserProfile } = useUserProfile()
const { isLoading, withLoading } = useLoading('profile-page')

// Reactive state
const form = reactive({
  fullName: '',
  phoneNumber: ''
})

const errors = reactive<Record<string, string>>({})
const generalError = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)
const profile = ref<UserProfile | null>(null)

// Computed properties
const userPosition = computed(() => {
  const role = user.value?.app_metadata?.role || 'member'
  const roleNames = {
    member: 'Member',
    officer: 'Officer',
    vp: 'Vice President'
  }
  return roleNames[role as keyof typeof roleNames] || 'Member'
})

const isFormValid = computed(() => {
  return form.fullName.trim().length >= 2 && Object.keys(errors).length === 0
})

// Validation functions
const validateFullName = (fullName: string): string | null => {
  if (!fullName || fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters'
  }
  if (fullName.length > 100) {
    return 'Full name must be no more than 100 characters'
  }
  return null
}

const validatePhoneNumber = (phoneNumber: string): string | null => {
  if (!phoneNumber) return null // Phone is optional
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phoneNumber.replace(/[\s\-\(\)]/g, ''))) {
    return 'Please enter a valid phone number'
  }
  return null
}

// Load profile data
const loadProfile = async () => {
  try {
    const profileData = await getCurrentUserProfile()
    if (profileData) {
      profile.value = profileData
      form.fullName = profileData.full_name
      form.phoneNumber = profileData.phone_number || ''
    }
  } catch (error) {
    console.error('Error loading profile:', error)
    generalError.value = 'Failed to load profile data'
  }
}

// Handle form submission
const handleUpdateProfile = async () => {
  // Clear previous messages
  generalError.value = ''
  successMessage.value = ''
  
  // Validate form
  errors.fullName = validateFullName(form.fullName) || ''
  errors.phoneNumber = validatePhoneNumber(form.phoneNumber) || ''
  
  // Remove empty errors
  Object.keys(errors).forEach(key => {
    if (!errors[key]) delete errors[key]
  })
  
  if (!isFormValid.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const success = await updateUserProfile(
      form.fullName,
      form.phoneNumber || undefined,
      userPosition.value
    )
    
    if (success) {
      successMessage.value = 'Profile updated successfully!'
      // Reload profile data
      await loadProfile()
    } else {
      generalError.value = 'Failed to update profile. Please try again.'
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    generalError.value = 'An unexpected error occurred. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await withLoading(loadProfile, { 
    message: 'Loading profile...' 
  })
})

// SEO
useHead({
  title: 'My Profile - Aggie Entrepreneurs Alumni',
  meta: [
    { name: 'description', content: 'Manage your profile information' }
  ]
})
</script>