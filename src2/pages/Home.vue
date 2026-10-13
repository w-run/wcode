<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api, setToken } from '../lib/api.js'
import { relTime, fmtNumber } from '../lib/render.js'

const props = defineProps({
  q: { type: String, default: '' },
  exhibit: { type: Boolean, default: true },
})

const state = ref('loading') // loading | ready | error
const repos = ref([])
const langs = ref({}) // full_name → {name, percent}

/* 优先当前用户仓库；未登录时回落公开搜索 */
const OWNER = 'w-run'

async function load() {
  state.value = 'loading'
  try {
    let list = []
    try {
      list = await api.userRepos(OWNER)
    } catch {
      // 401/网络异常 → 匿名搜索（附带 token 时仍能拿到）
      list = await api.search('')
    }
    // 仅保留有内容的仓库（空仓库在展示风里没意义）
    repos.value = (list || [])
      .filter((r) => r && !r.empty)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))

    state.value = 'ready'
    repos.value.forEach((r) => {
      api
        .languages(r.owner.login, r.name)
        .then((m) => {
          const entries = Object.entries(m || {})
          const total = entries.reduce((s, [, v]) => s + v, 0) || 1
          langs.value[r.full_name] = entries
            .map(([name, v]) => ({ name, percent: (v / total) * 100 }))
            .sort((a, b) => b.percent - a.percent)
        })
        .catch(() => {})
    })
  } catch (e) {
    state.value = 'error'
  }
}

const filtered = computed(() => {
  const s = (props.q || '').trim().toLowerCase()
  if (!s) return repos.value
  return repos.value.filter(
    (r) => r.name.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s),
  )
})

const LANG_COLORS = {
  Vue: '#41B883', JavaScript: '#F1E05A', TypeScript: '#3178C6', HTML: '#E34C26',
  CSS: '#563D7C', SCSS: '#C6538C', Python: '#3572A5', PHP: '#4F5D95',
  Go: '#00ADD8', Rust: '#DEA584', Shell: '#89E051', Java: '#B07219',
  Markdown: '#083FA1', Dockerfile: '#384D54',
}
const langColor = (n) => LANG_COLORS[n] || '#B8BEC7'

onMounted(load)
watch(() => props.q, () => {})
defineExpose({ load })
</script>

<template>
  <div class="wc-home">
    <div class="wc-home__intro">
      <h1 class="wc-home__title">项目</h1>
      <p class="wc-home__sub">自托管代码 · 极简展示</p>
    </div>

    <div v-if="state === 'loading'" class="wc-grid">
      <div v-for="i in 4" :key="i" class="wc-skel"></div>
    </div>

    <p v-else-if="state === 'error'" class="wc-empty">无法连接后端。请确认 Gitea 已启动。</p>

    <p v-else-if="!filtered.length" class="wc-empty">没有找到匹配的仓库</p>

    <div v-else class="wc-grid">
      <a v-for="r in filtered" :key="r.id" class="wc-card" :href="`#/${r.owner.login}/${r.name}`">
        <div class="wc-card__top">
          <span class="wc-card__name">{{ r.name }}</span>
          <span v-if="r.mirror" class="wc-chip wc-chip--mirror">镜像</span>
          <span v-if="r.private" class="wc-chip">私有</span>
        </div>
        <p class="wc-card__desc">{{ r.description || '暂无描述' }}</p>
        <div class="wc-card__foot">
          <span v-if="langs[r.full_name]?.length" class="wc-lang">
            <i class="wc-dot" :style="{ background: langColor(langs[r.full_name][0].name) }"></i>
            {{ langs[r.full_name][0].name }}
          </span>
          <span v-if="r.stars_count" class="wc-faint">★ {{ fmtNumber(r.stars_count) }}</span>
          <span class="wc-faint wc-card__time">{{ relTime(r.updated_at) }}</span>
        </div>
      </a>
    </div>
  </div>
</template>
