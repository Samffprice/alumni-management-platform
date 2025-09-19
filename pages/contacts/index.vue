<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Contacts</h1>
            <p class="mt-2 text-gray-600">
              Manage your alumni and mentor network
            </p>
          </div>
          
          <!-- Add New Contact Button -->
          <div v-if="userStore.isApproved">
            <NuxtLink
              to="/contacts/add"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Contact
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
          <LoadingSkeleton type="table" :rows="5" :columns="7" />
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
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  // Global auth middleware handles authentication
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

// Lifecycle
onMounted(async () => {
  // Ensure auth state is synced
  const { syncUserStore } = useAuth()
  syncUserStore()
  
  // Fetch contacts with loading state
  await withLoading(fetchContacts, { 
    message: 'Loading contacts...' 
  })
})
</script>