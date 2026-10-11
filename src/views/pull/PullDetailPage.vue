<script setup lang="ts">
defineProps<{
  owner: string
  name: string
  number: string
}>()
</script>

<template>
  <div class="pull-detail-page">PR 详情（待实现）</div>
</template>

<style lang="scss" scoped>
.pull-detail-page {
  color: $color-text-muted;
}
</style>
