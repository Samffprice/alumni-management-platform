<template>
  <div class="min-h-screen bg-gray-50">
    <!-- App Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            © {{ currentYear }} Aggie Entrepreneurs. All rights reserved.
          </p>
          <div class="flex space-x-4">
            <a 
              href="#" 
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
    
    <!-- Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script setup lang="ts">
import NotificationContainer from '~/components/NotificationContainer.vue'

// Computed
const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
/* Ensure the layout takes full height */
.min-h-screen {
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>