<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdGrid' })

const props = withDefaults(
  defineProps<{
    columns?: number | 'auto'
    gap?: 'sm' | 'md' | 'lg'
    gutter?: number  // 旧版兼容
  }>(),
  { columns: 1, gap: 'md' },
)

const cols = computed(() => {
  if (props.columns === 'auto') return 'repeat(auto-fit, minmax(200px, 1fr))'
  return `repeat(${props.columns}, 1fr)`
})

const gapValue = computed(() => {
  if (props.gutter) `${props.gutter}px`
  const val = { sm: 8, md: 16, lg: 24 }[props.gap] || 16
  return `${val}px`
})
</script>

<template>
  <div class="wd-grid" :style="{ gridTemplateColumns: cols, gap: gapValue }">
    <slot />
  </div>
</template>
