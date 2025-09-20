<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <!-- Back Button -->
      <div class="mb-6">
        <NuxtLink
          to="/contacts"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-aggie-700 bg-white hover:bg-aggie-50 border border-gray-200 hover:border-aggie-200 rounded-xl shadow-soft hover:shadow-medium transition-all duration-200"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Contacts
        </NuxtLink>
      </div>

      <!-- Breadcrumb Navigation - Hidden on mobile -->
      <nav class="hidden sm:flex mb-8" aria-label="Breadcrumb">
        <ol class="inline-flex items-center space-x-1 md:space-x-3">
          <li class="inline-flex items-center">
            <NuxtLink
              to="/dashboard"
              class="inline-flex items-center text-sm font-medium text-gray-500 hover:text-aggie-600 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              Dashboard
            </NuxtLink>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <NuxtLink
                to="/contacts"
                class="ml-1 text-sm font-medium text-gray-500 hover:text-aggie-600 md:ml-2 transition-colors duration-200"
              >
                Contacts
              </NuxtLink>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
              <span class="ml-1 text-sm font-medium text-aggie-600 md:ml-2">Add Contact</span>
            </div>
          </li>
        </ol>
      </nav>

      <!-- Page Header -->
      <div class="mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Add New Contact</h1>
        <p class="mt-2 text-sm sm:text-base text-gray-600">
          Add a new alumni, mentor, or professional contact to the database.
        </p>
      </div>

      <!-- Contact Form -->
      <div class="bg-white shadow-sm rounded-lg">
        <div class="px-4 sm:px-6 py-4 sm:py-6">
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