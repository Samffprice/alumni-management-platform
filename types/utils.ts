// Utility types for common patterns

// Make all properties optional
export type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Make all properties required
export type Required<T> = {
  [P in keyof T]-?: T[P]
}

// Pick specific properties from a type
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// Omit specific properties from a type
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// Create a type with some properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Create a type with some properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// Nullable type
export type Nullable<T> = T | null

// Optional type
export type Optional<T> = T | undefined

// Array element type
export type ArrayElement<T> = T extends (infer U)[] ? U : never

// Function return type
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// Promise value type
export type PromiseValue<T> = T extends Promise<infer U> ? U : T

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Key-value pair type
export type KeyValuePair<K extends string | number | symbol = string, V = any> = {
  [key in K]: V
}

// String literal union helper
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

// Branded types for type safety
export type Brand<T, B> = T & { __brand: B }

// ID types
export type UserId = Brand<string, 'UserId'>
export type ContactId = Brand<string, 'ContactId'>
export type ContactMetaId = Brand<string, 'ContactMetaId'>

// Timestamp types
export type Timestamp = Brand<string, 'Timestamp'>
export type ISODateString = Brand<string, 'ISODateString'>

// Email type
export type Email = Brand<string, 'Email'>

// Phone number type
export type PhoneNumber = Brand<string, 'PhoneNumber'>

// URL type
export type URL = Brand<string, 'URL'>

// Generic event handler type
export type EventHandler<T = Event> = (event: T) => void

// Generic async function type
export type AsyncFunction<T = void, P extends any[] = []> = (...args: P) => Promise<T>

// Generic callback type
export type Callback<T = void, P extends any[] = []> = (...args: P) => T

// Validation result type
export type ValidationResult<T = any> = {
  isValid: boolean
  errors: string[]
  data?: T
}

// Sort order type
export type SortOrder = 'asc' | 'desc'

// Filter operator type
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'not_in'

// Generic filter type
export type Filter<T = any> = {
  field: keyof T
  operator: FilterOperator
  value: any
}

// Generic sort type
export type Sort<T = any> = {
  field: keyof T
  order: SortOrder
}

// Pagination type
export type Pagination = {
  page: number
  limit: number
  offset?: number
}

// Query parameters type
export type QueryParams<T = any> = {
  filters?: Filter<T>[]
  sort?: Sort<T>[]
  pagination?: Pagination
  search?: string
}