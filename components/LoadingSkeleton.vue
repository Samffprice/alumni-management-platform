<template>
  <div class="animate-pulse">
    <!-- Table Skeleton -->
    <div v-if="type === 'table'" class="space-y-4">
      <!-- Search and filters skeleton -->
      <div class="bg-white p-4 rounded-lg shadow-sm border">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="i in 3" :key="i" class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
            <div class="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Table skeleton -->
      <div class="bg-white shadow-sm rounded-lg border overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th v-for="i in columns" :key="i" class="px-6 py-3">
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                </th>
                <th class="px-6 py-3">
                  <div class="h-4 bg-gray-200 rounded w-16"></div>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="i in rows" :key="i">
                <td v-for="j in columns" :key="j" class="px-6 py-4">
                  <div class="h-4 bg-gray-200 rounded w-full"></div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <div class="h-8 w-8 bg-gray-200 rounded"></div>
                    <div class="h-8 w-8 bg-gray-200 rounded"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Form Skeleton -->
    <div v-else-if="type === 'form'" class="space-y-6">
      <div v-for="i in fields" :key="i" class="space-y-2">
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
        <div class="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div class="flex justify-end space-x-3 pt-4">
        <div class="h-10 bg-gray-200 rounded w-20"></div>
        <div class="h-10 bg-gray-200 rounded w-32"></div>
      </div>
    </div>

    <!-- Card Skeleton -->
    <div v-else-if="type === 'card'" class="bg-white shadow-sm rounded-lg border p-6">
      <div class="space-y-4">
        <div class="h-6 bg-gray-200 rounded w-3/4"></div>
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div class="flex space-x-2 pt-4">
          <div class="h-8 bg-gray-200 rounded w-20"></div>
          <div class="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- List Skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div v-for="i in items" :key="i" class="bg-white shadow-sm rounded-lg border p-4">
        <div class="flex items-center space-x-4">
          <div class="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div class="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Dashboard Skeleton -->
    <div v-else-if="type === 'dashboard'" class="space-y-6">
      <!-- Header -->
      <div class="space-y-2">
        <div class="h-8 bg-gray-200 rounded w-1/2"></div>
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
      </div>

      <!-- Stats cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="bg-white shadow-sm rounded-lg border p-6">
          <div class="space-y-3">
            <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>

      <!-- Content area -->
      <div class="bg-white shadow-sm rounded-lg border p-6">
        <div class="space-y-4">
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          <div class="space-y-2">
            <div v-for="i in 4" :key="i" class="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generic Skeleton -->
    <div v-else class="space-y-3">
      <div v-for="i in lines" :key="i" class="h-4 bg-gray-200 rounded w-full"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type?: 'table' | 'form' | 'card' | 'list' | 'dashboard' | 'generic'
  rows?: number
  columns?: number
  fields?: number
  items?: number
  lines?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'generic',
  rows: 5,
  columns: 7,
  fields: 6,
  items: 3,
  lines: 3
})
</script>