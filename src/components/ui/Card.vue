<script setup lang="ts">
/**
 * 兼容适配层：渲染 wdesign 的 WdCard（白底 · 大圆角 · 单层阴影 · 无边框）。
 */
const props = withDefaults(
  defineProps<{
    padding?: boolean
  }>(),
  { padding: true },
)
</script>

<template>
  <WdCard :padding="props.padding ? 'md' : 'sm'">
    <slot />
  </WdCard>
</template>
