<script setup lang="ts">
defineProps<{
  owner: string
  name: string
}>()
</script>

<template>
  <div class="repo-detail-page">仓库详情：{{ owner }}/{{ name }}（待实现）</div>
</template>

<style lang="scss" scoped>
.repo-detail-page {
  color: $color-text-muted;
}
</style>
