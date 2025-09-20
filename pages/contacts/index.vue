<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Button -->
      <div class="mb-6">
        <NuxtLink
          to="/dashboard"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-aggie-700 bg-white hover:bg-aggie-50 border border-gray-200 hover:border-aggie-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </NuxtLink>
      </div>

      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Contacts</h1>
            <p class="mt-2 text-sm sm:text-base text-gray-600">
              Manage your alumni and mentor network
            </p>
          </div>
          
          <!-- Add New Contact Button -->
          <div v-if="userStore.isApproved" class="flex-shrink-0">
            <NuxtLink
              to="/contacts/add"
              class="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-3 border border-transparent text-sm font-semibold rounded-xl shadow-soft text-white bg-gradient-to-r from-aggie-600 to-aggie-700 hover:from-aggie-700 hover:to-aggie-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 transition-all duration-200 hover:shadow-medium group"
            >
              <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              <span class="hidden sm:inline">Add New Contact</span>
              <span class="sm:hidden">Add Contact</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Error Boundary for the entire contacts section -->
      <ErrorBoundary
        :retryable="true"
        :on-retry="fetchContacts"
        fallback-title="Failed to Load Contacts"
        fallback-message="There was an error loading your contacts. Please try again."
      >
        <!-- Loading State -->
        <div v-if="isLoading" class="py-12">
          <LoadingSkeleton type="table" :rows="5" :columns="8" />
        </div>

        <!-- Contacts Table -->
        <div v-else>
          <ContactTable
            :contacts="contacts"
            :user-role="userStore.role"
            :loading="isLoading"
            @view="handleViewContact"
            @edit="handleEditContact"
            @delete="handleDeleteContact"
            @view-profile="handleViewProfile"
          />
        </div>

        <!-- Empty State for New Users -->
        <div v-if="!isLoading && contacts.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No contacts yet</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ userStore.role === 'member' 
              ? 'Get started by adding your first contact.' 
              : 'No contacts have been added to the system yet.' 
            }}
          </p>
          <div v-if="userStore.isApproved" class="mt-6">
            <NuxtLink
              to="/contacts/add"
              class="inline-flex items-center px-6 py-3 border border-transparent shadow-soft text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-aggie-600 to-aggie-700 hover:from-aggie-700 hover:to-aggie-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-aggie-500 transition-all duration-200 hover:shadow-medium group"
            >
              <svg class="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add your first contact
            </NuxtLink>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Contact } from '~/types'
import { useUserStore } from '~/store/user'
import { useSupabaseOperations } from '~/composables/useSupabaseOperations'
import { useErrorHandler } from '~/composables/useErrorHandler'
import { useLoading } from '~/composables/useLoading'
import ErrorBoundary from '~/components/ErrorBoundary.vue'
import LoadingSkeleton from '~/components/LoadingSkeleton.vue'

// Define page meta
definePageMeta({
  // Global auth middleware handles authentication automatically
})

// Composables
const userStore = useUserStore()
const { contacts: contactOps } = useSupabaseOperations()
const { handleError } = useErrorHandler()
const { isLoading, withLoading } = useLoading('contacts-page')
const router = useRouter()

// Reactive state
const contacts = ref<Contact[]>([])
const error = ref<string | null>(null)

// Fetch contacts based on user role
const fetchContacts = async () => {
  try {
    error.value = null
    
    // Determine user ID for filtering if user is a member
    const userId = userStore.role === 'member' ? userStore.user?.id : undefined
    
    // Use the new Supabase operations wrapper
    const data = await contactOps.fetchContacts(userId)
    contacts.value = data

  } catch (err: any) {
    console.error('Error fetching contacts:', err)
    error.value = err.message || 'Failed to load contacts'
    handleError(err, 'Fetch Contacts', { 
      showNotification: true,
      retryable: true 
    })
  }
}

// Event handlers
const handleViewContact = (contact: Contact) => {
  router.push(`/contacts/${contact.id}`)
}

const handleEditContact = (contact: Contact) => {
  router.push(`/contacts/${contact.id}?edit=true`)
}

const handleDeleteContact = async (contact: Contact) => {
  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete ${contact.name}? This action cannot be undone.`)
  
  if (!confirmed) return

  try {
    await contactOps.deleteContact(contact.id)
    
    // Remove from local state
    contacts.value = contacts.value.filter(c => c.id !== contact.id)

  } catch (err: any) {
    console.error('Error deleting contact:', err)
    handleError(err, 'Delete Contact', { 
      showNotification: true,
      retryable: false 
    })
  }
}

const handleViewProfile = (userId: string) => {
  router.push(`/profile/${userId}`)
}

// Lifecycle
onMounted(async () => {
  // Ensure auth state is synced and refresh session to get latest approval status
  const { syncUserStore, refreshUserSession } = useAuth()
  
  // First try to refresh the session to get the latest user metadata
  await refreshUserSession()
  await syncUserStore()
  
  // Fetch contacts with loading state
  await withLoading(fetchContacts, { 
    message: 'Loading contacts...' 
  })
})
</script>