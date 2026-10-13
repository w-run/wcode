<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

defineEmits<{
  toggleSidebar: []
}>()

const { theme, toggleTheme } = useTheme()
const router = useRouter()

const keyword = ref('')

function onSearch() {
  const q = keyword.value.trim()
  router.push({ path: '/search', query: q ? { q } : {} })
}
</script>

<template>
  <header class="app-header">
    <!-- 桌面端：品牌 + 搜索 + 动作 -->
    <div class="header-desktop">
      <form class="header-search" role="search" @submit.prevent="onSearch">
        <WdIcon name="search" :size="17" class="header-search__icon" />
        <input
          v-model="keyword"
          class="header-search__input"
          type="search"
          placeholder="搜索仓库、Issue、PR…"
          aria-label="搜索"
        />
        <kbd class="header-search__hint">/</kbd>
      </form>

      <div class="header-actions">
        <slot name="actions" />
        <button
          class="icon-btn"
          type="button"
          :aria-label="theme === 'dark' ? '切换到亮色' : '切换到暗色'"
          @click="toggleTheme"
        >
          <WdIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
        </button>
        <button class="avatar-btn" type="button" aria-label="用户菜单">
          <span class="avatar-placeholder" />
        </button>
      </div>
    </div>

    <!-- 移动端：品牌 + 动作 + 汉堡 -->
    <div class="header-mobile">
      <router-link to="/" class="logo">
        <span class="logo-dot" aria-hidden="true" />
        <span class="logo-text">wcode</span>
      </router-link>
      <div class="header-actions">
        <button class="icon-btn" type="button" aria-label="搜索" @click="onSearch">
          <WdIcon name="search" :size="18" />
        </button>
        <button
          class="icon-btn"
          type="button"
          :aria-label="theme === 'dark' ? '切换到亮色' : '切换到暗色'"
          @click="toggleTheme"
        >
          <WdIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
        </button>
        <button
          class="menu-btn"
          type="button"
          aria-label="打开菜单"
          @click="$emit('toggleSidebar')"
        >
          <WdIcon name="menu" :size="20" />
        </button>
      </div>
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
  /* 无硬分割线：靠留白与滚动阴影区分 */

  .header-desktop {
    display: none;
    align-items: center;
    gap: var(--wd-space-6);
    height: 100%;
    padding: 0 var(--wd-space-6);

    @include media-up($bp-desktop) {
      display: flex;
      /* 让位左侧 72px 图标栏 */
      padding-left: calc(72px + var(--wd-space-6));
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

/* ── 品牌 ── */
.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--wd-space-2);
  flex-shrink: 0;
  text-decoration: none;
  transition: color $wd-dur-slow $wd-ease-smooth;
}
.logo-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--wd-red);
}
.logo-text {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--wd-ink);
}

/* ── 搜索：胶囊 + 无边框，聚焦时叠主题红环 ── */
.header-search {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  flex: 1;
  max-width: 420px;
  height: 38px;
  padding: 0 var(--wd-space-3);
  border-radius: var(--wd-radius-pill);
  background: var(--wd-field);
  transition: background $wd-dur-slow $wd-ease-smooth,
    box-shadow $wd-dur-slow $wd-ease-smooth;

  &:focus-within {
    background: var(--wd-card);
    box-shadow: 0 0 0 3px var(--wd-focus-ring-soft);
  }
}
.header-search__icon {
  color: var(--wd-ink-3);
  flex-shrink: 0;
  transition: color $wd-dur-slow $wd-ease-smooth;
}
.header-search:focus-within .header-search__icon {
  color: var(--wd-red);
}
.header-search__input {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  background: none;
  outline: none;
  font: inherit;
  font-size: 13.5px;
  color: var(--wd-ink);

  &::placeholder {
    color: var(--wd-ink-3);
  }
  /* 去掉 Safari 的原生清除按钮，保持胶囊干净 */
  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
}
.header-search__hint {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 6px;
  background: var(--wd-card);
  font-family: var(--wd-font-mono);
  font-size: 11px;
  color: var(--wd-ink-3);
}
.header-search:focus-within .header-search__hint {
  opacity: 0;
}

/* ── 动作区 ── */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  margin-left: auto;
}

/* ── 图标按钮 / 头像 ── */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--wd-radius-pill);
  color: var(--wd-ink-2);
  cursor: pointer;
  transition:
    background var(--wd-dur-fast) var(--wd-ease),
    color var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    background: var(--wd-field);
    color: var(--wd-ink);
  }
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

/* 窄屏隐藏桌面搜索胶囊 */
@include media-down($bp-desktop) {
  .header-search {
    display: none;
  }
}
</style>
