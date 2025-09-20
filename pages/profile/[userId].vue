<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Back Button -->
      <div class="mb-8">
        <button
          @click="$router.back()"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-aggie-700 bg-white hover:bg-aggie-50 border border-gray-200 hover:border-aggie-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Users
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white shadow rounded-lg p-6">
        <LoadingSkeleton type="profile" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white shadow rounded-lg p-6">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Error Loading Profile</h3>
          <p class="mt-1 text-sm text-gray-500">{{ error }}</p>
          <div class="mt-6">
            <button
              @click="fetchProfile"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="profile" class="bg-white shadow-soft rounded-2xl border border-gray-100/60 overflow-hidden animate-slide-up">
        <!-- Profile Header -->
        <div class="px-4 sm:px-8 py-6 sm:py-10 bg-gradient-to-r from-aggie-50/50 to-white border-b border-gray-100/60">
          <div class="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div class="flex-shrink-0 self-center sm:self-auto">
              <div class="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-aggie-100 to-aggie-200 flex items-center justify-center shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-105">
                <span class="text-2xl sm:text-3xl font-bold text-aggie-700">
                  {{ getInitials(profile.full_name) }}
                </span>
              </div>
            </div>
            <div class="flex-1 min-w-0 text-center sm:text-left">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{{ profile.full_name }}</h1>
              <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
                <div class="flex items-center justify-center sm:justify-start space-x-2">
                  <div class="w-3 h-3 bg-aggie-500 rounded-full"></div>
                  <span class="text-sm sm:text-base font-semibold text-aggie-700">{{ profile.user_position || 'Member' }}</span>
                </div>
                <div class="hidden sm:block text-gray-300">•</div>
                <div class="flex items-center justify-center sm:justify-start space-x-2">
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                  </svg>
                  <span class="text-xs sm:text-sm text-gray-600">
                    Member since {{ formatDate(profile.account_created) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center justify-center sm:justify-start space-x-2">
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-green-600">Active Member</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Details -->
        <div class="px-4 sm:px-8 py-6 sm:py-8">
          <h2 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center justify-center sm:justify-start">
            <svg class="w-5 h-5 mr-2 text-aggie-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Contact Information
          </h2>
          <dl class="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <div class="bg-gray-50/50 rounded-xl p-5 hover:bg-gray-50 transition-colors duration-200">
              <dt class="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email Address
              </dt>
              <dd class="text-base text-gray-900">
                <a :href="`mailto:${profile.email}`" class="text-aggie-600 hover:text-aggie-700 font-medium transition-colors duration-200 hover:underline">
                  {{ profile.email }}
                </a>
              </dd>
            </div>

            <div v-if="profile.phone_number" class="bg-gray-50/50 rounded-xl p-5 hover:bg-gray-50 transition-colors duration-200">
              <dt class="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone Number
              </dt>
              <dd class="text-base text-gray-900">
                <a :href="`tel:${profile.phone_number}`" class="text-aggie-600 hover:text-aggie-700 font-medium transition-colors duration-200 hover:underline">
                  {{ profile.phone_number }}
                </a>
              </dd>
            </div>

            <div class="bg-gray-50/50 rounded-xl p-5 hover:bg-gray-50 transition-colors duration-200">
              <dt class="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                Position
              </dt>
              <dd class="text-base font-semibold text-gray-900">{{ profile.user_position || 'Member' }}</dd>
            </div>

            <div class="bg-gray-50/50 rounded-xl p-5 hover:bg-gray-50 transition-colors duration-200">
              <dt class="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8a1 1 0 011-1h3z" />
                </svg>
                Account Created
              </dt>
              <dd class="text-base text-gray-900">{{ formatDate(profile.account_created) }}</dd>
            </div>

            <div class="bg-gray-50/50 rounded-xl p-5 hover:bg-gray-50 transition-colors duration-200">
              <dt class="text-sm font-bold text-gray-700 mb-2 flex items-center">
                <svg class="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Profile Updated
              </dt>
              <dd class="text-base text-gray-900">{{ formatDate(profile.profile_updated) }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Not Found State -->
      <div v-else class="bg-white shadow rounded-lg p-6">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Profile Not Found</h3>
          <p class="mt-1 text-sm text-gray-500">The requested user profile could not be found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useLoading } from '~/composables/useLoading'
import LoadingSkeleton from '~/components/LoadingSkeleton.vue'

// Define page meta
definePageMeta({
  middleware: ['officer-or-vp-only']
})

// Composables
const route = useRoute()
const { handleError } = useErrorHandler()
const { isLoading, withLoading } = useLoading('profile-page')
const supabase = useSupabaseClient()

// Reactive state
const profile = ref<UserProfile | null>(null)
const error = ref<string | null>(null)

// Get user ID from route
const userId = computed(() => route.params.userId as string)

// Fetch profile data
const fetchProfile = async () => {
  try {
    error.value = null
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    const response = await $fetch(`/api/user-profile/${userId.value}`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    })

    if (response.error) {
      throw new Error(response.error)
    }

    profile.value = response.profile
  } catch (err: any) {
    console.error('Error fetching profile:', err)
    error.value = err.message || 'Failed to load profile'
    handleError(err, 'Fetch Profile', { 
      showNotification: true,
      retryable: true 
    })
  }
}

// Utility functions
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('')
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(async () => {
  await withLoading(fetchProfile, { 
    message: 'Loading profile...' 
  })
})

// SEO
useHead({
  title: computed(() => profile.value ? `${profile.value.full_name} - Profile` : 'User Profile'),
  meta: [
    { name: 'description', content: 'View user profile information' }
  ]
})
</script>