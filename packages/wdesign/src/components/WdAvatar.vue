<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdAvatar' })

const props = withDefaults(
  defineProps<{
    name?: string
    /** 0 = 根据名字自动分配 */
    tone?: 0 | 1 | 2 | 3
    dark?: boolean
    size?: 'md' | 'sm'
  }>(),
  { name: '', tone: 0, dark: false, size: 'md' },
)

const label = computed(() => {
  const n = props.name.trim()
  if (!n) return '?'
  if (n.startsWith('+')) return n
  return n.charAt(0)
})

const resolvedTone = computed(() => {
  if (props.tone) return props.tone
  if (!props.name) return 0
  let hash = 0
  for (const ch of props.name) hash = (hash * 31 + ch.charCodeAt(0)) % 3
  return (hash + 1) as 1 | 2 | 3
})

const classes = computed(() => [
  'wd-avatar',
  resolvedTone.value ? `wd-avatar--tone-${resolvedTone.value}` : '',
  props.dark ? 'wd-avatar--dark' : '',
  props.size === 'sm' ? 'wd-avatar--sm' : '',
])
</script>

<template>
  <span :class="classes">{{ label }}</span>
</template>
