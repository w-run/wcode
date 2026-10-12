<script setup lang="ts">
interface NavItem {
  to: string
  label: string
  icon: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  { modelValue: false },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/repos', label: '仓库', icon: 'folder' },
  { to: '/search', label: '搜索', icon: 'search' },
  { to: '/issues', label: 'Issue', icon: 'info-circle' },
  { to: '/pulls', label: 'PR', icon: 'git-pull-request' },
  { to: '/settings', label: '我的', icon: 'settings' },
]

function onNavigate() {
  emit('update:modelValue', false)
}
</script>

<template>
  <!-- 桌面端：固定左侧栏 -->
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item--active"
      >
        <WdIcon :name="item.icon" :size="18" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>

  <!-- 移动端：wdesign Drawer 侧边栏 -->
  <WdDrawer
    :model-value="props.modelValue"
    side="left"
    close-on-mask
    @update:model-value="onNavigate"
  >
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item--active"
        @click="onNavigate"
      >
        <WdIcon :name="item.icon" :size="20" class="nav-icon" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </WdDrawer>
</template>

<style lang="scss" scoped>
.app-sidebar {
  width: 240px;
  min-height: calc(100vh - 56px);
  background: var(--wd-bg);
  flex-shrink: 0;
  padding: var(--wd-space-4);

  @include media-down($bp-desktop) {
    display: none;
  }
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--wd-space-3);
  padding: var(--wd-space-2) var(--wd-space-3);
  border-radius: var(--wd-radius-sm);
  color: var(--wd-ink-2);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition:
    background var(--wd-dur-fast) var(--wd-ease),
    color var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    background: var(--wd-field);
    color: var(--wd-ink);
  }

  &--active {
    background: var(--wd-tint-2);
    color: var(--wd-red);
  }
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
</style>
