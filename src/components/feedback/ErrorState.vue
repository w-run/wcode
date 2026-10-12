<script setup lang="ts">
/**
 * 兼容适配层：渲染 wdesign 的 WdResult（error 状态）+ WdButton 重试。
 */
const props = withDefaults(
  defineProps<{
    message?: string
    retryable?: boolean
  }>(),
  {
    message: '出了点问题，请稍后再试',
    retryable: true,
  },
)

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <WdResult status="error" title="加载失败" :description="props.message">
    <template v-if="props.retryable" #extra>
      <WdButton variant="tint" size="sm" @click="emit('retry')">重试</WdButton>
    </template>
  </WdResult>
</template>
