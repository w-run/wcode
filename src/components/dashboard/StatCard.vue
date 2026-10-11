<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string
    label: string
    value: number | string
    /** 浅底色块类别：accent / success / warning */
    variant?: 'accent' | 'success' | 'warning'
  }>(),
  {
    variant: 'accent',
  },
)
</script>

<template>
  <article class="stat-card" :class="`stat-card--${variant}`">
    <div class="stat-card__icon" aria-hidden="true" v-html="icon" />
    <div class="stat-card__content">
      <span class="stat-card__value">{{ value }}</span>
      <span class="stat-card__label">{{ label }}</span>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.stat-card {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-6;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition: box-shadow $transition-fast;

  &:hover {
    box-shadow: $shadow-md;
  }

  &--accent {
    background: $color-accent-light;
  }

  &--success {
    background: $color-success-light;
  }

  &--warning {
    background: $color-warning-light;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: $radius-full;
    background: $color-surface;

    :deep(svg) {
      width: 22px;
      height: 22px;
    }
  }

  &--accent &__icon {
    color: $color-accent;
  }

  &--success &__icon {
    color: $color-success;
  }

  &--warning &__icon {
    color: $color-warning;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $space-1;
    min-width: 0;
  }

  &__value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: $color-text;
    font-variant-numeric: tabular-nums;
  }

  &__label {
    font-size: 0.8125rem;
    color: $color-text-muted;
    line-height: 1;
  }
}
</style>
