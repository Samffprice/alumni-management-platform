export default defineNuxtPlugin(() => {
  // Initialize global error handling on client side
  
  // Handle Vue errors
  const vueApp = useNuxtApp().vueApp
  vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue error:', error, info)
    
    // Try to use error handler if available
    try {
      const { handleError } = useErrorHandler()
      handleError(error, 'Vue Component', {
        showNotification: true,
        retryable: false
      })
    } catch (e) {
      console.error('Error handler not available:', e)
    }
  }

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    try {
      const { handleError } = useErrorHandler()
      handleError(event.reason, 'Promise Rejection', {
        showNotification: true,
        retryable: true
      })
    } catch (e) {
      console.error('Error handler not available:', e)
    }
  })

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error)
    
    try {
      const { handleError } = useErrorHandler()
      handleError(event.error, 'JavaScript Error', {
        showNotification: true,
        retryable: false
      })
    } catch (e) {
      console.error('Error handler not available:', e)
    }
  })

  // Handle network connectivity
  window.addEventListener('online', () => {
    try {
      const { showSuccess } = useNotifications()
      showSuccess('Connection Restored', 'You are back online')
    } catch (e) {
      console.log('Connection restored')
    }
  })

  window.addEventListener('offline', () => {
    try {
      const { showError } = useNotifications()
      showError(
        'Connection Lost', 
        'You are currently offline. Some features may not work properly.',
        { autoDismiss: false }
      )
    } catch (e) {
      console.warn('Connection lost - you are offline')
    }
  })
})