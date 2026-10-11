<template>
  <!-- 桌面端：固定侧边栏 -->
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="nav-item--active"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>

  <!-- 移动端：Drawer 侧边栏 -->
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="modelValue"
        class="drawer-overlay"
        @click="$emit('update:modelValue', false)"
      >
        <aside class="app-sidebar drawer-panel" @click.stop>
          <button
            class="drawer-close"
            type="button"
            aria-label="关闭菜单"
            @click="$emit('update:modelValue', false)"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <nav class="sidebar-nav">
            <router-link
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="nav-item"
              active-class="nav-item--active"
              @click="$emit('update:modelValue', false)"
            >
              <span class="nav-icon" v-html="item.icon" />
              <span class="nav-label">{{ item.label }}</span>
            </router-link>
          </nav>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface NavItem {
  to: string
  label: string
  icon: string
}

withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  {
    modelValue: false,
  },
)

defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const navItems: NavItem[] = [
  {
    to: '/',
    label: '首页',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
  {
    to: '/repos',
    label: '仓库',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
  },
  {
    to: '/issues',
    label: 'Issue',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  },
  {
    to: '/pulls',
    label: 'PR',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>',
  },
  {
    to: '/settings',
    label: '我的',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
  },
]
</script>

<style lang="scss" scoped>
// 桌面端：固定左侧栏（>= desktop 显示）
.app-sidebar {
  width: 240px;
  min-height: calc(100vh - 56px);
  background: $color-surface;
  flex-shrink: 0;

  // 移动端隐藏
  @include media-down(calc($bp-desktop - 1px)) {
    display: none;
  }
}

// 抽屉遮罩
.drawer-overlay {
  position: fixed;
  inset: 0;
  z-index: $z-drawer;
  background: rgba(0, 0, 0, 0.4);
}

// 抽屉面板
.drawer-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 260px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: $space-4;
  box-shadow: $shadow-lg;

  @include media-up($bp-desktop) {
    display: none;
  }
}

// 关闭按钮
.drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-end;
  width: 44px;
  height: 44px;
  margin-bottom: $space-2;
  background: transparent;
  border: none;
  border-radius: $radius-full;
  color: $color-text-muted;
  cursor: pointer;
  transition:
    background $transition-fast,
    color $transition-fast;

  &:hover {
    background: $color-surface-2;
    color: $color-text;
  }
}

// 导航
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: $space-1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-2 $space-3;
  border-radius: $radius-md;
  color: $color-text-muted;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition:
    background $transition-fast,
    color $transition-fast;

  &:hover {
    background: $color-surface-2;
    color: $color-text;
  }

  &--active {
    background: $color-accent-light;
    color: $color-accent;

    .nav-icon {
      color: $color-accent;
    }
  }
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

// 过渡动画
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;

  .drawer-panel {
    transition: transform 0.25s ease;
  }
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;

  .drawer-panel {
    transform: translateX(-100%);
  }
}
</style>
