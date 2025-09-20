<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-white to-aggie-50/30 shadow-soft rounded-2xl p-8 border border-gray-100/60 animate-slide-up">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="flex items-center space-x-3 mb-2">
            <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span class="text-sm font-medium text-green-600">Online</span>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {{ userStore.displayName }}!
          </h1>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-aggie-500 rounded-full"></div>
              <p class="text-sm font-medium text-aggie-700">
                {{ userStore.roleDisplayName }}
              </p>
            </div>
            <div class="text-gray-300">•</div>
            <p class="text-sm text-gray-600">
              Last login: {{ new Date().toLocaleDateString() }}
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <button
            @click="handleLogout"
            class="group flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-700 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200"
          >
            <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
          <div class="w-20 h-20 bg-gradient-to-br from-aggie-500 to-aggie-600 rounded-2xl flex items-center justify-center shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-105">
            <span class="text-white font-bold text-2xl">
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
        <!-- Total Contacts Card -->
        <div class="group bg-white shadow-soft hover:shadow-medium rounded-2xl p-6 border border-gray-100/60 transition-all duration-300 hover:-translate-y-1 animate-slide-up" style="animation-delay: 0.1s">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              <p class="text-sm font-semibold text-gray-600 mb-1">
                {{ userStore.role === 'member' ? 'My Contacts' : 'Total Contacts' }}
              </p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats.totalContacts }}
              </p>
            </div>
            <div class="text-blue-500/20 group-hover:text-blue-500/30 transition-colors duration-300">
              <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Recent Contacts Card -->
        <div class="group bg-white shadow-soft hover:shadow-medium rounded-2xl p-6 border border-gray-100/60 transition-all duration-300 hover:-translate-y-1 animate-slide-up" style="animation-delay: 0.2s">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <p class="text-sm font-semibold text-gray-600 mb-1">
                {{ userStore.role === 'member' ? 'Added This Month' : 'Recent Additions' }}
              </p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats.recentContacts }}
              </p>
            </div>
            <div class="text-green-500/20 group-hover:text-green-500/30 transition-colors duration-300">
              <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Alumni Count Card -->
        <div class="group bg-white shadow-soft hover:shadow-medium rounded-2xl p-6 border border-gray-100/60 transition-all duration-300 hover:-translate-y-1 animate-slide-up" style="animation-delay: 0.3s">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-10 h-10 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-aggie-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div class="w-2 h-2 bg-aggie-400 rounded-full animate-pulse"></div>
              </div>
              <p class="text-sm font-semibold text-gray-600 mb-1">Alumni</p>
              <p class="text-3xl font-bold text-gray-900">
                {{ stats.alumniCount }}
              </p>
            </div>
            <div class="text-aggie-500/20 group-hover:text-aggie-500/30 transition-colors duration-300">
              <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>

    <!-- Role-based Feature Highlights -->
    <div class="bg-white shadow-soft rounded-2xl p-8 border border-gray-100/60 animate-slide-up" style="animation-delay: 0.4s">
      <div class="flex items-center space-x-3 mb-6">
        <div class="w-8 h-8 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-aggie-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5-4a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Your Access Level</h2>
      </div>
      <div class="space-y-4">
        <div v-if="userStore.role === 'member'" class="bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/60 rounded-xl p-5 hover:shadow-soft transition-all duration-300">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <h3 class="text-base font-bold text-blue-900">Member Access</h3>
                <span class="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-medium rounded-full">Current</span>
              </div>
              <p class="text-sm text-blue-800 leading-relaxed">
                You can add new contacts and view contacts you've added. Contact an officer or VP to request additional permissions.
              </p>
            </div>
          </div>
        </div>

        <div v-if="userStore.role === 'officer'" class="bg-gradient-to-r from-green-50 to-green-100/50 border border-green-200/60 rounded-xl p-5 hover:shadow-soft transition-all duration-300">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <h3 class="text-base font-bold text-green-900">Officer Access</h3>
                <span class="px-2 py-1 bg-green-200 text-green-800 text-xs font-medium rounded-full">Current</span>
              </div>
              <p class="text-sm text-green-800 leading-relaxed">
                You can view and edit all contacts in the system. You have full access to the alumni directory for organizational purposes.
              </p>
            </div>
          </div>
        </div>

        <div v-if="userStore.role === 'vp'" class="bg-gradient-to-r from-aggie-50 to-aggie-100/50 border border-aggie-200/60 rounded-xl p-5 hover:shadow-soft transition-all duration-300">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <div class="w-10 h-10 bg-aggie-100 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-aggie-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
            </div>
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <h3 class="text-base font-bold text-aggie-900">VP Access</h3>
                <span class="px-2 py-1 bg-aggie-200 text-aggie-800 text-xs font-medium rounded-full">Current</span>
              </div>
              <p class="text-sm text-aggie-800 leading-relaxed">
                You have full administrative access including contact management, user approval, and role assignments. You can delete contacts and manage all users.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white shadow-soft rounded-2xl p-8 border border-gray-100/60 animate-slide-up" style="animation-delay: 0.5s">
      <div class="flex items-center space-x-3 mb-6">
        <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-gray-900">Quick Actions</h2>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <NuxtLink
          to="/contacts"
          class="group flex items-center p-5 border border-gray-200/60 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100/50 hover:border-blue-200/60 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5"
        >
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-base font-semibold text-gray-900 group-hover:text-blue-900">View Contacts</p>
            <p class="text-sm text-gray-600 group-hover:text-blue-700">
              {{ userStore.role === 'member' ? 'Browse your contacts' : 'Browse the alumni directory' }}
            </p>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <NuxtLink
          to="/contacts/add"
          class="group flex items-center p-5 border border-gray-200/60 rounded-xl hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100/50 hover:border-green-200/60 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5"
        >
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-base font-semibold text-gray-900 group-hover:text-green-900">Add Contact</p>
            <p class="text-sm text-gray-600 group-hover:text-green-700">Add a new alumni or mentor</p>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </NuxtLink>

        <NuxtLink
          v-if="userStore.isVP"
          to="/admin/users"
          class="group flex items-center p-5 border border-gray-200/60 rounded-xl hover:bg-gradient-to-r hover:from-aggie-50 hover:to-aggie-100/50 hover:border-aggie-200/60 transition-all duration-300 hover:shadow-soft hover:-translate-y-0.5"
        >
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg class="w-6 h-6 text-aggie-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <div class="ml-4 flex-1">
            <p class="text-base font-semibold text-gray-900 group-hover:text-aggie-900">Admin Panel</p>
            <p class="text-sm text-gray-600 group-hover:text-aggie-700">Manage users and permissions</p>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <svg class="w-5 h-5 text-aggie-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
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
const router = useRouter()

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
const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    userStore.clearUser()
    await router.push('/login')
  } catch (error) {
    console.error('Error during logout:', error)
    handleError(error, 'Logout', { 
      showNotification: true,
      retryable: false 
    })
  }
}

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
  await syncUserStore()
  
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
/* Enhanced animations and transitions */
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
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
  animation-fill-mode: both;
}

/* Hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Custom pulse animation for status indicators */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>