<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTabBar from '@/components/layout/AppTabBar.vue'

const route = useRoute()
/** 无布局页面（如对外落地页）：只渲染 router-view */
const isBare = computed(() => route.meta.bare === true)

const sidebarOpen = ref(false)
</script>

<template>
  <router-view v-if="isBare" />

  <AppShell v-else>
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
