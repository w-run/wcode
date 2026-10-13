<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdSpace' })

const props = withDefaults(
  defineProps<{
    /** 间距档位（或直接给像素数字） */
    size?: 'sm' | 'md' | 'lg' | number
    /** 排列方向 */
    direction?: 'row' | 'col'
    /** 是否换行 */
    wrap?: boolean
    /** 两端对齐 */
    between?: boolean
    /** 居中 */
    center?: boolean
    /** 子项等分拉伸 */
    grow?: boolean
  }>(),
  { size: 'md', direction: 'row', wrap: false, between: false, center: false, grow: false },
)

const gap = computed(() => {
  if (typeof props.size === 'number') return `${props.size}px`
  return { sm: 'var(--wd-space-2)', md: 'var(--wd-space-3)', lg: 'var(--wd-space-6)' }[props.size]
})
</script>

<template>
  <div
    class="wd-space"
    :class="{
      'wd-space--col': direction === 'col',
      'wd-space--wrap': wrap,
      'wd-space--between': between,
      'wd-space--center': center,
      'wd-space--grow': grow,
    }"
    :style="{ gap }"
  >
    <slot />
  </div>
</template>
