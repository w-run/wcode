<script setup lang="ts">
interface TabItem {
  to: string
  label: string
  icon: string
}

const tabItems: TabItem[] = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/repos', label: '仓库', icon: 'folder' },
  { to: '/issues', label: 'Issue', icon: 'info-circle' },
  { to: '/pulls', label: 'PR', icon: 'git-pull-request' },
  { to: '/settings', label: '我的', icon: 'settings' },
]
</script>

<template>
  <nav class="app-tab-bar">
    <router-link
      v-for="item in tabItems"
      :key="item.to"
      :to="item.to"
      class="tab-item"
      active-class="tab-item--active"
    >
      <WdIcon :name="item.icon" :size="20" class="tab-icon" />
      <span class="tab-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<style lang="scss" scoped>
.app-tab-bar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $z-sticky;
  height: 56px;
  background: var(--wd-bg);
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.04);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);

  @include media-down($bp-desktop) {
    display: flex;
    align-items: stretch;
  }
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 2px;
  min-width: 44px;
  min-height: 44px;
  padding: var(--wd-space-1) 0;
  color: var(--wd-ink-2);
  text-decoration: none;
  transition: color var(--wd-dur-fast) var(--wd-ease);

  &:active {
    color: var(--wd-ink);
  }

  &--active {
    color: var(--wd-red);
  }
}

.tab-icon {
  display: flex;
  align-items: center;
}

.tab-label {
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
}
</style>
