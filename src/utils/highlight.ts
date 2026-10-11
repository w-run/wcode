/**
 * shiki 语法高亮封装（细粒度按需加载）
 *
 * - 使用 shiki/core + 显式语言/主题，仅打包用到的 13 种语言，避免整包 10MB
 * - JavaScript 正则引擎（纯 JS，无需 wasm，构建更稳）
 * - 懒加载单例 highlighter，首次调用才创建
 */
import { createHighlighterCore, type HighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import githubDark from 'shiki/themes/github-dark.mjs'
import langJs from 'shiki/langs/javascript.mjs'
import langTs from 'shiki/langs/typescript.mjs'
import langPython from 'shiki/langs/python.mjs'
import langRust from 'shiki/langs/rust.mjs'
import langGo from 'shiki/langs/go.mjs'
import langCpp from 'shiki/langs/cpp.mjs'
import langVue from 'shiki/langs/vue.mjs'
import langHtml from 'shiki/langs/html.mjs'
import langCss from 'shiki/langs/css.mjs'
import langJson from 'shiki/langs/json.mjs'
import langMarkdown from 'shiki/langs/markdown.mjs'
import langShell from 'shiki/langs/shellscript.mjs'
import langYaml from 'shiki/langs/yaml.mjs'

export const CODE_THEME = 'github-dark'

const LANGS = [
  langJs,
  langTs,
  langPython,
  langRust,
  langGo,
  langCpp,
  langVue,
  langHtml,
  langCss,
  langJson,
  langMarkdown,
  langShell,
  langYaml,
]

const LOADED_LANGS = new Set<string>([
  'javascript',
  'typescript',
  'python',
  'rust',
  'go',
  'cpp',
  'vue',
  'html',
  'css',
  'json',
  'markdown',
  'shellscript',
  'yaml',
  'text',
])

const EXT_LANG: Record<string, string> = {
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  vue: 'vue',
  py: 'python',
  rs: 'rust',
  go: 'go',
  c: 'cpp',
  h: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  html: 'html',
  htm: 'html',
  css: 'css',
  scss: 'css',
  sass: 'css',
  less: 'css',
  json: 'json',
  jsonc: 'json',
  md: 'markdown',
  markdown: 'markdown',
  sh: 'shellscript',
  bash: 'shellscript',
  zsh: 'shellscript',
  yml: 'yaml',
  yaml: 'yaml',
}

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [githubDark],
      langs: LANGS,
      engine: createJavaScriptRegexEngine(),
    })
  }
  return highlighterPromise
}

/** 根据文件名推断 shiki 语言 id；无法识别时返回 `text` */
export function langFromFilename(filename?: string | null): string {
  if (!filename) return 'text'
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return 'text'
  return EXT_LANG[ext] ?? 'text'
}

function normalizeLang(lang?: string | null): string {
  if (!lang) return 'text'
  const lower = lang.toLowerCase()
  if (LOADED_LANGS.has(lower)) return lower
  if (lower === 'js' || lower === 'node') return 'javascript'
  if (lower === 'ts') return 'typescript'
  if (lower === 'sh' || lower === 'shell') return 'shellscript'
  if (lower === 'py') return 'python'
  return 'text'
}

/** 将源码高亮为 HTML 字符串（异步，首次会加载 highlighter） */
export async function highlight(code: string, lang?: string): Promise<string> {
  const resolved = normalizeLang(lang)
  if (resolved === 'text') {
    return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`
  }
  const hl = await getHighlighter()
  return hl.codeToHtml(code, { lang: resolved, theme: CODE_THEME })
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
