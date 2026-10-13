<script setup lang="ts">
defineOptions({ name: 'WdTag' })

withDefaults(
  defineProps<{
    variant?: 'tint' | 'gray' | 'dark'
    size?: 'lg' | 'md' | 'sm'
    dot?: boolean
  }>(),
  { variant: 'tint', dot: false },
)
</script>

<template>
  <span class="wd-tag" :class="[`wd-tag--${variant}`, { 'wd-tag--lg': size === 'lg', 'wd-tag--sm': size === 'sm' }]">
    <i v-if="dot" class="wd-tag__dot"></i>
    <slot />
  </span>
</template>
