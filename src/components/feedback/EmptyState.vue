<script setup lang="ts">
/**
 * 兼容适配层：渲染 wdesign 的 WdEmpty（icon / description / action 插槽透传）。
 */
const props = defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <WdEmpty :title="props.title" :description="props.description">
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    <template v-if="$slots.action" #action>
      <slot name="action" />
    </template>
  </WdEmpty>
</template>
