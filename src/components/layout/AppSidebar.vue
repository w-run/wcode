<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import { useTheme } from '@/composables/useTheme'

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

/** 图标栏导航（桌面端仅图标，标签走 title 提示；移动端抽屉显示文字） */
const navItems: NavItem[] = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/repos', label: '仓库', icon: 'folder' },
  { to: '/search', label: '搜索', icon: 'search' },
  { to: '/issues', label: 'Issue', icon: 'info-circle' },
  { to: '/pulls', label: 'PR', icon: 'git-pull-request' },
  { to: '/settings', label: '我的', icon: 'settings' },
]

const { theme, toggleTheme } = useTheme()
const store = useDashboardStore()

/** 头像内容：有登录名取首字母，否则退化为图标 */
const initial = computed(() => {
  const login = store.repos[0]?.owner?.login ?? ''
  return login ? login.replace(/[^a-zA-Z0-9]/g, '').charAt(0).toUpperCase() : ''
})

function onNavigate() {
  emit('update:modelValue', false)
}
</script>

<template>
  <!-- 桌面端：窄图标栏（无 logo，图标居中，用户与主题置左下） -->
  <aside class="app-rail" aria-label="主导航">
    <nav class="rail-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="rail-item"
        active-class="rail-item--active"
        :title="item.label"
        :aria-label="item.label"
      >
        <WdIcon :name="item.icon" :size="20" class="rail-icon" />
        <span class="rail-tip">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- 左下角：亮暗色 + 头像 -->
    <div class="rail-foot">
      <button
        class="rail-btn"
        type="button"
        :aria-label="theme === 'dark' ? '切换到亮色' : '切换到暗色'"
        :title="theme === 'dark' ? '亮色模式' : '暗色模式'"
        @click="toggleTheme"
      >
        <WdIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="19" />
      </button>

      <button class="rail-avatar" type="button" aria-label="用户菜单" title="账户">
        <span v-if="initial" class="rail-avatar__text">{{ initial }}</span>
        <WdIcon v-else name="user" :size="18" />
      </button>
    </div>
  </aside>

  <!-- 移动端：wdesign Drawer（带文字标签，触屏更易读） -->
  <WdDrawer
    :model-value="props.modelValue"
    side="left"
    close-on-mask
    @update:model-value="onNavigate"
  >
    <nav class="drawer-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="drawer-item"
        active-class="drawer-item--active"
        @click="onNavigate"
      >
        <span class="drawer-item__icon">
          <WdIcon :name="item.icon" :size="20" />
        </span>
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="drawer-foot">
      <button class="drawer-theme" type="button" @click="toggleTheme">
        <WdIcon :name="theme === 'dark' ? 'sun' : 'moon'" :size="18" />
        <span>{{ theme === 'dark' ? '亮色模式' : '暗色模式' }}</span>
      </button>
    </div>
  </WdDrawer>
</template>

<style lang="scss" scoped>
/* ══════ 桌面图标栏 ══════ */
.app-rail {
  display: none;

  @include media-up($bp-desktop) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: $z-drawer;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 84px;
    padding: var(--wd-space-5) 0 var(--wd-space-4);
    background: var(--wd-bg);
  }
}

.rail-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wd-space-2);
  /* 图标组垂直居中 */
  margin: auto 0;
}

/* 图标项：图标在 46×46 方块内居中，hover/选中给底色 */
.rail-item {
  position: relative;
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 15px;
  color: var(--wd-ink-3);
  text-decoration: none;
  transition:
    background $wd-dur-slow $wd-ease-smooth,
    color $wd-dur-slow $wd-ease-smooth,
    box-shadow $wd-dur-slow $wd-ease-smooth;

  &:hover {
    background: var(--wd-field);
    color: var(--wd-ink);
  }

  &--active {
    background: var(--wd-red);
    color: #fff;
    box-shadow: var(--wd-shadow-accent);
  }
}

.rail-icon {
  display: block;
}

/* 悬停浮出标签 */
.rail-tip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translate(-4px, -50%);
  padding: 5px 10px;
  border-radius: 8px;
  background: var(--wd-ink);
  color: var(--wd-bg);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity $wd-dur-fast $wd-ease-smooth,
    transform $wd-dur-slow $wd-ease-spring-soft;
  z-index: 20;
}
.rail-item:hover .rail-tip {
  opacity: 1;
  transform: translate(0, -50%);
}

/* ── 左下角：主题 + 头像 ── */
.rail-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wd-space-2);
}

.rail-btn {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 13px;
  background: transparent;
  color: var(--wd-ink-3);
  cursor: pointer;
  transition:
    background $wd-dur-slow $wd-ease-smooth,
    color $wd-dur-slow $wd-ease-smooth;

  &:hover {
    background: var(--wd-field);
    color: var(--wd-ink);
  }
}

.rail-avatar {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--wd-tint-2);
  color: var(--wd-red);
  cursor: pointer;
  transition: box-shadow $wd-dur-slow $wd-ease-smooth;

  &:hover {
    box-shadow: 0 0 0 3px var(--wd-focus-ring-soft);
  }
}
.rail-avatar__text {
  font-size: 15px;
  font-weight: 800;
  line-height: 1;
}

/* ══════ 移动端抽屉导航 ══════ */
.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-1);
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: var(--wd-space-3);
  padding: 8px var(--wd-space-3);
  border-radius: var(--wd-radius-md);
  color: var(--wd-ink-2);
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;

  &--active {
    background: var(--wd-tint-1);
    color: var(--wd-red);
  }
}

.drawer-item__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--wd-field);
  color: var(--wd-ink-3);
}
.drawer-item--active .drawer-item__icon {
  background: var(--wd-red);
  color: #fff;
}

.drawer-foot {
  margin-top: var(--wd-space-6);
  padding-top: var(--wd-space-4);
}

.drawer-theme {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  width: 100%;
  padding: 10px var(--wd-space-3);
  border: none;
  border-radius: var(--wd-radius-md);
  background: var(--wd-field);
  color: var(--wd-ink-2);
  font: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
