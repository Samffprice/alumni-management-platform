import { ref, type Ref } from 'vue'
import type { ApiError } from '~/types'

interface ErrorHandlerOptions {
  showNotification?: boolean
  logError?: boolean
  retryable?: boolean
  maxRetries?: number
}

interface RetryableOperation<T> {
  operation: () => Promise<T>
  maxRetries?: number
  retryDelay?: number
  onRetry?: (attempt: number, error: any) => void
}

const globalErrors = ref<ApiError[]>([])
const isGlobalLoading = ref(false)

export const useErrorHandler = () => {
  const { showError, showWarning } = useNotifications()

  /**
   * Handle errors with consistent formatting and user feedback
   */
  const handleError = (
    error: any,
    context: string = 'Operation',
    options: ErrorHandlerOptions = {}
  ): ApiError => {
    const {
      showNotification = true,
      logError = true,
      retryable = false
    } = options

    // Format error into consistent structure
    const formattedError: ApiError = formatError(error, context)

    // Log error for debugging
    if (logError) {
      logErrorToConsole(formattedError, context)
    }

    // Add to global error state
    globalErrors.value.push(formattedError)

    // Show user notification
    if (showNotification) {
      if (retryable) {
        showWarning(
          'Operation Failed',
          `${formattedError.message}. You can try again.`,
          { autoDismiss: false }
        )
      } else {
        showError(
          'Error',
          formattedError.message,
          { autoDismiss: false }
        )
      }
    }

    return formattedError
  }

  /**
   * Format various error types into consistent ApiError structure
   */
  const formatError = (error: any, context: string): ApiError => {
    // Supabase error
    if (error?.message && error?.code) {
      return {
        code: error.code,
        message: getReadableErrorMessage(error.message, error.code),
        details: {
          originalMessage: error.message,
          context,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your internet connection.',
        details: {
          originalMessage: error.message,
          context,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Validation error
    if (error?.field && error?.message) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        field: error.field,
        details: {
          context,
          timestamp: new Date().toISOString()
        }
      }
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'An unexpected error occurred. Please try again.',
      details: {
        originalError: error,
        context,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Convert technical error messages to user-friendly ones
   */
  const getReadableErrorMessage = (message: string, code?: string): string => {
    const errorMap: Record<string, string> = {
      // Authentication errors
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'User not found': 'No account found with this email address.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      
      // Database errors
      'duplicate key value violates unique constraint': 'This email address is already registered.',
      'new row violates row-level security policy': 'You do not have permission to perform this action.',
      'permission denied': 'You do not have permission to access this resource.',
      
      // Network errors
      'Failed to fetch': 'Unable to connect to the server. Please check your internet connection.',
      'NetworkError': 'Network connection failed. Please try again.',
      
      // Validation errors
      'invalid input syntax': 'Invalid data format. Please check your input and try again.',
      'value too long': 'One or more fields exceed the maximum length allowed.',
    }

    // Check for exact matches first
    if (errorMap[message]) {
      return errorMap[message]
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMap)) {
      if (message.toLowerCase().includes(key.toLowerCase())) {
        return value
      }
    }

    // Return original message if no mapping found
    return message
  }

  /**
   * Log error to console with structured format
   */
  const logErrorToConsole = (error: ApiError, context: string) => {
    console.group(`🚨 Error in ${context}`)
    console.error('Code:', error.code)
    console.error('Message:', error.message)
    if (error.field) {
      console.error('Field:', error.field)
    }
    if (error.details) {
      console.error('Details:', error.details)
    }
    console.groupEnd()
  }

  /**
   * Execute operation with retry logic
   */
  const withRetry = async <T>(
    operation: RetryableOperation<T>
  ): Promise<T> => {
    const {
      operation: op,
      maxRetries = 3,
      retryDelay = 1000,
      onRetry
    } = operation

    let lastError: any
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await op()
      } catch (error) {
        lastError = error
        
        if (attempt === maxRetries) {
          throw error
        }

        // Check if error is retryable
        if (!isRetryableError(error)) {
          throw error
        }

        // Call retry callback if provided
        if (onRetry) {
          onRetry(attempt, error)
        }

        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt - 1)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  /**
   * Check if an error is retryable
   */
  const isRetryableError = (error: any): boolean => {
    // Network errors are retryable
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return true
    }

    // Temporary server errors are retryable
    if (error?.status >= 500 && error?.status < 600) {
      return true
    }

    // Rate limiting errors are retryable
    if (error?.status === 429) {
      return true
    }

    // Timeout errors are retryable
    if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
      return true
    }

    return false
  }

  /**
   * Clear all global errors
   */
  const clearErrors = () => {
    globalErrors.value = []
  }

  /**
   * Remove specific error
   */
  const removeError = (index: number) => {
    if (index >= 0 && index < globalErrors.value.length) {
      globalErrors.value.splice(index, 1)
    }
  }

  /**
   * Set global loading state
   */
  const setGlobalLoading = (loading: boolean) => {
    isGlobalLoading.value = loading
  }

  return {
    // Error handling
    handleError,
    formatError,
    withRetry,
    isRetryableError,
    
    // Error state
    globalErrors: readonly(globalErrors),
    clearErrors,
    removeError,
    
    // Loading state
    isGlobalLoading: readonly(isGlobalLoading),
    setGlobalLoading
  }
}