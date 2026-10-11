<template>
  <header class="app-header">
    <!-- 桌面端：左上 logo + 右上用户菜单 -->
    <div class="header-desktop">
      <router-link to="/" class="logo">wcode</router-link>
      <div class="header-actions">
        <slot name="actions" />
        <button class="avatar-btn" type="button" aria-label="用户菜单">
          <span class="avatar-placeholder" />
        </button>
      </div>
    </div>

    <!-- 移动端：居中 logo + 汉堡按钮 -->
    <div class="header-mobile">
      <router-link to="/" class="logo">wcode</router-link>
      <button
        class="menu-btn"
        type="button"
        aria-label="打开菜单"
        @click="$emit('toggle-sidebar')"
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
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  toggleSidebar: []
}>()
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  height: 56px;
  background: $color-surface;
  box-shadow: $shadow-sm;

  // 桌面端布局
  .header-desktop {
    display: none;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 $space-6;

    @include media-up($bp-desktop) {
      display: flex;
    }
  }

  // 移动端布局
  .header-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 $space-4;

    @include media-up($bp-desktop) {
      display: none;
    }
  }
}

.logo {
  font-size: 18px;
  font-weight: 700;
  color: $color-accent;
  text-decoration: none;
  letter-spacing: -0.5px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.avatar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: $radius-full;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover {
    background: $color-surface-2;
  }
}

.avatar-placeholder {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: $radius-full;
  background: $color-accent-light;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: $radius-full;
  color: $color-text;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover {
    background: $color-surface-2;
  }
}
</style>
