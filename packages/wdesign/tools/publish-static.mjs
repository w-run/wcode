#!/usr/bin/env node
/**
 * publish-static.mjs — 把当前包发布到「纯静态 npm 源」
 *
 * 原理：npm 客户端只需要两个 GET 请求
 *   1. GET  <base>/<pkg>                        → 返回包元数据（packument JSON）
 *   2. GET  <base>/<pkg>/-/<pkg>-<version>.tgz  → 返回 tarball
 * 因此只要把这两个文件放到静态目录即可，无需任何后端进程。
 *
 * 用法：
 *   NPM_BASE_URL=https://box.w-run.net/npm node tools/publish-static.mjs [输出目录]
 *
 * 产物结构（输出目录）：
 *   <pkg>.json                  ← 元数据 JSON（Nginx 用 try_files 把 /<pkg> 重写到它）
 *   <pkg>/-/<pkg>-<ver>.tgz     ← tarball
 */
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const OUT = process.argv[2] || process.env.OUT_DIR || 'dist-npm'
const BASE = (process.env.NPM_BASE_URL || 'https://box.w-run.net/npm').replace(/\/$/, '')
const PKG_DIR = process.cwd()
const pkg = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8'))
const name = pkg.name
const version = pkg.version

if (!name || !version) {
  console.error('✗ package.json 缺少 name / version')
  process.exit(1)
}

// ── 1) 打包 tgz ──
console.log(`▸ 打包 ${name}@${version} …`)
const packOut = execFileSync('npm', ['pack', '--silent', '--pack-destination', OUT], {
  cwd: PKG_DIR,
  encoding: 'utf8',
}).trim()
const tgzName = packOut.split('\n').pop().trim()
const tgzPath = path.join(OUT, tgzName)
const buf = fs.readFileSync(tgzPath)

// ── 2) 计算 shasum(sha1) 与 integrity(sha512) ──
const shasum = createHash('sha1').update(buf).digest('hex')
const integrity = 'sha512-' + createHash('sha512').update(buf).digest('base64')

// ── 3) 归位：<pkg>/-/<tgz>（scope 包名 → 目录 @scope/name/）──
const dir = path.join(OUT, name, '-')
fs.mkdirSync(dir, { recursive: true })
const finalTgz = path.join(dir, tgzName)
fs.renameSync(tgzPath, finalTgz)

// ── 4) 生成/合并 packument ──
const metaPath = path.join(OUT, name + '.json')   // scope 名会自然形成 @scope/name.json
let doc = {
  name,
  'dist-tags': {},
  versions: {},
  time: {},
  modified: new Date().toISOString(),
}
if (fs.existsSync(metaPath)) {
  try {
    doc = JSON.parse(fs.readFileSync(metaPath, 'utf8'))
  } catch {
    console.warn('⚠ 已有元数据无法解析，将覆盖重建')
  }
}

const manifest = {
  name,
  version,
  description: pkg.description,
  keywords: pkg.keywords,
  license: pkg.license,
  main: pkg.main,
  module: pkg.module,
  types: pkg.types,
  exports: pkg.exports,
  sideEffects: pkg.sideEffects,
  peerDependencies: pkg.peerDependencies,
  dependencies: pkg.dependencies,
  dist: {
    tarball: `${BASE}/${name}/-/${tgzName}`,
    shasum,
    integrity,
  },
}

doc.versions[version] = manifest
doc['dist-tags'].latest = version
doc['dist-tags'][version] = version
doc.time[version] = new Date().toISOString()
doc.modified = new Date().toISOString()
// 顶层保留最新版的常用字段，兼容老客户端
doc['dist-tags'].latest = version
fs.writeFileSync(metaPath, JSON.stringify(doc, null, 2))

console.log(`✓ 已生成静态源产物：`)
console.log(`  ${path.relative(PKG_DIR, metaPath)}         (元数据)`)
console.log(`  ${path.relative(PKG_DIR, finalTgz)}   (tarball)`)
console.log(`  shasum:    ${shasum}`)
console.log(`  integrity: ${integrity}`)
console.log(`\n下一步（本地验证）：`)
console.log(`  cd ${OUT} && python3 -m http.server 8899`)
console.log(`  npm install ${name} --registry http://localhost:8899 --no-audit --no-fund`)
console.log(`\n下一步（部署到 w-box 静态目录）：`)
console.log(`  rsync -av ${OUT}/ root@w-box:/workspace/static/npm/`)
