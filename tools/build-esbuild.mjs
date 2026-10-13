#!/usr/bin/env node
/**
 * WCode · iSH（iOS）构建脚本 —— esbuild + Dart Sass
 * ================================================================
 * 为什么需要它：
 *   本机 Node 的 WebAssembly 是坏的（validate/Module 正常，
 *   但 Instance 拿不到 exports）→ es-module-lexer 失效 → Vite 全废。
 *   esbuild 是原生二进制，不走 WASM，因此可以在此环境完成构建。
 *
 * 与 Vite 配置的等价映射：
 *   resolve.alias '@'          → src/
 *   resolve.alias 'wdesign'    → packages/wdesign
 *   css.preprocessorOptions.scss.additionalData
 *                              → 每个 SCSS 入口前置 tokens/mixins
 *   server.proxy '/api'        → 由 tools/serve.mjs 代理到 Gitea :3000
 *
 * 用法：
 *   WCODE_DEPS=/root/build/deps node tools/build-esbuild.mjs
 *   常规机器上可直接 node tools/build-esbuild.mjs（用本地 node_modules）
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = process.env.WCODE_ROOT
  ? path.resolve(process.env.WCODE_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(ROOT, 'src')
const DIST = process.env.WCODE_DIST ? path.resolve(process.env.WCODE_DIST) : path.join(ROOT, 'dist')
/** WCode 的私有包目录（wdesign）；跨项目构建时该目录可能不存在 */
const PKG = process.env.WCODE_PKG ? path.resolve(process.env.WCODE_PKG) : path.join(ROOT, 'packages')
const DEPS = process.env.WCODE_DEPS || ROOT
const NM = path.join(DEPS, 'node_modules')

const req = createRequire(path.join(DEPS, 'noop.js'))
const esbuild = req('esbuild')
const sass = req('sass')
const sfc = req('@vue/compiler-sfc')

const buildId = Date.now().toString(36).slice(-6)

/** 入口可切换：WCODE_ENTRY / WCODE_HTML（用于并行开发新界面，如 wcode2） */
const ENTRY_FILE = process.env.WCODE_ENTRY || 'src/main.ts'
const HTML_FILE = process.env.WCODE_HTML || 'index.html'
const STYLE_FILE = process.env.WCODE_STYLES || 'src/assets/styles/main.scss'

/** Vite 的 scss.additionalData 等价物：每个 SCSS 入口前置注入（跨项目可覆盖/关闭） */
const INJECT = process.env.WCODE_INJECT ?? `@use "wdesign/styles/tokens" as *;\n@use "@/assets/styles/_tokens.scss" as *;\n@use "@/assets/styles/_mixins.scss" as *;\n`

/* ------------------------------------------------------------------ *
 *  解析：'@/x' 与 'wdesign' 家族
 * ------------------------------------------------------------------ */
const EXT_ORDER = ['', '.ts', '.js', '.mjs', '.vue', '.json', '.scss', '/index.ts', '/index.js', '/index.scss']

/** 依次尝试候选后缀（含 SCSS partial 下划线形式），返回真实文件路径 */
function resolveFile(base) {
  for (const ext of EXT_ORDER) {
    const p = base + ext
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  // SCSS partial：a/b → a/_b.scss
  const dir = path.dirname(base)
  const name = path.basename(base)
  for (const ext of ['.scss', '.sass']) {
    const p = path.join(dir, `_${name}${ext}`)
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p
  }
  return null
}

const ALIASES = {
  wdesign: path.join(PKG, 'wdesign', 'src', 'index.ts'),
  '@w-run/wdesign': path.join(PKG, 'wdesign', 'src', 'index.ts'),
  'wdesign-icons': path.join(PKG, 'wdesign-icons', 'src', 'index.ts'),
  '@w-run/wdesign-icons': path.join(PKG, 'wdesign-icons', 'src', 'index.ts'),
  'wdesign/styles': path.join(PKG, 'wdesign', 'src', 'styles', 'index.scss'),
}

function aliasPlugin() {
  return {
    name: 'wcode-alias',
    setup(build) {
      build.onResolve({ filter: /^@\// }, (args) => {
        const hit = resolveFile(path.join(SRC, args.path.slice(2)))
        return hit ? { path: hit } : null
      })
      // wdesign / wdesign-icons（含任意子路径，如 wdesign/styles、wdesign-icons/data）
      build.onResolve(
        { filter: /^(wdesign|wdesign-icons|@w-run\/wdesign|@w-run\/wdesign-icons)(\/.*)?$/ },
        (args) => {
          const key = args.path
          if (ALIASES[key]) return { path: ALIASES[key] }
          const scoped = key.startsWith('@w-run/')
          const parts = key.split('/')
          const pkgName = scoped ? parts[1] : parts[0]
          const sub = parts.slice(scoped ? 2 : 1).join('/')
          const dir = path.join(PKG, pkgName)
          if (!sub) return { path: path.join(dir, 'src', 'index.ts') }
          const hit = resolveFile(path.join(dir, sub)) || resolveFile(path.join(dir, 'src', sub))
          return hit ? { path: hit } : null
        },
      )
    },
  }
}

/* ------------------------------------------------------------------ *
 *  Vue SFC（支持 <script setup lang="ts">）
 * ------------------------------------------------------------------ */
const collectedCSS = []

function hashId(p) {
  return crypto.createHash('sha1').update(p).digest('hex').slice(0, 8)
}

function compileSFC(source, filename) {
  // wdesign 的 WdIcon 用 Vite 专有 import.meta.glob 收集 SVG，
  // 非 Vite 环境改为依赖 window.WD_ICONS（icons.data.js）
  if (source.includes('import.meta.glob')) {
    source = source.replace(/import\.meta\.glob\s*\([^)]*\{[\s\S]*?\}\s*\)/g, '({})')
    source = source.replace(/import\.meta\.glob\s*\([^)]*\)/g, '({})')
  }
  const { descriptor, errors } = sfc.parse(source, { filename })
  if (errors.length) throw new Error(`${filename}\n${errors[0]}`)

  const id = hashId(filename)
  const isTs = (descriptor.script?.lang || descriptor.scriptSetup?.lang || 'js') === 'ts'
  // 有 <style scoped> 时，运行期需据此给元素打上 data-v-<id>，与 compileStyle 的选择器对齐
  const scopeId = descriptor.styles.some((s) => s.scoped) ? `data-v-${id}` : ''
  let code = 'export default {}'

  if (descriptor.scriptSetup) {
    code = sfc.compileScript(descriptor, { id, inlineTemplate: !!descriptor.template, genDefaultAs: '__wc_sfc__' }).content
    if (scopeId) code += `\n__wc_sfc__.__scopeId = ${JSON.stringify(scopeId)}`
    code += '\nexport default __wc_sfc__'
  } else if (descriptor.template) {
    const t = sfc.compileTemplate({
      source: descriptor.template.content,
      filename,
      id,
      scoped: descriptor.styles.some((s) => s.scoped),
      compilerOptions: { bindingMetadata: descriptor.script ? undefined : undefined },
    })
    code = descriptor.script
      ? descriptor.script.content.replace(/export\s+default/, 'const __wc_sfc__ =') + `\n${t.code}\n__wc_sfc__.render = render${scopeId ? `\n__wc_sfc__.__scopeId = ${JSON.stringify(scopeId)}` : ''}\nexport default __wc_sfc__`
      : `${t.code}\nexport default { render${scopeId ? `, __scopeId: ${JSON.stringify(scopeId)}` : ''} }`
  }

  for (const st of descriptor.styles) {
    if (!st.content.trim()) continue
    const css = compileSCSS(INJECT + st.content, filename)
    // 关键：<style scoped> 必须做作用域转换（加 [data-v-<id>]），
    // 否则所有 scoped 样式都会变成全局样式，class 撞名即互相污染
    if (st.scoped) {
      const out = sfc.compileStyle({
        source: css,
        filename,
        id,
        scoped: true,
      })
      if (out.errors?.length) {
        throw new Error(`${filename}\n${out.errors[0]}`)
      }
      collectedCSS.push(out.code)
    } else {
      collectedCSS.push(css)
    }
  }
  return { code, loader: isTs ? 'ts' : 'js' }
}

/* ------------------------------------------------------------------ *
 *  SCSS：注入 tokens/mixins + 解析 '@/'
 * ------------------------------------------------------------------ */
const aliasImporter = {
  findFileUrl(url) {
    if (url.startsWith('@/')) {
      const hit = resolveFile(path.join(SRC, url.slice(2)))
      return hit ? pathToFileURL(hit) : null
    }
    // Vite 的绝对路径导入：/src/foo → <root>/src/foo
    if (url.startsWith('/src/')) {
      const hit = resolveFile(path.join(ROOT, url.slice(1)))
      return hit ? pathToFileURL(hit) : null
    }
    // Vite 的 resolve.alias 等价：wdesign/styles → packages/wdesign/src/styles/index.scss
    if (url === 'wdesign/styles' || url === '@w-run/wdesign/styles') {
      return pathToFileURL(path.join(PKG, 'wdesign', 'src', 'styles', 'index.scss'))
    }
    if (url.startsWith('wdesign/')) {
      const hit = resolveFile(path.join(PKG, 'wdesign', 'src', url.slice('wdesign/'.length)))
      return hit ? pathToFileURL(hit) : null
    }
    return null
  },
}

function compileSCSS(source, fromFile) {
  return sass.compileString(source, {
    loadPaths: [
      NM, SRC,
      path.join(PKG, 'wdesign', 'src', 'styles'),
      path.join(PKG, 'wdesign-icons'),
      ROOT,
    ].filter(Boolean),
    importers: [aliasImporter],
    style: 'expanded',
    quietDeps: true,
    silenceDeprecations: ['import', 'legacy-js-api', 'global-builtin', 'color-functions'],
    url: pathToFileURL(fromFile || path.join(SRC, 'styles.scss')),
  }).css
}

/** 跨项目构建时可跳过 wdesign 全量样式（blog 等不依赖 wdesign） */
const USE_WDESIGN = process.env.WCODE_WDESIGN !== '0'

function buildCSS() {
  const parts = []
  // 1. wdesign 全量样式（import 'wdesign/styles'）
  if (USE_WDESIGN) {
    parts.push(compileSCSS(`@use "wdesign/styles" as *;`, path.join(ROOT, 'wdesign-entry.scss')))
  }
  // 2. 自定义样式入口
  const mainScss = path.join(ROOT, STYLE_FILE)
  if (fs.existsSync(mainScss)) {
    parts.push(compileSCSS(INJECT + fs.readFileSync(mainScss, 'utf8'), mainScss))
  }
  // 3. 各 SFC 的 <style>
  parts.push(...collectedCSS)

  fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true })
  const css = parts.join('\n')
  fs.writeFileSync(path.join(DIST, 'assets', 'app.css'), css)
  return css.length
}

/* ------------------------------------------------------------------ */
function copyStatic() {
  // public/ → dist/（Vite 约定）；_fonts.scss 引用的是根相对路径 /fonts/*
  let n = 0
  const pub = path.join(ROOT, 'public')
  if (fs.existsSync(pub)) {
    for (const f of fs.readdirSync(pub)) {
      fs.cpSync(path.join(pub, f), path.join(DIST, f), { recursive: true })
    }
    const pubFonts = path.join(pub, 'fonts')
    if (fs.existsSync(pubFonts)) n = fs.readdirSync(pubFonts).length
  }
  // 兼容：src/assets/fonts 若存在，也落到 dist/fonts
  const srcFonts = path.join(SRC, 'assets', 'fonts')
  if (fs.existsSync(srcFonts)) {
    const outFonts = path.join(DIST, 'fonts')
    fs.mkdirSync(outFonts, { recursive: true })
    for (const f of fs.readdirSync(srcFonts)) {
      fs.copyFileSync(path.join(srcFonts, f), path.join(outFonts, f))
      n++
    }
  }
  return n
}

/**
 * 生成裁剪版图标数据：只保留源码中作为字符串出现过的图标名。
 * 图标名是 kebab-case 字面量（如 name="home"、icon: 'folder'），静态可析取。
 * 返回 null 表示无法安全解析，调用方应回退全量。
 */
function trimIconsData(iconsSrc) {
  try {
    const raw = fs.readFileSync(iconsSrc, 'utf8')
    // 文件形如：window.WD_ICONS = {...}; window.WD_ICON_COUNT = 431;
    // 用括号匹配（含字符串状态）精确截取 JSON 对象
    const start = raw.indexOf('{')
    if (start < 0) return null
    let depth = 0
    let inStr = false
    let esc = false
    let end = -1
    for (let i = start; i < raw.length; i++) {
      const ch = raw[i]
      if (inStr) {
        if (esc) esc = false
        else if (ch === '\\') esc = true
        else if (ch === '"') inStr = false
        continue
      }
      if (ch === '"') inStr = true
      else if (ch === '{') depth++
      else if (ch === '}') {
        depth--
        if (depth === 0) {
          end = i
          break
        }
      }
    }
    if (end < 0) return null
    const data = JSON.parse(raw.slice(start, end + 1))

    // 收集源码中的所有字符串字面量
    const words = new Set()
    const walk = (dir) => {
      for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
        if (ent.name === 'node_modules' || ent.name.startsWith('.')) continue
        const p = path.join(dir, ent.name)
        if (ent.isDirectory()) walk(p)
        else if (/\.(vue|ts|js|mjs)$/.test(ent.name)) {
          const txt = fs.readFileSync(p, 'utf8')
          for (const m of txt.matchAll(/['"`]([a-z0-9]+(?:-[a-z0-9]+)*)['"`]/g)) {
            words.add(m[1])
          }
        }
      }
    }
    walk(SRC)

    // 保底：布局/交互常用图标，避免动态拼接时漏掉
    for (const n of [
      'home', 'folder', 'search', 'info-circle', 'git-pull-request', 'settings',
      'menu', 'sun', 'moon', 'star', 'close', 'check', 'chevron-down', 'chevron-right',
      'arrow-right', 'arrow-left', 'user', 'plus', 'refresh', 'warning', 'trash',
    ]) {
      words.add(n)
    }

    const kept = {}
    for (const [key, svg] of Object.entries(data)) {
      const name = key.split('/')[1]
      if (words.has(name)) kept[key] = svg
    }
    if (!Object.keys(kept).length) return null

    const payload =
      '/* WDesign Icons — trimmed at build time (source-referenced only) */\n' +
      'window.WD_ICONS = ' +
      JSON.stringify(kept) +
      ';\n'
    console.log(
      `  图标裁剪: ${Object.keys(data).length} → ${Object.keys(kept).length} 个` +
        ` (${(raw.length / 1024).toFixed(0)}KB → ${(payload.length / 1024).toFixed(0)}KB)`,
    )
    return payload
  } catch {
    return null
  }
}

function buildHTML() {
  let html = fs.readFileSync(path.join(ROOT, HTML_FILE), 'utf8')
  html = html.replace('</head>', '  <link rel="stylesheet" href="/assets/app.css?v=__BUILD__" />\n  </head>')
  html = html.replace(/src="[^"]*main\.ts"/, 'src="/assets/app.js?v=__BUILD__"')

  // 图标数据：WdIcon 的回退路径依赖 window.WD_ICONS（非 Vite 环境没有 import.meta.glob）
  // —— 必须在 app.js 之前同步加载，否则首屏图标为空
  // 同时按源码实际引用裁剪，避免把 595 个图标（约 1.5MB）整包下发
  const iconsSrc = path.join(PKG, 'wdesign-icons', 'icons.data.js')
  if (fs.existsSync(iconsSrc)) {
    fs.mkdirSync(path.join(DIST, 'assets'), { recursive: true })
    const out = path.join(DIST, 'assets', 'icons.data.js')
    const trimmed = trimIconsData(iconsSrc)
    if (trimmed != null) {
      fs.writeFileSync(out, trimmed)
    } else {
      fs.copyFileSync(iconsSrc, out) // 裁剪失败时退回全量，保证正确性
    }
    html = html.replace(
      /<script type="module"/,
      '<script src="/assets/icons.data.js?v=__BUILD__"></script>\n    <script type="module"',
    )
  }

  html = html.replace(/__BUILD__/g, buildId)
  fs.writeFileSync(path.join(DIST, 'index.html'), html)
}

/* ------------------------------------------------------------------ */
const vuePlugin = {
  name: 'wcode-vue',
  setup(build) {
    // Vite 的 `?raw` 导入：以纯文本形式内联
    build.onResolve({ filter: /\?raw$/ }, (args) => ({
      path: path.resolve(args.resolveDir || ROOT, args.path.replace(/\?raw$/, '')),
      namespace: 'raw-text',
    }))
    build.onLoad({ filter: /.*/, namespace: 'raw-text' }, (args) => ({
      contents: `export default ${JSON.stringify(fs.readFileSync(args.path, 'utf8'))}`,
      loader: 'js',
    }))
    // 非浏览器模块：浏览器分支用不到（libv86 里靠 typeof process 判断），统一空实现
    build.onResolve(
      {
        filter:
          /^(node:|crypto$|fs$|fs\/promises$|path$|url$|os$|perf_hooks$|events$|stream$|buffer$|util$|zlib$|net$|tls$|http$|https$|child_process$|worker_threads$|assert$)/,
      },
      (args) => ({
      path: args.path,
      namespace: 'node-stub',
    }))
    build.onLoad({ filter: /.*/, namespace: 'node-stub' }, () => ({
      contents: 'export default {}; export const randomBytes = () => ({ readInt32LE: () => 0 });',
      loader: 'js',
    }))
    build.onLoad({ filter: /\.scss$|\.sass$/ }, () => ({ contents: '', loader: 'css' }))
    // .css 需要走 SFC 收集，否则漏样式（blog 有 xterm.css/wicon.css）
    build.onLoad({ filter: /\.css$/ }, (args) => {
      const css = fs.readFileSync(args.path, 'utf8')
      collectedCSS.push(css)
      return { contents: '', loader: 'js' }
    })
    build.onLoad({ filter: /\.vue$/ }, (args) => {
      const out = compileSFC(fs.readFileSync(args.path, 'utf8'), args.path)
      return { contents: out.code, loader: out.loader, resolveDir: path.dirname(args.path) }
    })
  },
}

async function main() {
  collectedCSS.length = 0
  fs.rmSync(DIST, { recursive: true, force: true })
  fs.mkdirSync(DIST, { recursive: true })
  const t0 = Date.now()

  await esbuild.build({
    entryPoints: [path.join(ROOT, ENTRY_FILE)],
    outfile: path.join(DIST, 'assets', 'app.js'),
    bundle: true,
    format: 'esm',
    target: ['safari15'],
    platform: 'browser',
    minify: !process.argv.includes('--no-minify'),
    legalComments: 'none',
    nodePaths: [NM],
    absWorkingDir: ROOT,
    logLevel: 'warning',
    define: {
      __VUE_OPTIONS_API__: 'true',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
      // 非 Vite 环境下补齐 import.meta.env（项目里会读 BASE_URL / DEV 等）
      'import.meta.env.BASE_URL': JSON.stringify(process.env.WCODE_BASE_URL || '/'),
      'import.meta.env.DEV': 'false',
      'import.meta.env.PROD': 'true',
      'import.meta.env.MODE': JSON.stringify('production'),
    },
    plugins: [aliasPlugin(), vuePlugin],
  })

  const cssLen = buildCSS()
  const fonts = copyStatic()
  buildHTML()

  const js = fs.statSync(path.join(DIST, 'assets', 'app.js')).size
  console.log(
    `✓ 构建完成 ${Date.now() - t0}ms · build=${buildId} · js=${(js / 1024 / 1024).toFixed(2)}MB · css=${(cssLen / 1024).toFixed(1)}KB · fonts=${fonts}`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
