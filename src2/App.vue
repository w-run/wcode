<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import HomePage from './pages/Home.vue'
import Showcase from './pages/Showcase.vue'
import {
  exhibit, debugMode, setDebugMode, debugAvailable, checkAuth, user, logout,
} from './lib/auth.js'

/* ---------------- 登录态（决定展示/完整） ---------------- */
const devToggle = ref(false)
onMounted(() => {
  devToggle.value = debugAvailable()
  checkAuth()
})

/** 调试切换：循环 跟随登录 → 只读 → 完整 */
function cycleDebug() {
  const seq = [null, 'exhibit', 'full']
  const i = seq.indexOf(debugMode.value)
  setDebugMode(seq[(i + 1) % seq.length])
}
const debugLabel = computed(() => {
  if (debugMode.value === 'exhibit') return '只读 · 强制'
  if (debugMode.value === 'full') return '完整 · 强制'
  return exhibit.value ? '只读 · 按登录态' : '完整 · 按登录态'
})

/* ---------------- 路由（hash） ---------------- */
const hash = ref(typeof location !== 'undefined' ? location.hash : '')
function onHash() {
  hash.value = location.hash
  window.scrollTo({ top: 0 })
}
onMounted(() => window.addEventListener('hashchange', onHash))

const route = computed(() => {
  const parts = String(hash.value).replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts.length >= 2) return { name: 'repo', owner: parts[0], repo: parts[1], tab: parts[2] || '' }
  return { name: 'home' }
})

/* ---------------- 主题 ---------------- */
const theme = ref(
  (typeof localStorage !== 'undefined' && localStorage.getItem('wcode-theme')) ||
    (typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
)
watch(
  theme,
  (t) => {
    document.documentElement.setAttribute('data-theme', t)
    try {
      localStorage.setItem('wcode-theme', t)
    } catch (e) {}
  },
  { immediate: true },
)

/* ---------------- 搜索 ---------------- */
const q = ref('')
function submitSearch() {
  const s = q.value.trim()
  location.hash = s ? `#/?q=${encodeURIComponent(s)}` : '#/'
}
</script>

<template>
  <div class="wc-app">
    <header class="wc-head">
      <a class="wc-head__brand" href="#/">wcode</a>

      <form class="wc-head__search" @submit.prevent="submitSearch">
        <svg class="wc-search__ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input v-model="q" class="wc-search" type="search" placeholder="搜索仓库" />
      </form>

      <div class="wc-head__spacer"></div>

      <!-- 开发期调试：只读 / 完整 切换（发布后不再出现） -->
      <button
        v-if="devToggle"
        class="wc-devbtn"
        :class="{ 'wc-devbtn--exhibit': exhibit }"
        @click="cycleDebug"
        :title="debugLabel + '（点按循环）'"
      >
        <i class="wc-devbtn__dot"></i>
        {{ exhibit ? '只读' : '完整' }}
      </button>

      <button class="wc-iconbtn" :title="theme === 'dark' ? '切换浅色' : '切换深色'" @click="theme = theme === 'dark' ? 'light' : 'dark'">
        <svg v-if="theme === 'dark'" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
        </svg>
        <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      </button>
    </header>

    <main class="wc-body" :class="{ 'wc-body--exhibit': exhibit }">
      <Showcase
        v-if="route.name === 'repo'"
        :key="route.owner + '/' + route.repo"
        :owner="route.owner"
        :repo="route.repo"
        :exhibit="exhibit"
        :open-code="route.tab === 'code'"
      />
      <HomePage v-else :q="q" :exhibit="exhibit" />
    </main>
  </div>
</template>
