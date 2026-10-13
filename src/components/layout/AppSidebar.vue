<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

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

const store = useDashboardStore()
const isApi = computed(() => store.source === 'api' && store.repos.length > 0)
const backend = computed(() =>
  store.source === 'mock' ? '示例数据' : store.repos.length > 0 ? '在线' : '未连接',
)

function onNavigate() {
  emit('update:modelValue', false)
}
</script>

<template>
  <!-- 桌面端：窄图标栏（图标居中，无标签 —— 参考 Mr.File 侧栏） -->
  <aside class="app-rail" aria-label="主导航">
    <router-link to="/" class="rail-brand" aria-label="wcode 首页">
      <span class="rail-brand__dot" aria-hidden="true" />
    </router-link>

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

    <div class="rail-foot">
      <span
        class="rail-status"
        :class="{ 'rail-status--off': !isApi }"
        :title="`后端：${backend}`"
        :aria-label="`后端：${backend}`"
      />
      <button class="rail-avatar" type="button" aria-label="用户菜单">
        <span class="rail-avatar__inner" />
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
    gap: var(--wd-space-6);
    width: 72px;
    padding: var(--wd-space-4) 0;
    background: var(--wd-bg);
  }
}

.rail-brand {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
}
.rail-brand__dot {
  width: 14px;
  height: 14px;
  border-radius: 5px;
  background: var(--wd-red);
}

.rail-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wd-space-2);
  /* 图标组垂直居中（参考图：品牌置顶、图标居中、用户置底） */
  margin: auto 0;
}

/* 图标项：图标在 44×44 方块内居中，hover/选中给底色 */
.rail-item {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
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

.rail-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--wd-space-3);
}

.rail-status {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--wd-success);

  &--off {
    background: var(--wd-warning);
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
  background: transparent;
  cursor: pointer;
}
.rail-avatar__inner {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--wd-tint-2);
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
</style>
