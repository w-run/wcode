<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdBadge' })

const props = withDefaults(
  defineProps<{
    value?: number | string
    dot?: boolean
    max?: number
    tone?: 'red' | 'gray'
  }>(),
  { value: '', dot: false, max: 99, tone: 'red' },
)

const display = computed(() => {
  if (typeof props.value === 'number' && props.max && props.value > props.max) {
    return `${props.max}+`
  }
  return props.value
})

const showCount = computed(
  () => !props.dot && props.value !== '' && props.value !== undefined && props.value !== null,
)
</script>

<template>
  <span class="wd-badge" :class="tone === 'gray' ? 'wd-badge--gray' : ''">
    <slot />
    <span v-if="dot" class="wd-badge__dot"></span>
    <span v-else-if="showCount" class="wd-badge__count">{{ display }}</span>
  </span>
</template>
