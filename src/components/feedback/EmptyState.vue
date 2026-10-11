<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </slot>
    </div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="description" class="empty-desc">{{ description }}</p>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $space-12 $space-6;
  background: $color-surface-2;
  border-radius: $radius-lg;
  text-align: center;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $space-4;
  color: $color-text-muted;
  opacity: 0.6;
}

.empty-title {
  margin: 0 0 $space-2;
  font-size: 16px;
  font-weight: 600;
  color: $color-text;
  line-height: 1.4;
}

.empty-desc {
  margin: 0;
  font-size: 14px;
  color: $color-text-muted;
  line-height: 1.6;
  max-width: 300px;
}

.empty-action {
  margin-top: $space-6;
}
</style>
