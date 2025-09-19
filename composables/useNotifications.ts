import { ref, readonly, type Component } from 'vue'

export interface UIMessageProps {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  autoDismiss?: boolean
  timeout?: number
}

interface NotificationItem extends UIMessageProps {
  id: string
  component?: Component
}

const notifications = ref<NotificationItem[]>([])

export const useNotifications = () => {
  const addNotification = (notification: Omit<UIMessageProps, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    const notificationItem: NotificationItem = {
      ...notification,
      id
    }
    
    notifications.value.push(notificationItem)
    
    return id
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearAllNotifications = () => {
    notifications.value = []
  }

  // Convenience methods for different notification types
  const showSuccess = (title: string, message?: string, options?: Partial<UIMessageProps>) => {
    return addNotification({
      type: 'success',
      title,
      message,
      ...options
    })
  }

  const showError = (title: string, message?: string, options?: Partial<UIMessageProps>) => {
    return addNotification({
      type: 'error',
      title,
      message,
      autoDismiss: false, // Errors should not auto-dismiss by default
      ...options
    })
  }

  const showWarning = (title: string, message?: string, options?: Partial<UIMessageProps>) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      ...options
    })
  }

  const showInfo = (title: string, message?: string, options?: Partial<UIMessageProps>) => {
    return addNotification({
      type: 'info',
      title,
      message,
      ...options
    })
  }

  return {
    notifications: readonly(notifications),
    addNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}