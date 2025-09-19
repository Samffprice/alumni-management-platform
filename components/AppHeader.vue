<template>
  <header class="bg-white shadow-sm border-b border-gray-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <NuxtLink to="/dashboard" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-maroon-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">AE</span>
            </div>
            <span class="text-xl font-semibold text-gray-900 hidden sm:block">
              Alumni Management
            </span>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink 
            to="/dashboard" 
            class="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-maroon-600 bg-maroon-50': $route.path === '/dashboard' }"
          >
            Dashboard
          </NuxtLink>
          
          <NuxtLink 
            to="/contacts" 
            class="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-maroon-600 bg-maroon-50': $route.path.startsWith('/contacts') }"
          >
            Contacts
          </NuxtLink>
          
          <!-- Admin link for VPs only -->
          <NuxtLink 
            v-if="userStore.isVP"
            to="/admin/users" 
            class="text-gray-700 hover:text-maroon-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            :class="{ 'text-maroon-600 bg-maroon-50': $route.path.startsWith('/admin') }"
          >
            Admin
          </NuxtLink>
        </nav>

        <!-- User Profile Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:ring-offset-2 rounded-md p-2"
            :class="{ 'text-gray-900': isDropdownOpen }"
          >
            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span class="text-sm font-medium text-gray-700">
                {{ userInitials }}
              </span>
            </div>
            <span class="hidden sm:block text-sm font-medium">
              {{ userStore.displayName }}
            </span>
            <ChevronDownIcon 
              class="w-4 h-4 transition-transform"
              :class="{ 'rotate-180': isDropdownOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
            >
              <div class="py-1">
                <!-- User Info -->
                <div class="px-4 py-2 border-b border-gray-100">
                  <p class="text-sm font-medium text-gray-900">{{ userStore.displayName }}</p>
                  <p class="text-xs text-gray-500">{{ userStore.roleDisplayName }}</p>
                </div>
                
                <!-- Navigation Links (Mobile) -->
                <div class="md:hidden border-b border-gray-100">
                  <NuxtLink 
                    to="/dashboard"
                    @click="closeDropdown"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </NuxtLink>
                  <NuxtLink 
                    to="/contacts"
                    @click="closeDropdown"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Contacts
                  </NuxtLink>
                  <NuxtLink 
                    v-if="userStore.isVP"
                    to="/admin/users"
                    @click="closeDropdown"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Admin
                  </NuxtLink>
                </div>

                <!-- Logout -->
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Mobile menu button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-maroon-500"
        >
          <span class="sr-only">Open main menu</span>
          <Bars3Icon v-if="!isMobileMenuOpen" class="block h-6 w-6" />
          <XMarkIcon v-else class="block h-6 w-6" />
        </button>
      </div>

      <!-- Mobile Navigation Menu -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div v-if="isMobileMenuOpen" class="md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
            <NuxtLink 
              to="/dashboard"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'text-maroon-600 bg-maroon-50': $route.path === '/dashboard' }"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink 
              to="/contacts"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'text-maroon-600 bg-maroon-50': $route.path.startsWith('/contacts') }"
            >
              Contacts
            </NuxtLink>
            <NuxtLink 
              v-if="userStore.isVP"
              to="/admin/users"
              @click="closeMobileMenu"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              :class="{ 'text-maroon-600 bg-maroon-50': $route.path.startsWith('/admin') }"
            >
              Admin
            </NuxtLink>
          </div>
        </div>
      </Transition>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

// Store
const userStore = useUserStore()

// State
const isDropdownOpen = ref(false)
const isMobileMenuOpen = ref(false)

// Computed
const userInitials = computed(() => {
  const email = userStore.displayName
  if (email && email.includes('@')) {
    return email.charAt(0).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
})

// Methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    isMobileMenuOpen.value = false
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  if (isMobileMenuOpen.value) {
    isDropdownOpen.value = false
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const handleLogout = async () => {
  try {
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
    userStore.clearUser()
    await navigateTo('/login')
  } catch (error) {
    console.error('Error during logout:', error)
  }
  closeDropdown()
}

// Close dropdowns when clicking outside
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('.relative')) {
      isDropdownOpen.value = false
      isMobileMenuOpen.value = false
    }
  }
  
  document.addEventListener('click', handleClickOutside)
  
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
/* Custom maroon color for Aggie theme */
.bg-maroon-600 {
  background-color: #722f37;
}

.text-maroon-600 {
  color: #722f37;
}

.bg-maroon-50 {
  background-color: #fdf2f8;
}

.hover\:text-maroon-600:hover {
  color: #722f37;
}

.focus\:ring-maroon-500:focus {
  --tw-ring-color: #881337;
}
</style>