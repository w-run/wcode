<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdCard' })

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'tint' | 'dark'
    padding?: 'sm' | 'md' | 'lg'
    hoverable?: boolean
  }>(),
  { variant: 'default', padding: 'md', hoverable: false },
)

const classes = computed(() => [
  'wd-card',
  props.variant !== 'default' ? `wd-card--${props.variant}` : '',
  props.padding !== 'md' ? `wd-card--pad-${props.padding}` : '',
  props.hoverable ? 'wd-card--hoverable' : '',
])
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
