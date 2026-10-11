<script setup lang="ts">
import { computed, ref } from 'vue'

type AvatarSize = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    alt?: string
    size?: AvatarSize
  }>(),
  {
    src: '',
    name: '',
    alt: '',
    size: 'md',
  },
)

const hasError = ref(false)

const showFallback = computed(() => !props.src || hasError.value)
const initial = computed(() => props.name.trim().charAt(0).toUpperCase() || '?')
const altText = computed(() => props.alt || props.name)
</script>

<template>
  <span class="avatar" :class="`avatar--${size}`">
    <img
      v-if="!showFallback"
      class="avatar__img"
      :src="src"
      :alt="altText"
      @error="hasError = true"
    />
    <span v-else class="avatar__fallback" aria-hidden="true">{{
      initial
    }}</span>
  </span>
</template>

<style lang="scss" scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: $radius-full;
  background: $color-surface-2;
  color: $color-text-muted;
  font-weight: 600;

  &__img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__fallback {
    line-height: 1;
  }

  &--sm {
    width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }

  &--md {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 0.9375rem;
  }

  &--lg {
    width: 3rem;
    height: 3rem;
    font-size: 1.125rem;
  }
}
</style>
