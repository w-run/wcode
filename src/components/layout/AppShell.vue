<template>
  <div class="app-shell">
    <slot />
  </div>
</template>

<script setup lang="ts">
// AppShell: 响应式布局根容器
</script>

<style lang="scss" scoped>
.app-shell {
  min-height: 100vh;
  background: var(--wd-bg);
}
</style>
