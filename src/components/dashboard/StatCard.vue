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
  gap: var(--wd-space-4);
  padding: var(--wd-space-6);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
  transition: box-shadow var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    box-shadow: var(--wd-shadow);
  }

  &--accent {
    background: var(--wd-tint-2);
  }

  &--success {
    background: var(--wd-success-soft);
  }

  &--warning {
    background: var(--wd-warning-soft);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    border-radius: var(--wd-radius-pill);
    background: var(--wd-card);

    :deep(svg) {
      width: 22px;
      height: 22px;
    }
  }

  &--accent &__icon {
    color: var(--wd-red);
  }

  &--success &__icon {
    color: var(--wd-success);
  }

  &--warning &__icon {
    color: var(--wd-warning);
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: var(--wd-space-1);
    min-width: 0;
  }

  &__value {
    font-size: 1.5rem;
    font-weight: 700;
    line-height: 1;
    color: var(--wd-ink);
    font-variant-numeric: tabular-nums;
  }

  &__label {
    font-size: 0.8125rem;
    color: var(--wd-ink-2);
    line-height: 1;
  }
}
</style>
