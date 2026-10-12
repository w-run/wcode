<script setup lang="ts">
/**
 * 兼容适配层：渲染 wdesign 的 WdAvatar（字母头像）。
 * wdesign 头像为字姓首字母体系，故忽略旧的 src 图片属性。
 */
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    alt?: string
    size?: Size
  }>(),
  { src: '', name: '', alt: '', size: 'md' },
)
</script>

<template>
  <WdAvatar
    :name="props.name || props.alt"
    :size="props.size === 'lg' ? 'md' : props.size"
  />
</template>
