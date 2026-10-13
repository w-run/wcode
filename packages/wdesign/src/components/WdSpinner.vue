<script setup lang="ts">
defineOptions({ name: 'WdSpinner' })

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <span
    class="wd-spinner"
    :class="size !== 'md' ? `wd-spinner--${size}` : ''"
    role="status"
    aria-label="加载中"
  ></span>
</template>
