<script setup lang="ts">
defineEmits<{
  toggleSidebar: []
}>()
</script>

<template>
  <header class="app-header">
    <!-- 桌面端：左上 logo + 右上用户菜单 -->
    <div class="header-desktop">
      <router-link to="/" class="logo">
        <span class="logo-dot" />
        wcode
      </router-link>
      <div class="header-actions">
        <slot name="actions" />
        <button class="avatar-btn" type="button" aria-label="用户菜单">
          <span class="avatar-placeholder" />
        </button>
      </div>
    </div>

    <!-- 移动端：居中 logo + 汉堡按钮 -->
    <div class="header-mobile">
      <router-link to="/" class="logo">
        <span class="logo-dot" />
        wcode
      </router-link>
      <button
        class="menu-btn"
        type="button"
        aria-label="打开菜单"
        @click="$emit('toggle-sidebar')"
      >
        <WdIcon name="menu" :size="20" />
      </button>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  height: 56px;
  background: var(--wd-bg);
  box-shadow: var(--wd-shadow-sm);

  .header-desktop {
    display: none;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 var(--wd-space-6);

    @include media-up($bp-desktop) {
      display: flex;
    }
  }

  .header-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 var(--wd-space-4);

    @include media-up($bp-desktop) {
      display: none;
    }
  }
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--wd-space-2);
  font-size: 18px;
  font-weight: 700;
  color: var(--wd-red);
  text-decoration: none;
  letter-spacing: -0.5px;
}

.logo-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-red);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--wd-space-3);
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
  border-radius: var(--wd-radius-pill);
  cursor: pointer;
  transition: background var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    background: var(--wd-field);
  }
}

.avatar-placeholder {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-tint-2);
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
  border-radius: var(--wd-radius-pill);
  color: var(--wd-ink);
  cursor: pointer;
  transition: background var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    background: var(--wd-field);
  }
}
</style>
