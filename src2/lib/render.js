/**
 * 渲染内核：Markdown → HTML（含代码高亮）+ 轻量文本/时间格式化
 * ---------------------------------------------------------------
 * · shiki 用纯 JS 正则引擎（engine/javascript），不依赖 WebAssembly
 *   —— iSH 上 Node 是 --jitless 启动，WASM 不可用，故必须避开 oniguruma
 * · Gitea 返回的相对图片/链接会被重写为可访问的绝对地址
 */
import { Marked } from 'marked'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

// 静态导入：esbuild 需要能静态解析才能打包（动态模板导入在浏览器里会失败）
import themeGithubDark from 'shiki/themes/github-dark.mjs'
import themeGithubLight from 'shiki/themes/github-light.mjs'
import langJs from 'shiki/langs/javascript.mjs'
import langTs from 'shiki/langs/typescript.mjs'
import langVue from 'shiki/langs/vue.mjs'
import langJson from 'shiki/langs/json.mjs'
import langBash from 'shiki/langs/bash.mjs'
import langShell from 'shiki/langs/shellscript.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langCss from 'shiki/langs/css.mjs'
import langScss from 'shiki/langs/scss.mjs'
import langPy from 'shiki/langs/python.mjs'
import langMd from 'shiki/langs/markdown.mjs'
import langYaml from 'shiki/langs/yaml.mjs'
import langDiff from 'shiki/langs/diff.mjs'

const LANG_MODS = [
  langJs, langTs, langVue, langJson, langBash, langShell, langHtml,
  langCss, langScss, langPy, langMd, langYaml, langDiff,
]

let hl = null
let hlPromise = null

export function initHighlighter() {
  if (hlPromise) return hlPromise
  hlPromise = createHighlighterCore({
    themes: [themeGithubDark, themeGithubLight],
    langs: LANG_MODS,
    engine: createJavaScriptRegexEngine(),
  }).then((instance) => {
    hl = instance
    return instance
  })
  return hlPromise
}

/** 按扩展名推断 shiki 语言 */
const EXT_LANG = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript', mts: 'typescript',
  vue: 'vue', json: 'json', jsonc: 'json',
  sh: 'bash', bash: 'bash', zsh: 'bash',
  html: 'html', htm: 'html', xml: 'html', svg: 'html',
  css: 'css', scss: 'scss', sass: 'scss', less: 'css',
  py: 'python', md: 'markdown', markdown: 'markdown',
  yml: 'yaml', yaml: 'yaml', diff: 'diff', patch: 'diff',
}
export function langFromPath(p) {
  const ext = String(p).split('.').pop().toLowerCase()
  return EXT_LANG[ext] || 'text'
}

const THEME_NAME = { dark: 'github-dark', light: 'github-light' }

/** 直接高亮一段代码 → shiki HTML（含 .line 行结构，便于 CSS 行号） */
export async function highlightCode(code, lang, theme = 'dark') {
  try {
    await initHighlighter()
    const loaded = hl.getLoadedLanguages?.() ?? []
    const use = loaded.includes(lang) ? lang : 'text'
    return await hl.codeToHtml(code, { lang: use, theme: THEME_NAME[theme] || 'github-dark' })
  } catch (e) {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
  }
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 代码高亮（同步；highlighter 就绪前回落纯文本） */
export function highlight(code, lang = 'text') {
  if (!hl) return escapeHtml(code)
  const loaded = hl.getLoadedLanguages?.() ?? []
  const use = loaded.includes(lang) ? lang : 'text'
  try {
    return hl.codeToHtml(code, { lang: use, theme: 'github-dark' })
  } catch {
    return escapeHtml(code)
  }
}

/**
 * Markdown 渲染
 * @param {string} md 源文本
 * @param {{base?:string}} opts base = 仓库 raw 根地址（用于重写相对链接）
 */
export function renderMarkdown(md, opts = {}) {
  const resolve = opts.resolve || ((h) => h)
  const m = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      code({ text, lang }) {
        const l = (lang || 'text').toLowerCase()
        return `<pre class="wc-pre" data-lang="${escapeHtml(l)}"><code>${escapeHtml(text)}</code></pre>`
      },
      image({ href, text, title }) {
        const src = resolve(href)
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(text || '')}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" />`
      },
      link({ href, title, tokens }) {
        const inner = this.parser.parseInline(tokens)
        const url = resolve(href)
        const ext = /^https?:\/\//.test(url)
        return `<a href="${escapeHtml(url)}"${title ? ` title="${escapeHtml(title)}"` : ''}${ext ? ' target="_blank" rel="noopener"' : ''}>${inner}</a>`
      },
    },
  })
  return m.parse(md || '')
}

/** 把相对路径解析到仓库 raw 地址 */
export async function enhanceCode(html) {
  const doc = new DOMParser().parseFromString(`<div id="r">${html}</div>`, 'text/html')
  const root = doc.getElementById('r')

  // 给标题注入稳定 id（供目录导航定位），顺序与 markdown 中 #~### 一致
  let n = 0
  for (const h of root.querySelectorAll('h1, h2, h3')) {
    n += 1
    h.setAttribute('id', `sec-${n}`)
  }

  if (!hl) return root.innerHTML
  const pres = [...root.querySelectorAll('.wc-pre')]
  const loaded = hl.getLoadedLanguages?.() ?? []
  for (const pre of pres) {
    const lang = pre.getAttribute('data-lang') || 'text'
    const code = pre.textContent || ''
    const use = loaded.includes(lang) ? lang : 'text'
    try {
      // shiki v3+ 的 codeToHtml 是异步的
      pre.outerHTML = await hl.codeToHtml(code, { lang: use, theme: 'github-dark' })
    } catch {
      /* 高亮失败则保留已转义的纯文本 */
    }
  }
  return root.innerHTML
}

/* ------------------------------------------------------------------ *
 *  轻量格式化
 * ------------------------------------------------------------------ */
export function relTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const diff = (Date.now() - d.getTime()) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 天前`
  if (diff < 86400 * 365) return `${Math.floor(diff / 86400 / 30)} 个月前`
  return `${Math.floor(diff / 86400 / 365)} 年前`
}

export function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function fmtSize(bytes) {
  if (bytes === undefined || bytes === null) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
}

/** 仓库体积：Gitea 的 size 单位是 KB */
export function fmtRepoSize(kb) {
  if (!kb) return '—'
  if (kb < 1024) return `${kb} KB`
  if (kb < 1024 * 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${(kb / 1024 / 1024).toFixed(2)} GB`
}

export function fmtNumber(n) {
  if (n === undefined || n === null) return '0'
  if (n < 1000) return String(n)
  return `${(n / 1000).toFixed(1)}k`
}

/** 首页展示用的短名（GitHub 链接风格） */
export function shortName(fullName) {
  const [owner, name] = String(fullName || '').split('/')
  return { owner, name }
}
