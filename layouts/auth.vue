<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- Header with Logo -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="flex justify-center">
        <div class="w-12 h-12 bg-maroon-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">AE</span>
        </div>
      </div>
      <h1 class="mt-4 text-center text-2xl font-bold text-gray-900">
        Aggie Entrepreneurs
      </h1>
      <p class="mt-2 text-center text-sm text-gray-600">
        Alumni Management Platform
      </p>
    </div>

    <!-- Main Content -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <slot />
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 text-center">
      <p class="text-xs text-gray-500">
        © {{ currentYear }} Aggie Entrepreneurs. All rights reserved.
      </p>
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
/* Custom maroon color for Aggie theme */
.bg-maroon-600 {
  background-color: #722f37;
}
</style>