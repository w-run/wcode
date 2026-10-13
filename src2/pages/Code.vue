<script setup>
// ════════════════════════════════════════════════════════════════
//  WCode · 代码浏览器（IDE 式：左侧资源管理器 + 右侧内容区）
// ════════════════════════════════════════════════════════════════
import { ref, computed, onMounted, nextTick } from 'vue'
import { initFs, loadDir, childrenOf, revealDir, openFile, opener, selected } from '../lib/codefs.js'
import { highlightCode, langFromPath, renderMarkdown, enhanceCode, initHighlighter } from '../lib/render.js'
import CodeTree from '../components/CodeTree.vue'

const props = defineProps({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  branch: { type: String, default: '' },
  /** 弹出层模式：不显示"返回概览"链接，改为关闭按钮 */
  overlay: { type: Boolean, default: false },
})
const emit = defineEmits(['close'])

/* ── 内容状态 ── */
const content = ref(null)
const contentLoading = ref(false)
const contentErr = ref('')

const root = computed(() => childrenOf(''))

function rawUrl(path) {
  return `/repo-fs/${props.owner}/${props.repo}/raw?ref=${encodeURIComponent(props.branch || 'HEAD')}&path=${encodeURIComponent(path)}`
}

async function loadFile(entry) {
  contentLoading.value = true
  contentErr.value = ''
  content.value = null
  selected.value = entry.path
  const theme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  try {
    const res = await fetch(rawUrl(entry.path))
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    const d = await res.json()
    if (d.binary) {
      content.value = { type: 'binary', size: d.size, path: entry.path }
      return
    }
    const text = d.text || ''
    const ext = String(entry.path).split('.').pop().toLowerCase()

    // Markdown：渲染 + 代码块增强
    if (ext === 'md' || ext === 'markdown') {
      const dir = entry.path.split('/').slice(0, -1).join('/')
      const html = renderMarkdown(text, {
        resolve: (href) => {
          if (!href || /^(https?:|data:|mailto:|#)/.test(href)) return href
          const joined = [dir, href.replace(/^\.?\//, '')].filter(Boolean).join('/')
          return rawUrl(joined)
        },
      })
      content.value = { type: 'md', html, path: entry.path }
      initHighlighter()
        .then(() => enhanceCode(html))
        .then((h) => {
          if (content.value && content.value.path === entry.path) content.value = { ...content.value, html: h }
        })
        .catch(() => {})
      return
    }

    // 代码 / 图片 / 纯文本
    if (isCode(ext)) {
      const code = await highlightCode(text, langFromPath(entry.path), theme)
      content.value = { type: 'code', code, lines: text.split('\n').length, path: entry.path }
      return
    }
    if (isImage(ext)) {
      content.value = { type: 'img', url: rawUrl(entry.path), path: entry.path }
      return
    }
    content.value = { type: 'text', text: text.slice(0, 4096), path: entry.path }
  } catch (e) {
    contentErr.value = e.message
  } finally {
    contentLoading.value = false
  }
}

function isCode(ext) {
  return ['js','mjs','cjs','ts','tsx','vue','json','jsonc','css','scss','sass','html','htm','py','sh','bash','yml','yaml','txt','gitignore','editorconfig','toml','ini','xml'].includes(ext)
}
function isImage(ext) {
  return ['png','jpg','jpeg','gif','webp','svg','ico'].includes(ext)
}

// 订阅树节点点击
opener.value = loadFile

/* ── 面包屑 ── */
const crumbs = computed(() => {
  const parts = selected.value.split('/').filter(Boolean)
  const out = []
  let acc = ''
  parts.forEach((p, i) => {
    acc = acc ? `${acc}/${p}` : p
    out.push({ name: p, path: acc, isLast: i === parts.length - 1 })
  })
  return out
})
async function goCrumb(c) {
  if (!c.isLast) await revealDir(c.path)
}

/* ── 初始化 ── */
onMounted(async () => {
  initFs(props.owner, props.repo, props.branch)
  await nextTick()
  try {
    await loadDir('')
    const r = root.value.find((e) => e.type === 'file' && /^readme/i.test(e.name))
    if (r) await loadFile(r)
  } catch (e) {}
})
</script>

<template>
  <div class="cb">
    <!-- 顶栏 -->
    <div class="cb-bar">
      <a v-if="!overlay" class="cb-bar__back" :href="`#/${owner}/${repo}`" title="返回概览">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        概览
      </a>
      <span class="cb-bar__path">{{ owner }}<b>/</b>{{ repo }}</span>
      <span class="cb-bar__ref">{{ branch || 'HEAD' }}</span>
      <span class="cb-bar__n" v-if="root.length">{{ root.length }} 项</span>
      <button v-if="overlay" class="cb-bar__close" title="关闭" @click="emit('close')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
      </button>
    </div>

    <!-- 主体：左资源管理器 / 右内容 -->
    <div class="cb-body">
      <aside class="cb-explorer">
        <div class="cb-explorer__head">
          资源管理器
          <span class="cb-explorer__n" v-if="root.length">{{ root.length }}</span>
        </div>
        <div class="cb-explorer__scroll">
          <CodeTree v-if="root.length" dir="" :depth="0" />
          <div v-else class="cb-loading"><i></i><i></i><i></i><i></i><i></i></div>
        </div>
      </aside>

      <section class="cb-view">
        <!-- 面包屑 -->
        <div v-if="selected" class="cb-crumbs">
          <button class="cb-crumb cb-crumb--root" title="仓库根" @click="selected = ''; loadDir('')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
            {{ repo }}
          </button>
          <template v-for="(c, i) in crumbs" :key="i">
            <svg class="cb-crumb__sep" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            <button v-if="!c.isLast" class="cb-crumb" @click="goCrumb(c)">{{ c.name }}</button>
            <span v-else class="cb-crumb cb-crumb--cur">{{ c.name }}</span>
          </template>
        </div>

        <!-- 内容 -->
        <div class="cb-view__inner">
          <div v-if="contentLoading" class="cb-state"><div class="cb-skel cb-skel--l"></div><div class="cb-skel"></div><div class="cb-skel"></div><div class="cb-skel"></div><div class="cb-skel"></div><div class="cb-skel"></div></div>

          <div v-else-if="contentErr" class="cb-state cb-state--err">
            <p class="cb-state__t">加载失败</p>
            <p class="cb-state__s">{{ contentErr }}</p>
          </div>

          <div v-else-if="!content" class="cb-state">
            <p class="cb-state__t">选择一个文件</p>
            <p class="cb-state__s">从左侧资源管理器浏览仓库文件</p>
          </div>

          <div v-else-if="content.type === 'binary'" class="cb-state">
            <p class="cb-state__t">二进制文件</p>
            <p class="cb-state__s">{{ content.size }} 字节 · 无法以文本预览</p>
          </div>

          <div v-else-if="content.type === 'img'" class="cb-imgwrap">
            <img :src="content.url" class="cb-img" alt="" />
          </div>

          <div v-else-if="content.type === 'code'" class="cb-codewrap" v-html="content.code"></div>

          <div v-else-if="content.type === 'md'" class="cb-mdwrap wc-md" v-html="content.html"></div>

          <div v-else-if="content.type === 'text'" class="cb-textwrap"><pre>{{ content.text }}</pre></div>
        </div>
      </section>
    </div>
  </div>
</template>