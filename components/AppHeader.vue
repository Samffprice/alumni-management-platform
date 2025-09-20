<template>
  <header class="bg-white/95 backdrop-blur-md shadow-soft border-b border-gray-200/60 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center">
          <NuxtLink to="/dashboard" class="flex items-center space-x-3 group">
            <div class="w-10 h-10 bg-gradient-to-br from-aggie-600 to-aggie-700 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-strong transition-all duration-200 group-hover:scale-105">
              <span class="text-white font-bold text-lg">AE</span>
            </div>
            <div class="hidden sm:block">
              <span class="text-xl font-bold text-gray-900 group-hover:text-aggie-600 transition-colors duration-200">
                Alumni Management
              </span>
              <p class="text-xs text-gray-500 -mt-1">Aggie Entrepreneurs</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-2">
          <NuxtLink 
            to="/dashboard" 
            class="relative text-gray-700 hover:text-aggie-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-aggie-50"
            :class="{ 'text-aggie-600 bg-aggie-50 shadow-soft': $route.path === '/dashboard' }"
          >
            <span class="relative z-10">Dashboard</span>
            <div v-if="$route.path === '/dashboard'" class="absolute inset-0 bg-gradient-to-r from-aggie-50 to-aggie-100 rounded-lg"></div>
          </NuxtLink>
          
          <NuxtLink 
            to="/contacts" 
            class="relative text-gray-700 hover:text-aggie-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-aggie-50"
            :class="{ 'text-aggie-600 bg-aggie-50 shadow-soft': $route.path.startsWith('/contacts') }"
          >
            <span class="relative z-10">Contacts</span>
            <div v-if="$route.path.startsWith('/contacts')" class="absolute inset-0 bg-gradient-to-r from-aggie-50 to-aggie-100 rounded-lg"></div>
          </NuxtLink>
          
          <!-- Admin link for VPs only -->
          <NuxtLink 
            v-if="userStore.isVP"
            to="/admin/users" 
            class="relative text-gray-700 hover:text-aggie-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-aggie-50"
            :class="{ 'text-aggie-600 bg-aggie-50 shadow-soft': $route.path.startsWith('/admin') }"
          >
            <span class="relative z-10">Admin</span>
            <div v-if="$route.path.startsWith('/admin')" class="absolute inset-0 bg-gradient-to-r from-aggie-50 to-aggie-100 rounded-lg"></div>
          </NuxtLink>
        </nav>

        <!-- User Profile Dropdown -->
        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-aggie-500 focus:ring-offset-2 rounded-lg p-2 transition-all duration-200 hover:bg-gray-50"
            :class="{ 'text-gray-900 bg-gray-50': isDropdownOpen }"
          >
            <div class="w-9 h-9 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-full flex items-center justify-center shadow-soft border-2 border-white">
              <span class="text-sm font-semibold text-aggie-700">
                {{ userInitials }}
              </span>
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-medium">{{ userStore.displayName }}</p>
              <p class="text-xs text-gray-500">{{ userStore.roleDisplayName }}</p>
            </div>
            <ChevronDownIcon 
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': isDropdownOpen }"
            />
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95 translate-y-1"
            enter-to-class="transform opacity-100 scale-100 translate-y-0"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="transform opacity-100 scale-100 translate-y-0"
            leave-to-class="transform opacity-0 scale-95 translate-y-1"
          >
            <div
              v-if="isDropdownOpen"
              class="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-strong ring-1 ring-black/5 focus:outline-none z-50 border border-gray-100"
            >
              <div class="py-2">
                <!-- User Info -->
                <div class="px-4 py-3 border-b border-gray-100/60">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-aggie-100 to-aggie-200 rounded-full flex items-center justify-center">
                      <span class="text-sm font-semibold text-aggie-700">{{ userInitials }}</span>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-gray-900">{{ userStore.displayName }}</p>
                      <p class="text-xs text-aggie-600 font-medium">{{ userStore.roleDisplayName }}</p>
                    </div>
                  </div>
                </div>
                
                <!-- Navigation Links (Mobile) -->
                <div class="md:hidden border-b border-gray-100/60 py-1">
                  <NuxtLink 
                    to="/dashboard"
                    @click="closeDropdown"
                    class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-aggie-50 hover:text-aggie-700 rounded-lg mx-2 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    Dashboard
                  </NuxtLink>
                  <NuxtLink 
                    to="/contacts"
                    @click="closeDropdown"
                    class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-aggie-50 hover:text-aggie-700 rounded-lg mx-2 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Contacts
                  </NuxtLink>
                  <NuxtLink 
                    v-if="userStore.isVP"
                    to="/admin/users"
                    @click="closeDropdown"
                    class="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-aggie-50 hover:text-aggie-700 rounded-lg mx-2 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Admin
                  </NuxtLink>
                </div>

                <!-- Logout -->
                <div class="py-1">
                  <button
                    @click="handleLogout"
                    class="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg mx-2 transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
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
/* Enhanced Aggie theme with smooth transitions */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Backdrop blur support */
@supports (backdrop-filter: blur(12px)) {
  .backdrop-blur-md {
    backdrop-filter: blur(12px);
  }
}

/* Custom focus styles */
button:focus-visible {
  outline: 2px solid theme('colors.aggie.500');
  outline-offset: 2px;
}
</style>