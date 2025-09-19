<template>
  <Teleport to="body">
    <!-- Global Error Overlay -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showGlobalError"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="dismissGlobalError"
          ></div>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Critical Error
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {{ globalErrorMessage }}
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                @click="reloadPage"
                type="button"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Reload Page
              </button>
              <button
                @click="dismissGlobalError"
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error Toast Container -->
    <div class="fixed top-4 right-4 z-40 space-y-2 max-w-sm">
      <TransitionGroup
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 translate-x-2"
        enter-to-class="transform opacity-100 translate-x-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 translate-x-0"
        leave-to-class="transform opacity-0 translate-x-2"
      >
        <div
          v-for="error in visibleErrors"
          :key="error.id"
          class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg"
        >
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <XCircleIcon class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3 flex-1">
              <h4 class="text-sm font-medium text-red-800">
                {{ error.title || 'Error' }}
              </h4>
              <p class="mt-1 text-sm text-red-700">
                {{ error.message }}
              </p>
              <div v-if="error.retryable" class="mt-2">
                <button
                  @click="retryError(error)"
                  :disabled="error.retrying"
                  class="text-sm text-red-600 hover:text-red-500 underline disabled:opacity-50"
                >
                  {{ error.retrying ? 'Retrying...' : 'Retry' }}
                </button>
              </div>
            </div>
            <div class="ml-4 flex-shrink-0">
              <button
                @click="dismissError(error.id)"
                class="text-red-400 hover:text-red-600"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Global Loading Overlay -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isAnyLoading && showLoadingOverlay"
        class="fixed inset-0 bg-white bg-opacity-75 z-40 flex items-center justify-center"
      >
        <LoadingSpinner
          size="lg"
          :message="primaryLoadingMessage"
          :progress="primaryLoadingProgress"
          :show-progress="primaryLoadingProgress !== undefined"
        />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import LoadingSpinner from './LoadingSpinner.vue'

interface ErrorItem {
  id: string
  title?: string
  message: string
  retryable?: boolean
  retrying?: boolean
  timestamp: number
  onRetry?: () => Promise<void>
}

const props = withDefaults(defineProps<{
  maxErrors?: number
  errorTimeout?: number
  showLoadingOverlay?: boolean
}>(), {
  maxErrors: 5,
  errorTimeout: 10000,
  showLoadingOverlay: true
})

// State
const errors = ref<ErrorItem[]>([])
const showGlobalError = ref(false)
const globalErrorMessage = ref('')

// Composables
const { globalErrors, clearErrors } = useErrorHandler()
const { isAnyLoading, getAllLoadingStates } = useLoading()

// Computed
const visibleErrors = computed(() => {
  return errors.value.slice(0, props.maxErrors)
})

const primaryLoadingMessage = computed(() => {
  const states = getAllLoadingStates.value
  return states.length > 0 ? states[0].message : undefined
})

const primaryLoadingProgress = computed(() => {
  const states = getAllLoadingStates.value
  return states.length > 0 ? states[0].progress : undefined
})

// Methods
const addError = (error: any, options: { retryable?: boolean, onRetry?: () => Promise<void> } = {}) => {
  const errorItem: ErrorItem = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    title: error.title,
    message: error.message || 'An unexpected error occurred',
    retryable: options.retryable || false,
    retrying: false,
    timestamp: Date.now(),
    onRetry: options.onRetry
  }

  errors.value.unshift(errorItem)

  // Auto-dismiss after timeout
  setTimeout(() => {
    dismissError(errorItem.id)
  }, props.errorTimeout)
}

const dismissError = (id: string) => {
  const index = errors.value.findIndex(error => error.id === id)
  if (index > -1) {
    errors.value.splice(index, 1)
  }
}

const retryError = async (error: ErrorItem) => {
  if (!error.onRetry || error.retrying) return

  error.retrying = true

  try {
    await error.onRetry()
    dismissError(error.id)
  } catch (retryError) {
    console.error('Retry failed:', retryError)
    // Update error message
    error.message = 'Retry failed: ' + (retryError?.message || 'Unknown error')
  } finally {
    error.retrying = false
  }
}

const showCriticalError = (message: string) => {
  globalErrorMessage.value = message
  showGlobalError.value = true
}

const dismissGlobalError = () => {
  showGlobalError.value = false
  globalErrorMessage.value = ''
}

const reloadPage = () => {
  window.location.reload()
}

const clearAllErrors = () => {
  errors.value = []
  dismissGlobalError()
  clearErrors()
}

// Global error handlers
onMounted(() => {
  // Handle uncaught errors
  const handleError = (event: ErrorEvent) => {
    console.error('Uncaught error:', event.error)
    
    if (event.error?.critical) {
      showCriticalError(event.error.message)
    } else {
      addError({
        title: 'Application Error',
        message: event.error?.message || event.message || 'An unexpected error occurred'
      })
    }
  }

  // Handle unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    addError({
      title: 'Network Error',
      message: event.reason?.message || 'A network request failed'
    }, {
      retryable: true
    })
  }

  // Handle network errors
  const handleOnline = () => {
    const { showSuccess } = useNotifications()
    showSuccess('Connection Restored', 'You are back online')
    clearAllErrors()
  }

  const handleOffline = () => {
    showCriticalError('You are currently offline. Please check your internet connection.')
  }

  // Add event listeners
  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('error', handleError)
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  })
})

// Watch for global errors from error handler
watch(globalErrors, (newErrors) => {
  newErrors.forEach(error => {
    addError(error)
  })
}, { deep: true })

// Expose methods
defineExpose({
  addError,
  dismissError,
  clearAllErrors,
  showCriticalError
})
</script>