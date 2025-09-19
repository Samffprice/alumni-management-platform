import { AuthResponse } from './api'

import { AuthResponse } from './api'

// Re-export all types from individual modules
export * from './database'
export * from './components'
export * from './api'
export * from './utils'
export * from './validation'

// Core Types
export type UserRole = 'member' | 'officer' | 'vp'
export type ContactType = 'Alumni' | 'Mentor' | 'Other'

// Contact Interface
export interface Contact {
  id: string
  name: string
  email: string
  phone_number?: string
  business_sector?: string
  business_name?: string
  business_details?: string
  contact_type: ContactType
  created_at: string
  added_by: string
  contact_meta?: ContactMeta
}

// Contact Meta Interface
export interface ContactMeta {
  id: string
  contact_id: string
  source_description: string
  created_at: string
}

// Contact Input Interface for form submissions
export interface ContactInput {
  name: string
  email: string
  phone_number?: string
  business_sector?: string
  business_name?: string
  business_details?: string
  contact_type: ContactType
  source_description: string
}

// User Interface
export interface User {
  id: string
  email: string
  app_metadata: {
    role: UserRole
    is_approved: boolean
  }
}

// Form Validation Types
export interface ValidationError {
  field: string
  message: string
}

export interface FormState {
  isValid: boolean
  errors: ValidationError[]
  isSubmitting: boolean
}

// Database Operation Types
export interface ContactOperations {
  fetchContacts(userId?: string): Promise<Contact[]>
  addContact(contact: ContactInput): Promise<Contact>
  updateContact(id: string, updates: Partial<Contact>): Promise<Contact>
  deleteContact(id: string): Promise<void>
}

export interface AuthOperations {
  signUp(email: string, password: string): Promise<AuthResponse>
  signIn(email: string, password: string): Promise<AuthResponse>
  signOut(): Promise<void>
  getUser(): Promise<User | null>
}

// Pinia Store Types
export interface UserState {
  user: User | null
  role: UserRole
  is_approved: boolean
  loading: boolean
}

export interface UserActions {
  fetchUser(): Promise<void>
  clearUser(): void
  updateUserState(user: User): void
}

// Search and Filter Types
export interface ContactFilters {
  search?: string
  contactType?: ContactType
  businessSector?: string
}

export interface SearchParams {
  query: string
  filters: ContactFilters
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// User Management Types
export interface UserManagement {
  id: string
  email: string
  role: UserRole
  is_approved: boolean
  created_at: string
}

export interface UpdateUserRoleRequest {
  targetUserId: string
  newRole?: UserRole
  isApproved?: boolean
}

export interface UpdateUserRoleResponse {
  success: boolean
  error?: string
}