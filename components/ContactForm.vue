<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Name Field -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.name ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @blur="validateField('name')"
        @input="clearFieldError('name')"
      />
      <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
    </div>

    <!-- Email Field -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
        Email <span class="text-red-500">*</span>
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.email ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @blur="validateField('email')"
        @input="clearFieldError('email')"
      />
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
    </div>

    <!-- Phone Number Field -->
    <div>
      <label for="phone_number" class="block text-sm font-medium text-gray-700 mb-1">
        Phone Number
      </label>
      <input
        id="phone_number"
        v-model="formData.phone_number"
        type="tel"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.phone_number ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @blur="validateField('phone_number')"
        @input="clearFieldError('phone_number')"
      />
      <p v-if="errors.phone_number" class="mt-1 text-sm text-red-600">{{ errors.phone_number }}</p>
    </div>

    <!-- Contact Type Field -->
    <div>
      <label for="contact_type" class="block text-sm font-medium text-gray-700 mb-1">
        Contact Type <span class="text-red-500">*</span>
      </label>
      <select
        id="contact_type"
        v-model="formData.contact_type"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.contact_type ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @change="validateField('contact_type')"
      >
        <option value="">Select contact type</option>
        <option value="Alumni">Alumni</option>
        <option value="Mentor">Mentor</option>
        <option value="Other">Other</option>
      </select>
      <p v-if="errors.contact_type" class="mt-1 text-sm text-red-600">{{ errors.contact_type }}</p>
    </div>

    <!-- Business Sector Field -->
    <div>
      <label for="business_sector" class="block text-sm font-medium text-gray-700 mb-1">
        Business Sector
      </label>
      <input
        id="business_sector"
        v-model="formData.business_sector"
        type="text"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.business_sector ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @blur="validateField('business_sector')"
        @input="clearFieldError('business_sector')"
      />
      <p v-if="errors.business_sector" class="mt-1 text-sm text-red-600">{{ errors.business_sector }}</p>
    </div>

    <!-- Business Name Field -->
    <div>
      <label for="business_name" class="block text-sm font-medium text-gray-700 mb-1">
        Business Name
      </label>
      <input
        id="business_name"
        v-model="formData.business_name"
        type="text"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.business_name ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @blur="validateField('business_name')"
        @input="clearFieldError('business_name')"
      />
      <p v-if="errors.business_name" class="mt-1 text-sm text-red-600">{{ errors.business_name }}</p>
    </div>

    <!-- Business Details Field -->
    <div>
      <label for="business_details" class="block text-sm font-medium text-gray-700 mb-1">
        Business Details
      </label>
      <textarea
        id="business_details"
        v-model="formData.business_details"
        rows="4"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.business_details ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @blur="validateField('business_details')"
        @input="clearFieldError('business_details')"
      />
      <p v-if="errors.business_details" class="mt-1 text-sm text-red-600">{{ errors.business_details }}</p>
    </div>

    <!-- Source Description Field -->
    <div>
      <label for="source_description" class="block text-sm font-medium text-gray-700 mb-1">
        Source Description <span class="text-red-500">*</span>
      </label>
      <textarea
        id="source_description"
        v-model="formData.source_description"
        rows="3"
        placeholder="How did you meet this contact? Where did you find their information?"
        :class="[
          'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
          errors.source_description ? 'border-red-500' : 'border-gray-300'
        ]"
        :disabled="isSubmitting"
        @blur="validateField('source_description')"
        @input="clearFieldError('source_description')"
      />
      <p v-if="errors.source_description" class="mt-1 text-sm text-red-600">{{ errors.source_description }}</p>
    </div>

    <!-- Form Actions -->
    <div class="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        @click="handleCancel"
        :disabled="isSubmitting"
        class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isSubmitting || !isFormValid"
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
      >
        <svg
          v-if="isSubmitting"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        {{ isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update Contact' : 'Add Contact') }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { Contact, ContactInput, ContactType, ValidationError } from '~/types'
import { contactValidationSchema, validationMessages } from '~/types/validation'

// Props
interface Props {
  contact?: Contact
  mode?: 'add' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'add'
})

// Emits
const emit = defineEmits<{
  submit: [data: ContactInput]
  cancel: []
}>()

// Form state
const isSubmitting = ref(false)
const errors = reactive<Record<string, string>>({})

// Form data
const formData = reactive<ContactInput>({
  name: '',
  email: '',
  phone_number: '',
  business_sector: '',
  business_name: '',
  business_details: '',
  contact_type: '' as ContactType,
  source_description: ''
})

// Initialize form data if editing
onMounted(() => {
  if (props.mode === 'edit' && props.contact) {
    formData.name = props.contact.name
    formData.email = props.contact.email
    formData.phone_number = props.contact.phone_number || ''
    formData.business_sector = props.contact.business_sector || ''
    formData.business_name = props.contact.business_name || ''
    formData.business_details = props.contact.business_details || ''
    formData.contact_type = props.contact.contact_type
    formData.source_description = props.contact.contact_meta?.source_description || ''
  }
})

// Watch for contact prop changes (for edit mode)
watch(() => props.contact, (newContact) => {
  if (props.mode === 'edit' && newContact) {
    formData.name = newContact.name
    formData.email = newContact.email
    formData.phone_number = newContact.phone_number || ''
    formData.business_sector = newContact.business_sector || ''
    formData.business_name = newContact.business_name || ''
    formData.business_details = newContact.business_details || ''
    formData.contact_type = newContact.contact_type
    formData.source_description = newContact.contact_meta?.source_description || ''
  }
}, { deep: true })

// Validation functions
const validateField = (fieldName: keyof ContactInput): ValidationError | null => {
  const value = formData[fieldName]
  const rule = contactValidationSchema[fieldName]
  
  if (!rule) return null

  // Required validation
  if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    errors[fieldName] = validationMessages.required
    return { field: fieldName, message: validationMessages.required }
  }

  // Skip other validations if field is empty and not required
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return null
  }

  const stringValue = String(value).trim()

  // Email validation
  if (rule.email && fieldName === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(stringValue)) {
      errors[fieldName] = validationMessages.email
      return { field: fieldName, message: validationMessages.email }
    }
  }

  // Phone validation
  if (rule.phone && fieldName === 'phone_number') {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(stringValue.replace(/[\s\-\(\)]/g, ''))) {
      errors[fieldName] = validationMessages.phone
      return { field: fieldName, message: validationMessages.phone }
    }
  }

  // Min length validation
  if (rule.minLength && stringValue.length < rule.minLength) {
    errors[fieldName] = validationMessages.minLength(rule.minLength)
    return { field: fieldName, message: validationMessages.minLength(rule.minLength) }
  }

  // Max length validation
  if (rule.maxLength && stringValue.length > rule.maxLength) {
    errors[fieldName] = validationMessages.maxLength(rule.maxLength)
    return { field: fieldName, message: validationMessages.maxLength(rule.maxLength) }
  }

  // Pattern validation
  if (rule.pattern && !rule.pattern.test(stringValue)) {
    errors[fieldName] = validationMessages.pattern
    return { field: fieldName, message: validationMessages.pattern }
  }

  return null
}

const clearFieldError = (fieldName: string) => {
  if (errors[fieldName]) {
    delete errors[fieldName]
  }
}

const validateForm = (): boolean => {
  // Clear all errors
  Object.keys(errors).forEach(key => delete errors[key])

  let isValid = true
  const fieldsToValidate: (keyof ContactInput)[] = [
    'name', 'email', 'phone_number', 'business_sector', 
    'business_name', 'business_details', 'contact_type', 'source_description'
  ]

  fieldsToValidate.forEach(field => {
    const error = validateField(field)
    if (error) {
      isValid = false
    }
  })

  return isValid
}

// Computed properties
const isFormValid = computed(() => {
  // Check required fields
  const requiredFields = ['name', 'email', 'contact_type', 'source_description']
  const hasRequiredFields = requiredFields.every(field => {
    const value = formData[field as keyof ContactInput]
    return value && String(value).trim() !== ''
  })

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0

  return hasRequiredFields && !hasErrors
})

// Event handlers
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  
  try {
    // Create a clean copy of form data
    const submitData: ContactInput = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone_number: formData.phone_number?.trim() || undefined,
      business_sector: formData.business_sector?.trim() || undefined,
      business_name: formData.business_name?.trim() || undefined,
      business_details: formData.business_details?.trim() || undefined,
      contact_type: formData.contact_type,
      source_description: formData.source_description.trim()
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}
</script>