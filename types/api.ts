import type { UserRole, Contact, ContactInput, User } from './index'

// Server API Request/Response Types
export interface UpdateUserRoleRequest {
  targetUserId: string
  newRole?: UserRole
  isApproved?: boolean
}

export interface UpdateUserRoleResponse {
  success: boolean
  message?: string
  error?: string
}

// Contact API Types
export interface CreateContactRequest {
  contact: ContactInput
}

export interface CreateContactResponse {
  success: boolean
  data?: Contact
  error?: string
}

export interface UpdateContactRequest {
  id: string
  updates: Partial<ContactInput>
}

export interface UpdateContactResponse {
  success: boolean
  data?: Contact
  error?: string
}

export interface DeleteContactRequest {
  id: string
}

export interface DeleteContactResponse {
  success: boolean
  error?: string
}

export interface GetContactsRequest {
  userId?: string
  filters?: {
    search?: string
    contactType?: string
    businessSector?: string
  }
  pagination?: {
    page: number
    limit: number
  }
  sorting?: {
    field: string
    order: 'asc' | 'desc'
  }
}

export interface GetContactsResponse {
  success: boolean
  data?: {
    contacts: Contact[]
    total: number
    page: number
    limit: number
  }
  error?: string
}

// User Management API Types
export interface GetUsersRequest {
  filters?: {
    role?: UserRole
    isApproved?: boolean
  }
}

export interface GetUsersResponse {
  success: boolean
  data?: User[]
  error?: string
}

// Authentication API Types
export interface SignUpRequest {
  email: string
  password: string
}

export interface SignUpResponse {
  success: boolean
  data?: {
    user: User | null
    needsConfirmation: boolean
  }
  error?: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface SignInResponse {
  success: boolean
  data?: {
    user: User
    session: any
  }
  error?: string
}

// Supabase Auth Response Type
export interface AuthResponse {
  data: {
    user: any
    session: any
  }
  error: any
}

// Generic API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

// Error Types
export interface ApiError {
  code: string
  message: string
  details?: any
  field?: string
}

export interface ValidationErrors {
  [field: string]: string[]
}

// HTTP Status Codes
export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500
}

// Request Headers
export interface ApiHeaders {
  'Content-Type'?: string
  'Authorization'?: string
  'X-Request-ID'?: string
}