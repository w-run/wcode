/**
 * shiki 语法高亮封装
 *
 * - 懒加载单例 highlighter，避免首屏阻塞
 * - 使用 JavaScript 正则引擎（纯 JS，无需 wasm，构建更稳）
 * - `highlight(code, lang)` 返回 `<pre class="shiki">…</pre>` HTML
 * - 语言不在预加载集合时回退 `text`
 */
import { createHighlighter, type Highlighter } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

const LANGS = [
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
  'shell',
  'yaml',
  'text',
] as const

export const CODE_THEME = 'github-dark'

const LOADED_LANGS = new Set<string>(LANGS)

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
  sh: 'shell',
  bash: 'shell',
  zsh: 'shell',
  yml: 'yaml',
  yaml: 'yaml',
}

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [CODE_THEME],
      langs: [...LANGS],
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
  if (lower === 'sh') return 'shell'
  if (lower === 'py') return 'python'
  return 'text'
}

/** 将源码高亮为 HTML 字符串（异步，首次会加载 highlighter） */
export async function highlight(code: string, lang?: string): Promise<string> {
  const resolved = normalizeLang(lang)
  const hl = await getHighlighter()
  return hl.codeToHtml(code, { lang: resolved, theme: CODE_THEME })
}
