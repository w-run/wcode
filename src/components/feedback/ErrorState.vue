<template>
  <div class="error-state">
    <div class="error-icon">
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <p class="error-message">{{ message }}</p>
    <button
      v-if="retryable"
      class="retry-btn"
      type="button"
      @click="$emit('retry')"
    >
      重试
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
    retryable?: boolean
  }>(),
  {
    message: '出了点问题，请稍后再试',
    retryable: true,
  },
)

defineEmits<{
  retry: []
}>()
</script>

<style lang="scss" scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-8 $space-6;
  background: $color-danger-light;
  border-radius: $radius-lg;
  text-align: center;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-3;
  color: $color-danger;
}

.error-message {
  margin: 0;
  font-size: 14px;
  color: $color-danger;
  line-height: 1.6;
  max-width: 300px;
}

.retry-btn {
  margin-top: $space-4;
  padding: $space-2 $space-6;
  background: $color-accent;
  color: #fff;
  border: none;
  border-radius: $radius-full;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background $transition-fast,
    box-shadow $transition-fast;
  min-height: 44px;

  &:hover {
    background: $color-accent-hover;
    box-shadow: $shadow-accent;
  }
}
</style>
