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
              <span class="ml-1 text-sm font-medium text-gray-500 md:ml-2">Add Contact</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Add New Contact</h1>
        <p class="mt-2 text-gray-600">
          Add a new alumni, mentor, or professional contact to the database.
        </p>
      </div>

      <!-- Contact Form -->
      <div class="bg-white shadow-sm rounded-lg">
        <div class="px-6 py-6">
          <ErrorBoundary
            :retryable="false"
            fallback-title="Form Error"
            fallback-message="There was an error with the contact form. Please refresh the page and try again."
          >
            <ContactForm
              mode="add"
              :loading="submitting"
              @submit="handleSubmit"
              @cancel="handleCancel"
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ContactInput } from '~/types'
import { useUserStore } from '~/store/user'
import { useSupabaseOperations } from '~/composables/useSupabaseOperations'
import { useErrorHandler } from '~/composables/useErrorHandler'
import ErrorBoundary from '~/components/ErrorBoundary.vue'

// Define page meta
definePageMeta({
  // Global auth middleware handles authentication
})

// Composables
const userStore = useUserStore()
const { contacts: contactOps } = useSupabaseOperations()
const { handleError } = useErrorHandler()
const router = useRouter()

// Reactive state
const submitting = ref(false)

// Form submission handler
const handleSubmit = async (contactData: ContactInput) => {
  if (!userStore.user) {
    handleError(
      new Error('You must be logged in to add contacts.'),
      'Add Contact',
      { showNotification: true, retryable: false }
    )
    return
  }

  submitting.value = true

  try {
    await contactOps.addContact(contactData)
    
    // Redirect to contacts list on success
    await router.push('/contacts')

  } catch (err: any) {
    console.error('Error adding contact:', err)
    handleError(err, 'Add Contact', { 
      showNotification: true,
      retryable: false 
    })
  } finally {
    submitting.value = false
  }
}

// Cancel handler
const handleCancel = () => {
  router.push('/contacts')
}

// Check permissions on mount
onMounted(() => {
  if (!userStore.isApproved) {
    handleError(
      new Error('You need to be approved to add contacts.'),
      'Access Check',
      { showNotification: true, retryable: false }
    )
    router.push('/contacts')
  }
})
</script>