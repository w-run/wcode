<script setup>
// ════════════════════════════════════════════════════════════════
//  WCode · 项目落地页（Landing Page 形式）
//  每个仓库 = 一个产品的展示页：英雄区 → 速览 → 叙事 → 技术栈 → 收尾
// ════════════════════════════════════════════════════════════════
import { ref, computed, onMounted, watch } from 'vue'
import { loadShowcase } from '../lib/api.js'
import { initHighlighter, renderMarkdown, enhanceCode, highlightCode, langFromPath, relTime, fmtRepoSize } from '../lib/render.js'
import CodeOverlay from '../components/CodeOverlay.vue'

const props = defineProps({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  exhibit: { type: Boolean, default: true },
  /** 深链 #/o/r/code 直接打开代码浏览器弹出层 */
  openCode: { type: Boolean, default: false },
})

/* ── 代码浏览器弹出层 ── */
const codeOpen = ref(props.openCode)
watch(
  () => props.openCode,
  (v) => {
    codeOpen.value = v
  },
)
function openCodePane() {
  codeOpen.value = true
  try {
    history.replaceState(null, '', `#/${props.owner}/${props.repo}/code`)
  } catch (e) {}
}

/** 迷你清单点击：高亮展示该文件开头片段 */
async function previewFile(entry) {
  if (entry.type === 'dir') {
    openCodePane()
    return
  }
  try {
    const res = await fetch(`/repo-fs/${props.owner}/${props.repo}/raw?ref=${encodeURIComponent(data.value?.ref || 'HEAD')}&path=${encodeURIComponent(entry.path)}`)
    if (!res.ok) return
    const j = await res.json()
    if (j.binary) return
    const text = String(j.text || '')
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    const html = await highlightCode(text.split('\n').slice(0, 20).join('\n'), langFromPath(entry.path), theme)
    preview.value = { name: entry.path, html, total: text.split('\n').length }
  } catch (e) {}
}
function closeCodePane() {
  codeOpen.value = false
  try {
    history.replaceState(null, '', `#/${props.owner}/${props.repo}`)
  } catch (e) {}
}

const state = ref('loading')
const err = ref('')
const data = ref(null)
const readmeHtml = ref('')
const copied = ref(false)

const LANG_COLORS = {
  Vue: '#41B883', JavaScript: '#F1E05A', TypeScript: '#3178C6', HTML: '#E34C26',
  CSS: '#563D7C', SCSS: '#C6538C', Python: '#3572A5', PHP: '#4F5D95',
  Go: '#00ADD8', Rust: '#DEA584', Shell: '#89E051', Java: '#B07219',
  Markdown: '#083FA1', Dockerfile: '#384D54',
}
const langColor = (n) => LANG_COLORS[n] || '#B8BEC7'

/* ── 语言分布 ── */
const langList = computed(() => {
  const m = data.value?.langs || {}
  const entries = Object.entries(m)
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1
  return entries
    .map(([name, v]) => ({ name, percent: (v / total) * 100 }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 6)
})

const topics = computed(() => data.value?.topics || [])
/* ── README 章节（供目录导航） ── */
const headings = computed(() => {
  const md = data.value?.readme || ''
  const out = []
  let id = 0
  for (const line of md.split('\n')) {
    const m = line.match(/^(#{1,3})\s+(.+?)\s*#*\s*$/)
    if (m) {
      id += 1
      out.push({ level: m[1].length, text: m[2].trim(), id: `sec-${id}` })
    }
  }
  return out
})
function scrollToHeading(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ── 速览条语义数据 ── */
const BRANCH_COLORS = ['#D62839', '#E05B68', '#F0B459', '#4CC79A', '#6BB7E8', '#A98BE0', '#8A9099']
const branchTips = computed(() => (data.value?.branches || []).slice(0, 7))
const branchTipColor = (i) => BRANCH_COLORS[i % BRANCH_COLORS.length]
const typeKey = computed(() => {
  const r = data.value?.repo
  if (!r) return 'public'
  if (r.mirror) return 'mirror'
  return r.private ? 'private' : 'public'
})
const typeLabel = computed(() => ({ public: '公开', private: '私有', mirror: '镜像' }[typeKey.value]))

/* ── 克隆 ── */
let copyTimer = null
async function copyClone() {
  try {
    await navigator.clipboard.writeText(data.value?.repo?.clone_url || '')
    copied.value = true
    clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copied.value = false), 1800)
  } catch (e) {}
}

/* ── 加载 ── */
const preview = ref(null) // { name, html, total }
async function load() {
  state.value = 'loading'
  try {
    const d = await loadShowcase(props.owner, props.repo)
    data.value = d

    if (d.readme) {
      const resolveRaw = (href) => {
        if (!href || /^(https?:|data:|mailto:|#)/.test(href)) return href
        return `/api/v1/repos/${props.owner}/${props.repo}/raw/${href.replace(/^\.?\//, '')}?ref=${d.ref}`
      }
      readmeHtml.value = renderMarkdown(d.readme, { resolve: resolveRaw })
    }
    state.value = 'ready'

    if (d.readme) {
      initHighlighter()
        .then(() => enhanceCode(readmeHtml.value))
        .then((html) => {
          readmeHtml.value = html
        })
        .catch(() => {})
    }

    // 内嵌代码预览：挑根目录第一个常见源码文件，展示前 ~20 行
    const pick =
      d.root.find((f) => f.type === 'file' && ['package.json', 'vite.config.ts', 'vite.config.js', 'index.ts', 'main.ts'].includes(f.name)) ||
      d.root.find((f) => f.type === 'file' && /\.(ts|js|vue|json|scss|md)$/i.test(f.name))
    if (pick) {
      const res = await fetch(`/repo-fs/${props.owner}/${props.repo}/raw?ref=${encodeURIComponent(d.ref)}&path=${encodeURIComponent(pick.path)}`).catch(() => null)
      if (res && res.ok) {
        const j = await res.json()
        if (!j.binary) {
          const text = String(j.text || '')
          const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
          const html = await highlightCode(text.split('\n').slice(0, 20).join('\n'), langFromPath(pick.path), theme)
          preview.value = { name: pick.path, html, total: text.split('\n').length }
        }
      }
    }
  } catch (e) {
    err.value = e.message || String(e)
    state.value = 'error'
  }
}

onMounted(load)
</script>

<template>
  <div class="lp" :class="{ 'lp--exhibit': exhibit }">
    <!-- 加载骨架 -->
    <div v-if="state === 'loading'" class="lp-load">
      <div class="lp-skel lp-skel--title"></div>
      <div class="lp-skel lp-skel--line"></div>
      <div class="lp-skel lp-skel--line" style="width: 42%"></div>
      <div class="lp-skel lp-skel--block"></div>
    </div>

    <p v-else-if="state === 'error'" class="wc-empty">
      加载失败：{{ err }}
      <button class="wc-link" @click="load">重试</button>
    </p>

    <template v-else>
      <!-- 导航条 -->
      <nav class="lp-nav">
        <a class="lp-nav__back" href="#/">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          全部项目
        </a>
        <button class="lp-nav__code" @click="openCodePane">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 16l-4-4 4-4M16 8l4 4-4 4" /></svg>
          代码浏览
        </button>
      </nav>

      <!-- HERO -->
      <header class="lp-hero">
        <!-- 装饰：抽象色块（落地页视觉锚点） -->
        <div class="lp-hero__blob" aria-hidden="true"></div>

        <div class="lp-hero__eyebrow">
          <span class="lp-hero__kick">项目 · {{ owner }}</span>
          <span class="lp-hero__type" :class="'lp-hero__type--' + typeKey">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path v-if="typeKey === 'public'" d="M12 21s-7-5.4-7-11a7 7 0 0 1 14 0c0 5.6-7 11-7 11z" />
              <circle v-if="typeKey === 'public'" cx="12" cy="10" r="2.6" />
              <rect v-if="typeKey === 'private'" x="5" y="11" width="14" height="9" rx="2.5" />
              <path v-if="typeKey === 'private'" d="M8 11V8a4 4 0 0 1 8 0v3" />
              <path v-if="typeKey === 'mirror'" d="M8 3H5a2 2 0 0 0-2 2v3" />
              <path v-if="typeKey === 'mirror'" d="M21 16v3a2 2 0 0 1-2 2h-3" />
              <path v-if="typeKey === 'mirror'" d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path v-if="typeKey === 'mirror'" d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
            {{ typeLabel }}
          </span>
        </div>

        <h1 class="lp-hero__title">{{ data.repo.name }}</h1>

        <p v-if="data.repo.description" class="lp-hero__tagline">{{ data.repo.description }}</p>
        <p v-else class="lp-hero__tagline lp-hero__tagline--muted">（暂无描述）</p>

        <div class="lp-hero__cta">
          <button class="lp-btn lp-btn--primary" @click="openCodePane">浏览代码</button>
          <button class="lp-btn" @click="copyClone">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="3" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
            {{ copied ? '已复制' : '复制克隆' }}
          </button>
          <a class="lp-btn lp-btn--ghost" :href="data.repo.html_url" target="_blank" rel="noopener">Gitea ↗</a>
        </div>

        <!-- 装饰性规格角标：分支点阵 + 默认分支（信息分散，不集中成卡片） -->
        <div class="lp-hero__spec" :title="data.branches.map((b) => b.name).join(' · ')">
          <span class="lp-hero__spec-dots">
            <i v-for="(b, i) in branchTips" :key="i" :style="{ background: branchTipColor(i) }"></i>
          </span>
          <span class="lp-hero__spec-ref">{{ data.ref }}</span>
          <span v-if="data.branches.length" class="lp-hero__spec-n">{{ data.branches.length }}<em>分支</em></span>
        </div>
      </header>

      <!-- 项目描述（README 作为落地页下方的正文叙述） -->
      <section class="lp-desc">
        <h2 class="lp-sec">项目描述</h2>

        <div v-if="headings.length > 1" class="lp-desc__toc">
          <button
            v-for="h in headings"
            :key="h.id"
            class="lp-desc__chip"
            :class="'lp-desc__chip--h' + h.level"
            @click="scrollToHeading(h.id)"
          >{{ h.text }}</button>
        </div>

        <div class="lp-desc__body">
          <div class="wc-md sc-readme" v-html="readmeHtml"></div>
        </div>
      </section>

      <!-- 代码预览（内嵌大卡片） -->
      <section v-if="preview || data.root.length" class="lp-code">
        <h2 class="lp-sec">代码</h2>
        <div class="lp-code__card">
          <!-- 左：根目录迷你清单 -->
          <div class="lp-code__side">
            <div class="lp-code__sidehead">根目录</div>
            <button
              v-for="f in data.root.slice(0, 8)"
              :key="f.path"
              class="lp-code__item"
              :class="{ 'lp-code__item--on': preview && preview.name === f.path }"
              @click="previewFile(f)"
            >
              <svg v-if="f.type === 'dir'" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
                <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
              </svg>
              <span>{{ f.name }}</span>
            </button>
            <span v-if="data.root.length > 8" class="lp-code__more">+{{ data.root.length - 8 }} 项</span>
          </div>

          <!-- 右：代码片段 -->
          <div class="lp-code__pane">
            <div class="lp-code__bar">
              <span class="lp-code__file">{{ preview ? preview.name : '—' }}</span>
              <span v-if="preview" class="lp-code__lines">{{ Math.min(20, preview.total) }} / {{ preview.total }} 行</span>
              <span class="lp-code__size">{{ fmtRepoSize(data.repo.size) }}</span>
              <button class="lp-code__open" @click="openCodePane">
                打开完整浏览器
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M8 7h9v9" /></svg>
              </button>
            </div>
            <div v-if="preview" class="lp-code__body" v-html="preview.html"></div>
            <div v-else class="lp-code__empty">选择一个文件查看片段</div>
          </div>
        </div>
      </section>

      <!-- 技术栈 -->
      <section v-if="langList.length || topics.length" class="lp-stack">
        <h2 class="lp-sec">技术栈</h2>
        <div class="lp-stack__chips">
          <span v-for="l in langList" :key="l.name" class="lp-chip">
            <i class="wc-dot" :style="{ background: langColor(l.name) }"></i>
            {{ l.name }}
            <em>{{ l.percent.toFixed(0) }}%</em>
          </span>
          <span v-for="t in topics" :key="t" class="lp-chip lp-chip--soft">{{ t }}</span>
        </div>
      </section>

      <!-- 收尾 CTA -->
      <section class="lp-end">
        <h2 class="lp-end__title">想看看底层的代码长什么样？</h2>
        <div class="lp-end__cta">
          <button class="lp-btn lp-btn--primary" @click="openCodePane">浏览代码</button>
          <button class="lp-btn" @click="copyClone">{{ copied ? '已复制' : '复制克隆地址' }}</button>
        </div>
      </section>

      <footer class="lp-foot">
        <span>{{ owner }} / {{ repo }}</span>
        <span>·</span>
        <span>更新于 {{ relTime(data.repo.updated_at) }}</span>
      </footer>
    </template>

    <!-- 代码浏览器弹出层 -->
    <CodeOverlay
      v-if="codeOpen"
      :owner="owner"
      :repo="repo"
      :branch="data?.ref"
      @close="closeCodePane"
    />
  </div>
</template>
