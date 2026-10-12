<script setup lang="ts">
/**
 * 兼容适配层：渲染 wdesign 的 WdSkeleton。
 */
const props = withDefaults(
  defineProps<{
    width?: string
    height?: string
    borderRadius?: string
  }>(),
  { width: '100%', height: '16px', borderRadius: '8px' },
)
</script>

<template>
  <WdSkeleton
    variant="rect"
    :width="props.width"
    :height="props.height"
    :count="1"
  />
</template>
