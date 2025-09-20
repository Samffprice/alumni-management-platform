<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <div class="mb-6">
        <button
          @click="$router.back()"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
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
      <div v-else-if="profile" class="bg-white shadow rounded-lg">
        <!-- Profile Header -->
        <div class="px-6 py-8 border-b border-gray-200">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <span class="text-2xl font-medium text-blue-600">
                  {{ getInitials(profile.full_name) }}
                </span>
              </div>
            </div>
            <div class="ml-6">
              <h1 class="text-2xl font-bold text-gray-900">{{ profile.full_name }}</h1>
              <p class="text-sm text-gray-600">{{ profile.user_position || 'Member' }}</p>
              <p class="text-sm text-gray-500">
                Member since {{ formatDate(profile.account_created) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Profile Details -->
        <div class="px-6 py-6">
          <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt class="text-sm font-medium text-gray-500">Email Address</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <a :href="`mailto:${profile.email}`" class="text-blue-600 hover:text-blue-500">
                  {{ profile.email }}
                </a>
              </dd>
            </div>

            <div v-if="profile.phone_number">
              <dt class="text-sm font-medium text-gray-500">Phone Number</dt>
              <dd class="mt-1 text-sm text-gray-900">
                <a :href="`tel:${profile.phone_number}`" class="text-blue-600 hover:text-blue-500">
                  {{ profile.phone_number }}
                </a>
              </dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Position</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ profile.user_position || 'Member' }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Account Created</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(profile.account_created) }}</dd>
            </div>

            <div>
              <dt class="text-sm font-medium text-gray-500">Profile Updated</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ formatDate(profile.profile_updated) }}</dd>
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