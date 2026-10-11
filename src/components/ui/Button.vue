<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
  },
)

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
    :type="type"
    :disabled="isDisabled"
    :aria-busy="loading"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true" />
    <span class="btn__label"><slot /></span>
  </button>
</template>

<style lang="scss" scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  border: none;
  border-radius: $radius-full;
  font-family: inherit;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease;

  &:focus-visible {
    outline: 2px solid $color-accent;
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__label {
    display: inline-flex;
    align-items: center;
    gap: $space-2;
  }

  &__spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: $radius-full;
    animation: btn-spin 0.6s linear infinite;
  }

  &--sm {
    min-height: 2rem;
    padding: 0 $space-3;
    font-size: 0.8125rem;
  }

  &--md {
    min-height: 2.75rem;
    padding: 0 $space-4;
    font-size: 0.875rem;
  }

  &--lg {
    min-height: 3rem;
    padding: 0 $space-6;
    font-size: 1rem;
  }

  &--primary {
    background: $color-accent;
    color: $color-surface;

    &:hover:not(:disabled) {
      background: $color-accent-hover;
      box-shadow: $shadow-accent;
    }
  }

  &--secondary {
    background: $color-surface;
    color: $color-text;
    box-shadow: $shadow-sm;

    &:hover:not(:disabled) {
      background: $color-surface-2;
    }
  }

  &--ghost {
    background: transparent;
    color: $color-text;

    &:hover:not(:disabled) {
      background: $color-surface-2;
    }
  }

  &--danger {
    background: $color-danger;
    color: $color-surface;

    &:hover:not(:disabled) {
      box-shadow: $shadow-md;
    }
  }
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
