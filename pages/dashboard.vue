<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Welcome back, {{ userStore.displayName }}!
          </h1>
          <p class="mt-1 text-sm text-gray-600">
            Role: {{ userStore.roleDisplayName }}
          </p>
        </div>
        <div class="flex-shrink-0">
          <div class="w-16 h-16 bg-maroon-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-xl">
              {{ userInitials }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <ErrorBoundary
      :retryable="true"
      :on-retry="fetchDashboardStats"
      fallback-title="Stats Loading Error"
      fallback-message="Unable to load dashboard statistics. Please try again."
    >
      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LoadingSkeleton type="card" v-for="i in 3" :key="i" />
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">
                {{ userStore.role === 'member' ? 'My Contacts' : 'Total Contacts' }}
              </p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.totalContacts }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">
                {{ userStore.role === 'member' ? 'Added This Month' : 'Recent Additions' }}
              </p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.recentContacts }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Alumni</p>
              <p class="text-2xl font-semibold text-gray-900">
                {{ stats.alumniCount }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>

    <!-- Role-based Feature Highlights -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Your Access Level</h2>
      <div class="space-y-3">
        <div v-if="userStore.role === 'member'" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-blue-800">Member Access</h3>
              <p class="text-sm text-blue-700 mt-1">
                You can add new contacts and view contacts you've added. Contact an officer or VP to request additional permissions.
              </p>
            </div>
          </div>
        </div>

        <div v-if="userStore.role === 'officer'" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-green-800">Officer Access</h3>
              <p class="text-sm text-green-700 mt-1">
                You can view and edit all contacts in the system. You have full access to the alumni directory for organizational purposes.
              </p>
            </div>
          </div>
        </div>

        <div v-if="userStore.role === 'vp'" class="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <svg class="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-purple-800">VP Access</h3>
              <p class="text-sm text-purple-700 mt-1">
                You have full administrative access including contact management, user approval, and role assignments. You can delete contacts and manage all users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          to="/contacts"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">View Contacts</p>
            <p class="text-xs text-gray-500">
              {{ userStore.role === 'member' ? 'Browse your contacts' : 'Browse the alumni directory' }}
            </p>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/contacts/add"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">Add Contact</p>
            <p class="text-xs text-gray-500">Add a new alumni or mentor</p>
          </div>
        </NuxtLink>

        <NuxtLink
          v-if="userStore.isVP"
          to="/admin/users"
          class="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-900">Admin Panel</p>
            <p class="text-xs text-gray-500">Manage users and permissions</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Contact } from '~/types'
import { useUserStore } from '~/store/user'
import { useSupabaseOperations } from '~/composables/useSupabaseOperations'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useLoading } from '~/composables/useLoading'
import ErrorBoundary from '~/components/ErrorBoundary.vue'
import LoadingSkeleton from '~/components/LoadingSkeleton.vue'

// Define page meta
definePageMeta({
  // Global auth middleware handles authentication
})

// Composables
const userStore = useUserStore()
const supabase = useSupabaseClient()
const { handleError } = useErrorHandler()
const { isLoading, withLoading } = useLoading('dashboard-stats')

// Reactive state
const stats = ref({
  totalContacts: 0,
  recentContacts: 0,
  alumniCount: 0
})

// Computed
const userInitials = computed(() => {
  const email = userStore.displayName
  if (email && email.includes('@')) {
    return email.charAt(0).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
})

// Functions
const fetchDashboardStats = async () => {
  try {
    // Get current date for recent contacts calculation
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString()

    if (userStore.role === 'member') {
      // For members: only show their own contacts
      const userId = userStore.user?.id
      if (!userId) return

      // Total contacts added by this member
      const { count: totalCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('added_by', userId)

      // Recent contacts added by this member (last 30 days)
      const { count: recentCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('added_by', userId)
        .gte('created_at', thirtyDaysAgoISO)

      // Alumni contacts added by this member
      const { count: alumniCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('added_by', userId)
        .eq('contact_type', 'Alumni')

      stats.value = {
        totalContacts: totalCount || 0,
        recentContacts: recentCount || 0,
        alumniCount: alumniCount || 0
      }
    } else {
      // For officers and VPs: show all contacts
      
      // Total contacts in system
      const { count: totalCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })

      // Recent contacts added (last 30 days)
      const { count: recentCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO)

      // Total alumni contacts
      const { count: alumniCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })
        .eq('contact_type', 'Alumni')

      stats.value = {
        totalContacts: totalCount || 0,
        recentContacts: recentCount || 0,
        alumniCount: alumniCount || 0
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    handleError(error, 'Dashboard Stats', { 
      showNotification: false, // Don't show notification for stats errors
      retryable: true 
    })
    throw error // Re-throw for ErrorBoundary to catch
  }
}

// Lifecycle
onMounted(async () => {
  // Ensure auth state is synced
  const { syncUserStore, isApproved } = useAuth()
  syncUserStore()
  
  if (isApproved.value) {
    await withLoading(fetchDashboardStats, { 
      message: 'Loading dashboard statistics...' 
    })
  }
})

// SEO
useHead({
  title: 'Dashboard - Aggie Entrepreneurs Alumni',
  meta: [
    { name: 'description', content: 'Alumni Management Platform Dashboard' }
  ]
})
</script>

<style scoped>
/* Custom maroon color for Aggie theme */
.bg-maroon-600 {
  background-color: #722f37;
}
</style>