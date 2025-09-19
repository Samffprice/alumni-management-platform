<template>
  <div :class="containerClasses">
    <div :class="spinnerClasses">
      <!-- Spinner SVG -->
      <svg
        class="animate-spin"
        :class="iconClasses"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <!-- Loading message -->
    <div v-if="message" :class="messageClasses">
      {{ message }}
    </div>

    <!-- Progress bar -->
    <div v-if="showProgress && progress !== undefined" class="w-full mt-4">
      <div class="flex justify-between text-sm text-gray-600 mb-1">
        <span>{{ progressLabel }}</span>
        <span>{{ Math.round(progress) }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'primary' | 'secondary' | 'white'
  message?: string
  progress?: number
  progressLabel?: string
  showProgress?: boolean
  overlay?: boolean
  center?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  variant: 'primary',
  progressLabel: 'Loading...',
  showProgress: false,
  overlay: false,
  center: false
})

// Computed classes
const containerClasses = computed(() => [
  'flex flex-col items-center justify-center',
  {
    // Overlay styles
    'fixed inset-0 bg-white bg-opacity-75 z-50': props.overlay,
    // Center styles
    'min-h-[200px]': props.center && !props.overlay,
    // Spacing
    'space-y-2': props.message || props.showProgress
  }
])

const spinnerClasses = computed(() => [
  'flex items-center justify-center',
  {
    // Size-based padding
    'p-1': props.size === 'sm',
    'p-2': props.size === 'md',
    'p-3': props.size === 'lg',
    'p-4': props.size === 'xl'
  }
])

const iconClasses = computed(() => [
  {
    // Size classes
    'h-4 w-4': props.size === 'sm',
    'h-6 w-6': props.size === 'md',
    'h-8 w-8': props.size === 'lg',
    'h-12 w-12': props.size === 'xl',
    
    // Color classes
    'text-blue-600': props.variant === 'primary',
    'text-gray-600': props.variant === 'secondary',
    'text-white': props.variant === 'white'
  }
])

const messageClasses = computed(() => [
  'text-center font-medium',
  {
    // Size-based text
    'text-sm': props.size === 'sm',
    'text-base': props.size === 'md',
    'text-lg': props.size === 'lg',
    'text-xl': props.size === 'xl',
    
    // Color classes
    'text-gray-700': props.variant === 'primary' || props.variant === 'secondary',
    'text-white': props.variant === 'white'
  }
])
</script>