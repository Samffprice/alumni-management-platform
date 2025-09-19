import { ref, computed, type Ref } from 'vue'

interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
}

interface LoadingOptions {
  message?: string
  timeout?: number
  showProgress?: boolean
}

// Global loading states for different operations
const globalLoadingStates = ref<Map<string, LoadingState>>(new Map())

export const useLoading = (key?: string) => {
  const loadingKey = key || 'default'
  const localLoading = ref(false)
  const localMessage = ref<string>()
  const localProgress = ref<number>()

  /**
   * Set loading state
   */
  const setLoading = (
    loading: boolean,
    options: LoadingOptions = {}
  ) => {
    const { message, timeout } = options

    if (key) {
      // Update global loading state
      if (loading) {
        globalLoadingStates.value.set(loadingKey, {
          isLoading: true,
          message,
          progress: options.showProgress ? 0 : undefined
        })
      } else {
        globalLoadingStates.value.delete(loadingKey)
      }
    } else {
      // Update local loading state
      localLoading.value = loading
      localMessage.value = message
      localProgress.value = options.showProgress ? 0 : undefined
    }

    // Auto-clear loading after timeout
    if (loading && timeout) {
      setTimeout(() => {
        setLoading(false)
      }, timeout)
    }
  }

  /**
   * Update loading progress (0-100)
   */
  const setProgress = (progress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, progress))
    
    if (key) {
      const state = globalLoadingStates.value.get(loadingKey)
      if (state) {
        globalLoadingStates.value.set(loadingKey, {
          ...state,
          progress: clampedProgress
        })
      }
    } else {
      localProgress.value = clampedProgress
    }
  }

  /**
   * Execute async operation with loading state
   */
  const withLoading = async <T>(
    operation: () => Promise<T>,
    options: LoadingOptions = {}
  ): Promise<T> => {
    setLoading(true, options)
    
    try {
      const result = await operation()
      return result
    } finally {
      setLoading(false)
    }
  }

  /**
   * Execute async operation with progress tracking
   */
  const withProgress = async <T>(
    operation: (updateProgress: (progress: number) => void) => Promise<T>,
    options: Omit<LoadingOptions, 'showProgress'> = {}
  ): Promise<T> => {
    setLoading(true, { ...options, showProgress: true })
    
    try {
      const result = await operation((progress) => {
        setProgress(progress)
      })
      return result
    } finally {
      setLoading(false)
    }
  }

  // Computed properties
  const isLoading = computed(() => {
    if (key) {
      return globalLoadingStates.value.get(loadingKey)?.isLoading || false
    }
    return localLoading.value
  })

  const loadingMessage = computed(() => {
    if (key) {
      return globalLoadingStates.value.get(loadingKey)?.message
    }
    return localMessage.value
  })

  const loadingProgress = computed(() => {
    if (key) {
      return globalLoadingStates.value.get(loadingKey)?.progress
    }
    return localProgress.value
  })

  const hasProgress = computed(() => {
    return loadingProgress.value !== undefined
  })

  // Global loading state helpers
  const isAnyLoading = computed(() => {
    return globalLoadingStates.value.size > 0
  })

  const getAllLoadingStates = computed(() => {
    return Array.from(globalLoadingStates.value.entries()).map(([key, state]) => ({
      key,
      ...state
    }))
  })

  /**
   * Clear all loading states
   */
  const clearAllLoading = () => {
    globalLoadingStates.value.clear()
    localLoading.value = false
    localMessage.value = undefined
    localProgress.value = undefined
  }

  /**
   * Clear specific loading state
   */
  const clearLoading = (targetKey?: string) => {
    const keyToClear = targetKey || loadingKey
    
    if (keyToClear === 'default' && !key) {
      localLoading.value = false
      localMessage.value = undefined
      localProgress.value = undefined
    } else {
      globalLoadingStates.value.delete(keyToClear)
    }
  }

  return {
    // Loading state
    isLoading,
    loadingMessage,
    loadingProgress,
    hasProgress,
    
    // Loading actions
    setLoading,
    setProgress,
    withLoading,
    withProgress,
    clearLoading,
    
    // Global loading state
    isAnyLoading,
    getAllLoadingStates,
    clearAllLoading
  }
}

/**
 * Composable for managing multiple loading states
 */
export const useMultipleLoading = () => {
  const loadingStates = ref<Map<string, boolean>>(new Map())
  const loadingMessages = ref<Map<string, string>>(new Map())

  const setLoading = (key: string, loading: boolean, message?: string) => {
    if (loading) {
      loadingStates.value.set(key, true)
      if (message) {
        loadingMessages.value.set(key, message)
      }
    } else {
      loadingStates.value.delete(key)
      loadingMessages.value.delete(key)
    }
  }

  const isLoading = (key: string) => {
    return loadingStates.value.get(key) || false
  }

  const getMessage = (key: string) => {
    return loadingMessages.value.get(key)
  }

  const isAnyLoading = computed(() => {
    return loadingStates.value.size > 0
  })

  const getLoadingKeys = computed(() => {
    return Array.from(loadingStates.value.keys())
  })

  const clearAll = () => {
    loadingStates.value.clear()
    loadingMessages.value.clear()
  }

  return {
    setLoading,
    isLoading,
    getMessage,
    isAnyLoading,
    getLoadingKeys,
    clearAll
  }
}