<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- App Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div class="animate-fade-in">
          <slot />
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <footer class="bg-white/80 backdrop-blur-sm border-t border-gray-200/60 mt-auto">
      <div class="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p class="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            © {{ currentYear }} Aggie Entrepreneurs. All rights reserved.
          </p>
          <div class="flex flex-wrap justify-center sm:justify-end space-x-4 sm:space-x-6">
            <a 
              href="#" 
              class="text-xs sm:text-sm text-gray-500 hover:text-aggie-600 transition-colors duration-200"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              class="text-xs sm:text-sm text-gray-500 hover:text-aggie-600 transition-colors duration-200"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              class="text-xs sm:text-sm text-gray-500 hover:text-aggie-600 transition-colors duration-200"
            >
              Support
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