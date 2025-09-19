// Validation types and schemas

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  phone?: boolean
  custom?: (value: any) => boolean | string
}

export interface ValidationSchema {
  [field: string]: ValidationRule
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

// Contact form validation schema
export const contactValidationSchema: ValidationSchema = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 100
  },
  email: {
    required: true,
    email: true,
    maxLength: 255
  },
  phone_number: {
    phone: true,
    maxLength: 20
  },
  business_sector: {
    maxLength: 100
  },
  business_name: {
    maxLength: 200
  },
  business_details: {
    maxLength: 1000
  },
  contact_type: {
    required: true
  },
  source_description: {
    required: true,
    minLength: 10,
    maxLength: 500
  }
}

// User authentication validation schema
export const authValidationSchema: ValidationSchema = {
  email: {
    required: true,
    email: true,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  }
}

// Validation error messages
export const validationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  phone: 'Please enter a valid phone number',
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Must be no more than ${max} characters long`,
  pattern: 'Please enter a valid format',
  password: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
} as const

// Field validation function type
export type FieldValidator = (value: any, rule: ValidationRule) => ValidationError | null

// Form validation function type
export type FormValidator<T = any> = (data: T, schema: ValidationSchema) => ValidationResult