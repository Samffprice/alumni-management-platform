<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
    <TransitionGroup
      name="notification"
      tag="div"
      class="space-y-2"
    >
      <UIMessage
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :title="notification.title"
        :message="notification.message"
        :auto-dismiss="notification.autoDismiss"
        :timeout="notification.timeout"
        @dismiss="removeNotification(notification.id)"
        class="pointer-events-auto"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
const { notifications, removeNotification } = useNotifications()
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.3s ease;
}
</style>