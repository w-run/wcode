<script setup lang="ts">
defineProps<{
  owner: string
  name: string
}>()
</script>

<template>
  <div class="repo-pulls-page">PR 列表（待实现）</div>
</template>

<style lang="scss" scoped>
.repo-pulls-page {
  color: $color-text-muted;
}
</style>
