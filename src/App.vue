<script setup lang="ts">
import { ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTabBar from '@/components/layout/AppTabBar.vue'

const sidebarOpen = ref(false)
</script>

<template>
  <AppShell>
    <AppHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <AppSidebar v-model="sidebarOpen" />
    <div class="page-content">
      <router-view />
    </div>
    <AppTabBar />
  </AppShell>
</template>

<style lang="scss" scoped>
.page-content {
  padding: $space-4;
  min-height: calc(100vh - 56px);

  // 移动端底部 Tab Bar 占位（内容不被遮挡）
  @include media-down(calc($bp-desktop - 1px)) {
    padding-bottom: calc(56px + env(safe-area-inset-bottom));
  }

  // 桌面端侧边栏让位
  @include media-up($bp-desktop) {
    margin-left: 240px;
  }
}
</style>
