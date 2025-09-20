<template>
  <div class="space-y-4">
    <!-- Search and Filter Controls -->
    <div class="bg-white p-4 sm:p-6 rounded-2xl shadow-soft border border-gray-100/60">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Search Input -->
        <div class="sm:col-span-2 lg:col-span-1">
          <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            id="search"
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, business..."
            class="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-aggie-500 focus:border-aggie-500 transition-all duration-200 hover:border-gray-300"
          />
        </div>

        <!-- Contact Type Filter -->
        <div>
          <label for="contact-type-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Contact Type
          </label>
          <select
            id="contact-type-filter"
            v-model="selectedContactType"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-aggie-500 focus:border-aggie-500 transition-all duration-200 hover:border-gray-300"
          >
            <option value="">All Types</option>
            <option value="Alumni">Alumni</option>
            <option value="Mentor">Mentor</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <!-- Business Sector Filter -->
        <div>
          <label for="business-sector-filter" class="block text-sm font-medium text-gray-700 mb-1">
            Business Sector
          </label>
          <select
            id="business-sector-filter"
            v-model="selectedBusinessSector"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-aggie-500 focus:border-aggie-500 transition-all duration-200 hover:border-gray-300"
          >
            <option value="">All Sectors</option>
            <option v-for="sector in uniqueBusinessSectors" :key="sector" :value="sector">
              {{ sector }}
            </option>
          </select>
        </div>
      </div>

      <!-- Clear Filters Button -->
      <div class="mt-4 flex justify-center sm:justify-end">
        <button
          @click="clearFilters"
          class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-aggie-700 hover:bg-aggie-50 rounded-lg transition-all duration-200"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <!-- Results Summary -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
      <p class="text-sm text-gray-600 text-center sm:text-left">
        Showing {{ paginatedContacts.length }} of {{ filteredContacts.length }} contacts
      </p>
      <div class="flex items-center justify-center sm:justify-end space-x-2">
        <label for="page-size" class="text-sm text-gray-600">Show:</label>
        <select
          id="page-size"
          v-model="pageSize"
          class="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden lg:block bg-white shadow-soft rounded-2xl border border-gray-100/60 overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-6">
        <LoadingSkeleton type="table" :rows="5" :columns="7" />
      </div>
      
      <!-- Table Content -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100/50">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                @click="column.sortable ? handleSort(column.key) : null"
                :class="[
                  'px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider',
                  column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-200' : ''
                ]"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ column.label }}</span>
                  <div v-if="column.sortable" class="flex flex-col">
                    <svg
                      :class="[
                        'w-3 h-3',
                        sortBy === column.key && sortOrder === 'asc' ? 'text-blue-600' : 'text-gray-400'
                      ]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" />
                    </svg>
                    <svg
                      :class="[
                        'w-3 h-3 -mt-1',
                        sortBy === column.key && sortOrder === 'desc' ? 'text-blue-600' : 'text-gray-400'
                      ]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </th>
              <th class="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-100">
            <tr v-if="paginatedContacts.length === 0 && !loading">
              <td :colspan="columns.length + 1" class="px-6 py-12 text-center text-gray-500">
                <div class="flex flex-col items-center">
                  <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-lg font-medium">No contacts found</p>
                  <p class="text-sm">Try adjusting your search or filter criteria</p>
                </div>
              </td>
            </tr>
            <tr v-for="contact in paginatedContacts" :key="contact.id" class="hover:bg-gradient-to-r hover:from-gray-50 hover:to-aggie-50/20 transition-all duration-200 group">
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="handleView(contact)"
                  class="text-left text-base font-semibold text-gray-900 hover:text-aggie-600 hover:underline transition-all duration-200 cursor-pointer group-hover:text-aggie-600 rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-aggie-50"
                  :title="`View ${contact.name}'s details`"
                >
                  {{ contact.name }}
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ contact.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ contact.phone_number || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                  contact.contact_type === 'Alumni' ? 'bg-blue-100 text-blue-800' :
                  contact.contact_type === 'Mentor' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                ]">
                  {{ contact.contact_type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ contact.business_sector || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ contact.business_name || '-' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div v-if="contact.added_by_name" class="text-sm">
                  <button
                    v-if="canViewProfiles"
                    @click="handleViewProfile(contact.added_by)"
                    class="text-blue-600 hover:text-blue-900 hover:underline"
                    :title="`View ${contact.added_by_name}'s profile`"
                  >
                    {{ contact.added_by_name }}
                  </button>
                  <span v-else class="text-gray-900">
                    {{ contact.added_by_name }}
                  </span>
                  <div v-if="contact.added_by_position" class="text-xs text-gray-500">
                    {{ contact.added_by_position }}
                  </div>
                </div>
                <div v-else-if="contact.added_by_email" class="text-sm">
                  <span class="text-gray-900">{{ contact.added_by_email }}</span>
                  <div class="text-xs text-gray-500">Email only</div>
                </div>
                <div v-else class="text-sm text-gray-500">Unknown</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(contact.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <!-- View Button - Always visible (but less prominent since name is clickable) -->
                  <button
                    @click="handleView(contact)"
                    class="text-gray-500 hover:text-aggie-600 px-2 py-2 rounded-lg hover:bg-aggie-50 transition-all duration-200 opacity-60 group-hover:opacity-100"
                    title="View contact details"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  <!-- Edit Button - Officer and VP only -->
                  <button
                    v-if="canEdit"
                    @click="handleEdit(contact)"
                    class="text-gray-500 hover:text-blue-600 px-2 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 opacity-60 group-hover:opacity-100"
                    title="Edit contact"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <!-- Delete Button - VP only -->
                  <button
                    v-if="canDelete"
                    @click="handleDelete(contact)"
                    class="text-gray-500 hover:text-red-600 px-2 py-2 rounded-lg hover:bg-red-50 transition-all duration-200 opacity-60 group-hover:opacity-100"
                    title="Delete contact"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="lg:hidden space-y-4">
      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-4 shadow-soft animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="paginatedContacts.length === 0" class="bg-white rounded-xl p-8 shadow-soft text-center">
        <svg class="w-12 h-12 text-gray-300 mb-4 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p class="text-lg font-medium text-gray-900 mb-2">No contacts found</p>
        <p class="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
      </div>

      <!-- Contact Cards -->
      <div v-else class="space-y-4">
        <div 
          v-for="contact in paginatedContacts" 
          :key="contact.id" 
          class="bg-white rounded-xl p-4 shadow-soft border border-gray-100 hover:shadow-medium transition-all duration-200"
        >
          <!-- Contact Header -->
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <button
                @click="handleView(contact)"
                class="text-left w-full hover:bg-aggie-50 rounded-lg p-2 -m-2 transition-all duration-200"
              >
                <h3 class="text-lg font-semibold text-gray-900 hover:text-aggie-600 transition-colors duration-200 truncate">
                  {{ contact.name }}
                </h3>
                <p class="text-sm text-gray-600 truncate">{{ contact.email }}</p>
              </button>
            </div>
            <div class="flex-shrink-0 ml-3">
              <span :class="[
                'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
                contact.contact_type === 'Alumni' ? 'bg-blue-100 text-blue-800' :
                contact.contact_type === 'Mentor' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              ]">
                {{ contact.contact_type }}
              </span>
            </div>
          </div>

          <!-- Contact Details -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
            <div v-if="contact.phone_number">
              <span class="text-gray-500 font-medium">Phone:</span>
              <div class="text-gray-900">{{ contact.phone_number }}</div>
            </div>
            <div v-if="contact.business_sector">
              <span class="text-gray-500 font-medium">Sector:</span>
              <div class="text-gray-900">{{ contact.business_sector }}</div>
            </div>
            <div v-if="contact.business_name">
              <span class="text-gray-500 font-medium">Business:</span>
              <div class="text-gray-900">{{ contact.business_name }}</div>
            </div>
            <div>
              <span class="text-gray-500 font-medium">Added:</span>
              <div class="text-gray-900">{{ formatDate(contact.created_at) }}</div>
            </div>
          </div>

          <!-- Added By Info -->
          <div v-if="contact.added_by_name || contact.added_by_email" class="mb-4 text-sm">
            <span class="text-gray-500 font-medium">Added by:</span>
            <div v-if="contact.added_by_name">
              <button
                v-if="canViewProfiles"
                @click="handleViewProfile(contact.added_by)"
                class="text-blue-600 hover:text-blue-900 hover:underline"
                :title="`View ${contact.added_by_name}'s profile`"
              >
                {{ contact.added_by_name }}
              </button>
              <span v-else class="text-gray-900">
                {{ contact.added_by_name }}
              </span>
              <div v-if="contact.added_by_position" class="text-xs text-gray-500">
                {{ contact.added_by_position }}
              </div>
            </div>
            <div v-else-if="contact.added_by_email" class="text-gray-900">
              {{ contact.added_by_email }}
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
            <button
              @click="handleView(contact)"
              class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>

            <button
              v-if="canEdit"
              @click="handleEdit(contact)"
              class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-200 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>

            <button
              v-if="canDelete"
              @click="handleDelete(contact)"
              class="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Page {{ currentPage }} of {{ totalPages }}
      </div>
      <div class="flex space-x-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-aggie-50 hover:border-aggie-200 hover:text-aggie-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft"
        >
          Previous
        </button>
        
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            @click="goToPage(page as number)"
            :class="[
              'px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shadow-soft',
              currentPage === page
                ? 'text-white bg-gradient-to-r from-aggie-600 to-aggie-700 border border-aggie-600 shadow-medium'
                : 'text-gray-600 bg-white border border-gray-200 hover:bg-aggie-50 hover:border-aggie-200 hover:text-aggie-700'
            ]"
          >
            {{ page }}
          </button>
          <span v-else class="px-3 py-2 text-sm font-medium text-gray-500">...</span>
        </template>

        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-aggie-50 hover:border-aggie-200 hover:text-aggie-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-soft"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Contact, ContactType, UserRole } from '~/types'
import LoadingSkeleton from './LoadingSkeleton.vue'

// Props
interface Props {
  contacts: Contact[]
  userRole: UserRole
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

// Emits
const emit = defineEmits<{
  view: [contact: Contact]
  edit: [contact: Contact]
  delete: [contact: Contact]
  viewProfile: [userId: string]
}>()

// Reactive state
const searchQuery = ref('')
const selectedContactType = ref<ContactType | ''>('')
const selectedBusinessSector = ref('')
const sortBy = ref<keyof Contact>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = ref(25)

// Table columns configuration
const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'phone_number', label: 'Phone', sortable: false },
  { key: 'contact_type', label: 'Type', sortable: true },
  { key: 'business_sector', label: 'Sector', sortable: true },
  { key: 'business_name', label: 'Business', sortable: true },
  { key: 'added_by_name', label: 'Added By', sortable: true },
  { key: 'created_at', label: 'Added', sortable: true }
]

// Permission computed properties
const canEdit = computed(() => props.userRole === 'officer' || props.userRole === 'vp')
const canDelete = computed(() => props.userRole === 'vp')
const canViewProfiles = computed(() => props.userRole === 'officer' || props.userRole === 'vp')

// Get unique business sectors for filter dropdown
const uniqueBusinessSectors = computed(() => {
  const sectors = props.contacts
    .map(contact => contact.business_sector)
    .filter((sector): sector is string => Boolean(sector))
  return [...new Set(sectors)].sort()
})

// Filtered contacts based on search and filters
const filteredContacts = computed(() => {
  let filtered = [...props.contacts]

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(contact => 
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      (contact.business_sector && contact.business_sector.toLowerCase().includes(query)) ||
      (contact.business_name && contact.business_name.toLowerCase().includes(query))
    )
  }

  // Apply contact type filter
  if (selectedContactType.value) {
    filtered = filtered.filter(contact => contact.contact_type === selectedContactType.value)
  }

  // Apply business sector filter
  if (selectedBusinessSector.value) {
    filtered = filtered.filter(contact => contact.business_sector === selectedBusinessSector.value)
  }

  return filtered
})

// Sorted contacts
const sortedContacts = computed(() => {
  const sorted = [...filteredContacts.value]
  
  sorted.sort((a, b) => {
    const aValue = a[sortBy.value]
    const bValue = b[sortBy.value]
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0
    if (aValue == null) return sortOrder.value === 'asc' ? 1 : -1
    if (bValue == null) return sortOrder.value === 'asc' ? -1 : 1
    
    // String comparison
    const aStr = String(aValue).toLowerCase()
    const bStr = String(bValue).toLowerCase()
    
    if (aStr < bStr) return sortOrder.value === 'asc' ? -1 : 1
    if (aStr > bStr) return sortOrder.value === 'asc' ? 1 : -1
    return 0
  })
  
  return sorted
})

// Pagination computed properties
const totalPages = computed(() => Math.ceil(sortedContacts.value.length / pageSize.value))

const paginatedContacts = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedContacts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    // Show all pages if 7 or fewer
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)
    
    if (current > 4) {
      pages.push('...')
    }
    
    // Show pages around current page
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    if (current < total - 3) {
      pages.push('...')
    }
    
    // Always show last page
    if (total > 1) {
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const handleSort = (column: keyof Contact) => {
  if (sortBy.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column
    sortOrder.value = 'asc'
  }
  currentPage.value = 1 // Reset to first page when sorting
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedContactType.value = ''
  selectedBusinessSector.value = ''
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Event handlers
const handleView = (contact: Contact) => {
  emit('view', contact)
}

const handleEdit = (contact: Contact) => {
  emit('edit', contact)
}

const handleDelete = (contact: Contact) => {
  emit('delete', contact)
}

const handleViewProfile = (userId: string) => {
  emit('viewProfile', userId)
}

// Reset page when filters change
watch([searchQuery, selectedContactType, selectedBusinessSector, pageSize], () => {
  currentPage.value = 1
})
</script>