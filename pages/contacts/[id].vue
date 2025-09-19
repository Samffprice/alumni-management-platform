<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Breadcrumb Navigation -->
      <nav class="flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <NuxtLink
              to="/contacts"
              class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Contacts
            </NuxtLink>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {{ contact?.name || 'Contact Details' }}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-sm font-medium text-red-800">Error loading contact</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
            <button
              @click="fetchContact"
              class="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Try again
            </button>
          </div>
        </div>
      </div>

      <!-- Contact Not Found -->
      <div v-else-if="!contact" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m6 0V7a2 2 0 00-2 2H9a2 2 0 00-2-2V6.306" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Contact not found</h3>
        <p class="mt-1 text-sm text-gray-500">
          The contact you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div class="mt-6">
          <NuxtLink
            to="/contacts"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Contacts
          </NuxtLink>
        </div>
      </div>

      <!-- Contact Content -->
      <div v-else>
        <!-- Edit Mode -->
        <div v-if="isEditMode" class="bg-white shadow-sm rounded-lg">
          <div class="px-6 py-6">
            <div class="mb-6">
              <h1 class="text-3xl font-bold text-gray-900">Edit Contact</h1>
              <p class="mt-2 text-gray-600">
                Update the contact information below.
              </p>
            </div>
            
            <ContactForm
              mode="edit"
              :contact="contact"
              :loading="submitting"
              @submit="handleUpdate"
              @cancel="handleCancelEdit"
            />
          </div>
        </div>

        <!-- View Mode -->
        <div v-else>
          <!-- Page Header with Actions -->
          <div class="mb-8">
            <div class="flex justify-between items-start">
              <div>
                <h1 class="text-3xl font-bold text-gray-900">{{ contact.name }}</h1>
                <p class="mt-2 text-gray-600">Contact Details</p>
              </div>
              
              <!-- Action Buttons -->
              <div v-if="userStore.canEditContacts" class="flex space-x-3">
                <button
                  @click="enterEditMode"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Contact
                </button>
                
                <button
                  v-if="userStore.canDeleteContacts"
                  @click="handleDelete"
                  class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Contact Information Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Contact Info -->
            <div class="lg:col-span-2">
              <div class="bg-white shadow-sm rounded-lg">
                <div class="px-6 py-5">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                  
                  <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Full Name</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ contact.name }}</dd>
                    </div>
                    
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Email</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        <a :href="`mailto:${contact.email}`" class="text-blue-600 hover:text-blue-800">
                          {{ contact.email }}
                        </a>
                      </dd>
                    </div>
                    
                    <div v-if="contact.phone_number">
                      <dt class="text-sm font-medium text-gray-500">Phone</dt>
                      <dd class="mt-1 text-sm text-gray-900">
                        <a :href="`tel:${contact.phone_number}`" class="text-blue-600 hover:text-blue-800">
                          {{ contact.phone_number }}
                        </a>
                      </dd>
                    </div>
                    
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Contact Type</dt>
                      <dd class="mt-1">
                        <span :class="[
                          'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                          contact.contact_type === 'Alumni' ? 'bg-blue-100 text-blue-800' :
                          contact.contact_type === 'Mentor' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        ]">
                          {{ contact.contact_type }}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <!-- Business Information -->
              <div v-if="contact.business_sector || contact.business_name || contact.business_details" class="mt-6 bg-white shadow-sm rounded-lg">
                <div class="px-6 py-5">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
                  
                  <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div v-if="contact.business_sector">
                      <dt class="text-sm font-medium text-gray-500">Business Sector</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ contact.business_sector }}</dd>
                    </div>
                    
                    <div v-if="contact.business_name">
                      <dt class="text-sm font-medium text-gray-500">Business Name</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ contact.business_name }}</dd>
                    </div>
                    
                    <div v-if="contact.business_details" class="sm:col-span-2">
                      <dt class="text-sm font-medium text-gray-500">Business Details</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ contact.business_details }}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
              <!-- Source Information -->
              <div v-if="contact.contact_meta" class="bg-white shadow-sm rounded-lg">
                <div class="px-6 py-5">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Source Information</h3>
                  
                  <dl class="space-y-4">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">How we met</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ contact.contact_meta.source_description }}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <!-- Metadata -->
              <div class="bg-white shadow-sm rounded-lg">
                <div class="px-6 py-5">
                  <h3 class="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                  
                  <dl class="space-y-4">
                    <div>
                      <dt class="text-sm font-medium text-gray-500">Added On</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(contact.created_at) }}</dd>
                    </div>
                    
                    <div v-if="contact.contact_meta">
                      <dt class="text-sm font-medium text-gray-500">Source Added On</dt>
                      <dd class="mt-1 text-sm text-gray-900">{{ formatDate(contact.contact_meta.created_at) }}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Contact, ContactInput } from '~/types'
import { useUserStore } from '~/store/user'
import { useNotifications } from '~/composables/useNotifications'

// Define page meta
definePageMeta({
  // Global auth middleware handles authentication
})

// Composables
const userStore = useUserStore()
const { addNotification } = useNotifications()
const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

// Reactive state
const contact = ref<Contact | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const submitting = ref(false)

// Computed properties
const contactId = computed(() => route.params.id as string)
const isEditMode = computed(() => route.query.edit === 'true')

// Fetch contact data
const fetchContact = async () => {
  loading.value = true
  error.value = null
  
  try {
    let query = supabase
      .from('contacts')
      .select(`
        *,
        contact_meta (
          id,
          source_description,
          created_at
        )
      `)
      .eq('id', contactId.value)

    // Apply role-based filtering
    if (userStore.role === 'member') {
      // Members can only see contacts they added
      query = query.eq('added_by', userStore.user?.id)
    }
    // Officers and VPs can see all contacts (no additional filter needed)

    const { data, error: fetchError } = await query.single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // No rows returned - contact not found or no permission
        contact.value = null
        return
      }
      throw fetchError
    }

    // Transform the data to match our Contact interface
    contact.value = {
      ...data,
      contact_meta: data.contact_meta?.[0] || undefined
    }

  } catch (err: any) {
    console.error('Error fetching contact:', err)
    error.value = err.message || 'Failed to load contact'
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to load contact. Please try again.'
    })
  } finally {
    loading.value = false
  }
}

// Enter edit mode
const enterEditMode = () => {
  router.push({ query: { edit: 'true' } })
}

// Cancel edit mode
const handleCancelEdit = () => {
  router.push({ query: {} })
}

// Handle contact update
const handleUpdate = async (contactData: ContactInput) => {
  if (!contact.value) return

  submitting.value = true

  try {
    // Update contact
    const { error: contactError } = await supabase
      .from('contacts')
      .update({
        name: contactData.name,
        email: contactData.email,
        phone_number: contactData.phone_number || null,
        business_sector: contactData.business_sector || null,
        business_name: contactData.business_name || null,
        business_details: contactData.business_details || null,
        contact_type: contactData.contact_type
      })
      .eq('id', contact.value.id)

    if (contactError) {
      throw contactError
    }

    // Update contact meta if it exists
    if (contact.value.contact_meta) {
      const { error: metaError } = await supabase
        .from('contact_meta')
        .update({
          source_description: contactData.source_description
        })
        .eq('contact_id', contact.value.id)

      if (metaError) {
        throw metaError
      }
    }

    // Success - show notification and exit edit mode
    addNotification({
      type: 'success',
      title: 'Success',
      message: `${contactData.name} has been updated successfully.`
    })

    // Refresh contact data and exit edit mode
    await fetchContact()
    router.push({ query: {} })

  } catch (err: any) {
    console.error('Error updating contact:', err)
    
    // Handle specific error cases
    let errorMessage = 'Failed to update contact. Please try again.'
    
    if (err.code === '23505') {
      // Unique constraint violation (likely email)
      errorMessage = 'A contact with this email address already exists.'
    } else if (err.message) {
      errorMessage = err.message
    }

    addNotification({
      type: 'error',
      title: 'Error',
      message: errorMessage
    })
  } finally {
    submitting.value = false
  }
}

// Handle contact deletion
const handleDelete = async () => {
  if (!contact.value) return

  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete ${contact.value.name}? This action cannot be undone.`)
  
  if (!confirmed) return

  try {
    // Delete the contact (contact_meta will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase
      .from('contacts')
      .delete()
      .eq('id', contact.value.id)

    if (deleteError) {
      throw deleteError
    }

    addNotification({
      type: 'success',
      title: 'Success',
      message: `${contact.value.name} has been deleted successfully.`
    })

    // Redirect to contacts list
    router.push('/contacts')

  } catch (err: any) {
    console.error('Error deleting contact:', err)
    addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to delete contact. Please try again.'
    })
  }
}

// Format date helper
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  // Ensure auth state is synced
  const { syncUserStore } = useAuth()
  syncUserStore()
  
  // Fetch contact
  await fetchContact()
})
</script>