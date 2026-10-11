<script setup lang="ts">
type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'danger'

withDefaults(
  defineProps<{
    variant?: BadgeVariant
  }>(),
  {
    variant: 'default',
  },
)
</script>

<template>
  <span class="badge" :class="`badge--${variant}`"><slot /></span>
</template>

<style lang="scss" scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: $space-1;
  padding: $space-1 $space-3;
  border-radius: $radius-full;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;

  &--default {
    background: $color-surface-2;
    color: $color-text-muted;
  }

  &--accent {
    background: $color-accent-light;
    color: $color-accent;
  }

  &--success {
    background: $color-success-light;
    color: $color-success;
  }

  &--warning {
    background: $color-warning-light;
    color: $color-warning;
  }

  &--danger {
    background: $color-danger-light;
    color: $color-danger;
  }
}
</style>
