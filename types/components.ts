import type { Contact, ContactInput, User, UserRole, ContactType, ValidationError } from './index'

// UI Component Types
export interface UIMessageProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timeout?: number
  dismissible?: boolean
}

// Form Component Types
export interface ContactFormEmits {
  submit: [contact: ContactInput]
  cancel: []
}

export interface ContactFormState {
  formData: ContactInput
  errors: ValidationError[]
  isSubmitting: boolean
  isDirty: boolean
}

// Table Component Types
export interface ContactTableEmits {
  edit: [contact: Contact]
  delete: [contactId: string]
  view: [contact: Contact]
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface TableAction {
  label: string
  icon?: string
  variant: 'primary' | 'secondary' | 'danger'
  permission?: UserRole[]
  handler: (item: any) => void
}

// User Management Component Types
export interface UserManagementEmits {
  approveUser: [userId: string]
  changeRole: [userId: string, newRole: UserRole]
}

export interface UserTableRow {
  id: string
  email: string
  role: UserRole
  is_approved: boolean
  created_at: string
}

// Navigation Component Types
export interface NavItem {
  label: string
  path: string
  icon?: string
  requiredRole?: UserRole[]
  exact?: boolean
}

export interface AppHeaderProps {
  user: User | null
  userRole: UserRole
}

// Modal Component Types
export interface ModalProps {
  isOpen: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
}

export interface ModalEmits {
  close: []
  confirm: []
  cancel: []
}

// Confirmation Dialog Types
export interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

// Loading State Types
export interface LoadingState {
  isLoading: boolean
  message?: string
}

// Pagination Types
export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  showInfo?: boolean
}

export interface PaginationEmits {
  pageChange: [page: number]
  pageSizeChange: [size: number]
}