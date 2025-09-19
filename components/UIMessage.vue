<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="transform opacity-100 translate-y-0 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="transform opacity-100 translate-y-0 sm:translate-x-0"
      leave-to-class="transform opacity-0 translate-y-2 sm:translate-y-0 sm:translate-x-2"
    >
      <div
        v-if="visible"
        class="fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <!-- Success Icon -->
              <CheckCircleIcon
                v-if="type === 'success'"
                class="h-6 w-6 text-green-400"
              />
              <!-- Error Icon -->
              <XCircleIcon
                v-else-if="type === 'error'"
                class="h-6 w-6 text-red-400"
              />
              <!-- Warning Icon -->
              <ExclamationTriangleIcon
                v-else-if="type === 'warning'"
                class="h-6 w-6 text-yellow-400"
              />
              <!-- Info Icon -->
              <InformationCircleIcon
                v-else-if="type === 'info'"
                class="h-6 w-6 text-blue-400"
              />
            </div>
            <div class="ml-3 w-0 flex-1 pt-0.5">
              <p 
                class="text-sm font-medium"
                :class="titleClasses"
              >
                {{ title }}
              </p>
              <p 
                v-if="message"
                class="mt-1 text-sm text-gray-500"
              >
                {{ message }}
              </p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                @click="dismiss"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Close</span>
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        <!-- Progress bar for auto-dismiss -->
        <div
          v-if="autoDismiss && timeout > 0"
          class="h-1 bg-gray-200"
        >
          <div
            class="h-full transition-all ease-linear"
            :class="progressBarClasses"
            :style="{ width: progressWidth + '%' }"
          ></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

export interface UIMessageProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  autoDismiss?: boolean
  timeout?: number
}

const props = withDefaults(defineProps<UIMessageProps>(), {
  type: 'info',
  autoDismiss: true,
  timeout: 5000
})

const emit = defineEmits<{
  dismiss: []
}>()

// State
const visible = ref(true)
const progressWidth = ref(100)
let timeoutId: NodeJS.Timeout | null = null
let progressInterval: NodeJS.Timeout | null = null

// Computed
const titleClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800'
    case 'error':
      return 'text-red-800'
    case 'warning':
      return 'text-yellow-800'
    case 'info':
      return 'text-blue-800'
    default:
      return 'text-gray-800'
  }
})

const progressBarClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-400'
    case 'error':
      return 'bg-red-400'
    case 'warning':
      return 'bg-yellow-400'
    case 'info':
      return 'bg-blue-400'
    default:
      return 'bg-gray-400'
  }
})

// Methods
const dismiss = () => {
  visible.value = false
  clearTimers()
  emit('dismiss')
}

const clearTimers = () => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

// Auto-dismiss functionality
onMounted(() => {
  if (props.autoDismiss && props.timeout > 0) {
    // Set up auto-dismiss timer
    timeoutId = setTimeout(() => {
      dismiss()
    }, props.timeout)

    // Set up progress bar animation
    const updateInterval = 50 // Update every 50ms
    const totalUpdates = props.timeout / updateInterval
    let currentUpdate = 0

    progressInterval = setInterval(() => {
      currentUpdate++
      progressWidth.value = Math.max(0, 100 - (currentUpdate / totalUpdates) * 100)
      
      if (currentUpdate >= totalUpdates) {
        clearInterval(progressInterval!)
        progressInterval = null
      }
    }, updateInterval)
  }
})

onUnmounted(() => {
  clearTimers()
})
</script>