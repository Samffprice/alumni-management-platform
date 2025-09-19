<template>
  <div>
    <!-- Error State -->
    <div v-if="hasError" class="error-boundary">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <ExclamationTriangleIcon class="h-6 w-6 text-red-400" />
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-lg font-medium text-red-800 mb-2">
              {{ errorTitle }}
            </h3>
            <div class="text-sm text-red-700 mb-4">
              <p>{{ errorMessage }}</p>
              <p v-if="showDetails && errorDetails" class="mt-2 font-mono text-xs bg-red-100 p-2 rounded">
                {{ errorDetails }}
              </p>
            </div>
            
            <div class="flex flex-wrap gap-3">
              <!-- Retry Button -->
              <button
                v-if="retryable"
                @click="handleRetry"
                :disabled="retrying"
                class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon v-if="retrying" class="animate-spin -ml-1 mr-2 h-4 w-4" />
                <ArrowPathIcon v-else class="-ml-1 mr-2 h-4 w-4" />
                {{ retrying ? 'Retrying...' : 'Try Again' }}
              </button>

              <!-- Reset Button -->
              <button
                @click="handleReset"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowUturnLeftIcon class="-ml-1 mr-2 h-4 w-4" />
                Reset
              </button>

              <!-- Toggle Details Button -->
              <button
                v-if="errorDetails"
                @click="showDetails = !showDetails"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronDownIcon v-if="!showDetails" class="-ml-1 mr-2 h-4 w-4" />
                <ChevronUpIcon v-else class="-ml-1 mr-2 h-4 w-4" />
                {{ showDetails ? 'Hide' : 'Show' }} Details
              </button>

              <!-- Report Button -->
              <button
                v-if="reportable"
                @click="handleReport"
                class="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <BugAntIcon class="-ml-1 mr-2 h-4 w-4" />
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Normal Content -->
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, onMounted, watch } from 'vue'
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BugAntIcon
} from '@heroicons/vue/24/outline'

interface Props {
  retryable?: boolean
  reportable?: boolean
  fallbackTitle?: string
  fallbackMessage?: string
  onRetry?: () => Promise<void> | void
  onReset?: () => void
  onReport?: (error: any) => void
}

const props = withDefaults(defineProps<Props>(), {
  retryable: true,
  reportable: false,
  fallbackTitle: 'Something went wrong',
  fallbackMessage: 'An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.'
})

const emit = defineEmits<{
  error: [error: any]
  retry: []
  reset: []
  report: [error: any]
}>()

// State
const hasError = ref(false)
const currentError = ref<any>(null)
const retrying = ref(false)
const showDetails = ref(false)
const retryCount = ref(0)
const maxRetries = 3

// Computed
const errorTitle = computed(() => {
  if (currentError.value?.title) {
    return currentError.value.title
  }
  return props.fallbackTitle
})

const errorMessage = computed(() => {
  if (currentError.value?.message) {
    return currentError.value.message
  }
  return props.fallbackMessage
})

const errorDetails = computed(() => {
  if (currentError.value?.stack) {
    return currentError.value.stack
  }
  if (currentError.value?.details) {
    return JSON.stringify(currentError.value.details, null, 2)
  }
  return null
})

// Error capture
onErrorCaptured((error, instance, info) => {
  console.error('Error captured by ErrorBoundary:', error, info)
  
  hasError.value = true
  currentError.value = {
    message: error.message,
    stack: error.stack,
    info,
    timestamp: new Date().toISOString()
  }
  
  emit('error', error)
  
  // Prevent the error from propagating further
  return false
})

// Handle unhandled promise rejections
onMounted(() => {
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    hasError.value = true
    currentError.value = {
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack,
      type: 'unhandledRejection',
      timestamp: new Date().toISOString()
    }
    
    emit('error', event.reason)
  }

  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  
  // Cleanup
  onUnmounted(() => {
    window.removeEventListener('unhandledrejection', handleUnhandledRejection)
  })
})

// Methods
const handleRetry = async () => {
  if (retryCount.value >= maxRetries) {
    const { showError } = useNotifications()
    showError(
      'Maximum Retries Exceeded',
      'Please refresh the page or contact support.'
    )
    return
  }

  retrying.value = true
  retryCount.value++
  
  try {
    if (props.onRetry) {
      await props.onRetry()
    }
    
    // Reset error state if retry succeeds
    hasError.value = false
    currentError.value = null
    retryCount.value = 0
    
    emit('retry')
  } catch (error) {
    console.error('Retry failed:', error)
    currentError.value = {
      message: error?.message || 'Retry failed',
      stack: error?.stack,
      timestamp: new Date().toISOString()
    }
  } finally {
    retrying.value = false
  }
}

const handleReset = () => {
  hasError.value = false
  currentError.value = null
  retryCount.value = 0
  showDetails.value = false
  
  if (props.onReset) {
    props.onReset()
  }
  
  emit('reset')
}

const handleReport = () => {
  if (props.onReport) {
    props.onReport(currentError.value)
  }
  
  emit('report', currentError.value)
  
  // Default reporting behavior
  const { showSuccess } = useNotifications()
  showSuccess(
    'Issue Reported',
    'Thank you for reporting this issue. Our team has been notified.'
  )
}

// Watch for external error clearing
watch(() => hasError.value, (newValue) => {
  if (!newValue) {
    currentError.value = null
    retryCount.value = 0
    showDetails.value = false
  }
})

// Expose methods for parent components
defineExpose({
  hasError: readonly(hasError),
  currentError: readonly(currentError),
  clearError: handleReset,
  retry: handleRetry
})
</script>

<style scoped>
.error-boundary {
  /* Ensure error boundary doesn't break layout */
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>