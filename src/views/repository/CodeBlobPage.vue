<script setup lang="ts">
defineProps<{
  owner: string
  name: string
  refName?: string
  path?: string | string[]
}>()
</script>

<template>
  <div class="code-blob-page">文件查看（待实现）</div>
</template>

<style lang="scss" scoped>
.code-blob-page {
  color: $color-text-muted;
}
</style>
