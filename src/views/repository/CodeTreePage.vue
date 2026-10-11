<script setup lang="ts">
defineProps<{
  owner: string
  name: string
  refName?: string
  path?: string | string[]
}>()
</script>

<template>
  <div class="code-tree-page">代码浏览（待实现）</div>
</template>

<style lang="scss" scoped>
.code-tree-page {
  color: $color-text-muted;
}
</style>
