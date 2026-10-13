<script setup lang="ts">
defineOptions({ name: 'WdContainer' })

withDefaults(
  defineProps<{
    maxWidth?: string
    pad?: 'sm' | 'md' | 'lg'
  }>(),
  { maxWidth: '1200px', pad: 'md' },
)
</script>

<template>
  <div
    class="wd-container"
    :style="{
      maxWidth,
      paddingInline: { sm: 'var(--wd-space-3)', md: 'var(--wd-space-4)', lg: 'var(--wd-space-6)' }[pad],
    }"
  >
    <slot />
  </div>
</template>
