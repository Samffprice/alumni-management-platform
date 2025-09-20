<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-aggie-50/30 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Header with Logo -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center mb-6">
        <div class="w-16 h-16 bg-gradient-to-br from-aggie-600 to-aggie-700 rounded-2xl flex items-center justify-center shadow-medium hover:shadow-strong transition-all duration-300 hover:scale-105">
          <span class="text-white font-bold text-2xl">AE</span>
        </div>
      </div>
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Aggie Entrepreneurs
        </h1>
        <p class="text-base text-gray-600">
          Alumni Management Platform
        </p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white/95 backdrop-blur-sm py-10 px-6 shadow-strong border border-gray-100/60 sm:rounded-2xl sm:px-12">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center">
      <p class="text-sm text-gray-500">
        © {{ currentYear }} Aggie Entrepreneurs. All rights reserved.
      </p>
      <div class="flex justify-center space-x-4 mt-2">
        <a href="#" class="text-xs text-gray-400 hover:text-aggie-600 transition-colors duration-200">Privacy</a>
        <a href="#" class="text-xs text-gray-400 hover:text-aggie-600 transition-colors duration-200">Terms</a>
        <a href="#" class="text-xs text-gray-400 hover:text-aggie-600 transition-colors duration-200">Support</a>
      </div>
    </div>
    
    <!-- Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
// Import notification container
import NotificationContainer from '../components/NotificationContainer.vue'

// Computed
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
/* Enhanced auth layout styling */
@supports (backdrop-filter: blur(12px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(12px);
  }
}

/* Hover effects */
.hover\:scale-105:hover {
  transform: scale(1.05);
}

/* Custom focus styles */
a:focus-visible {
  outline: 2px solid theme('colors.aggie.500');
  outline-offset: 2px;
  border-radius: 4px;
}
</style>