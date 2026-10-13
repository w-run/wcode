/**
 * 代码浏览器的共享状态（模块级单例）
 * 让递归的 CodeTree 组件与主视图共享同一份展开/选中/缓存状态
 */
import { ref, computed } from 'vue'

export const fsBase = ref('/repo-fs')
export const gitRef = ref('HEAD')

/** dir path → entries[] */
const dirCache = new Map()
export const entriesByDir = ref(new Map())
export const expanded = ref(new Set())
export const selected = ref('')
export const loadingDirs = ref(new Set())

export function initFs(owner, repo, refName) {
  fsBase.value = `/repo-fs/${owner}/${repo}`
  gitRef.value = refName || 'HEAD'
  dirCache.clear()
  entriesByDir.value = new Map()
  expanded.value = new Set()
  selected.value = ''
}

/** 读一个目录（带缓存 + 并发去重） */
export async function loadDir(dirPath) {
  if (dirCache.has(dirPath)) return dirCache.get(dirPath)
  loadingDirs.value = new Set(loadingDirs.value).add(dirPath)
  try {
    const url = `${fsBase.value}/tree?ref=${encodeURIComponent(gitRef.value)}&path=${encodeURIComponent(dirPath)}`
    const res = await fetch(url)
    const d = await res.json()
    const entries = d.entries || []
    dirCache.set(dirPath, entries)
    const m = new Map(entriesByDir.value)
    m.set(dirPath, entries)
    entriesByDir.value = m
    return entries
  } finally {
    const s = new Set(loadingDirs.value)
    s.delete(dirPath)
    loadingDirs.value = s
  }
}

export function childrenOf(dirPath) {
  return entriesByDir.value.get(dirPath) || []
}

export function isExpanded(p) {
  return expanded.value.has(p)
}

export async function toggleDir(dirPath) {
  const next = new Set(expanded.value)
  if (next.has(dirPath)) {
    next.delete(dirPath)
  } else {
    next.add(dirPath)
    expanded.value = next
    try {
      await loadDir(dirPath)
    } catch (e) {}
    return
  }
  expanded.value = next
}

/** 展开路径上的所有祖先目录（用于面包屑/定位） */
export async function revealDir(dirPath) {
  const parts = String(dirPath).split('/').filter(Boolean)
  const next = new Set(expanded.value)
  let acc = ''
  for (const p of parts) {
    acc = acc ? `${acc}/${p}` : p
    next.add(acc)
  }
  expanded.value = next
  let cur = ''
  for (const p of parts) {
    cur = cur ? `${cur}/${p}` : p
    try {
      await loadDir(cur)
    } catch (e) {}
  }
}

/* ── 文件内容打开（由主视图订阅） ── */
export const opener = ref(null)
export function openFile(entry) {
  if (typeof opener.value === 'function') opener.value(entry)
}

/* ── 按扩展名给的图标语义 ── */
export const EXT_ACCENT = {
  js: 'js', mjs: 'js', cjs: 'js',
  ts: 'ts', tsx: 'ts',
  vue: 'vue',
  json: 'json',
  css: 'css', scss: 'css',
  html: 'html',
  md: 'md', markdown: 'md',
  py: 'py',
  sh: 'sh', bash: 'sh',
  yml: 'yml', yaml: 'yml',
  svg: 'img', png: 'img', jpg: 'img', jpeg: 'img', gif: 'img', webp: 'img', ico: 'img',
  lock: 'lock',
}
export function accentOf(name) {
  const ext = String(name).split('.').pop().toLowerCase()
  return EXT_ACCENT[ext] || ''
}
