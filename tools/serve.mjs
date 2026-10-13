#!/usr/bin/env node
/**
 * WCode 本地预览服务器（等价 Vite server.proxy + preview）
 * ---------------------------------------------------------------
 * · 静态托管 dist/
 * · /api/* 反代到本地 Gitea :3000（同域 Cookie / token 均可）
 * · SPA 回退到 index.html
 *
 * 用法：WCODE_DEPS=/root/build/deps node tools/serve.mjs [port]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = process.env.WCODE_ROOT
  ? path.resolve(process.env.WCODE_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = process.env.SERVE_DIST ? path.resolve(process.env.SERVE_DIST) : path.join(ROOT, 'dist')
const PORT = Number(process.argv[2] || process.env.PORT || 8080)
const GITEA = process.env.GITEA_URL || 'http://127.0.0.1:3000'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
}

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'
  const file = path.join(DIST, urlPath)
  if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    // SPA 回退
    const fallback = fs.existsSync(path.join(DIST, 'index.html')) ? path.join(DIST, 'index.html') : null
    if (!fallback) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('404')
      return
    }
    res.writeHead(200, { 'content-type': MIME['.html'] })
    res.end(fs.readFileSync(fallback))
    return
  }
  const type = MIME[path.extname(file)] || 'application/octet-stream'
  res.writeHead(200, { 'content-type': type, 'cache-control': 'no-cache' })
  res.end(fs.readFileSync(file))
}

/* ------------------------------------------------------------------ *
 *  代码浏览器：文件树 / 文件内容
 *  优先走本地 bare 仓库（git 直接读，稳定），没有再回落到 Gitea API
 * ------------------------------------------------------------------ */
const GIT_ROOT =
  process.env.GIT_ROOT || '/root/build/deps/tmp-gitea/gitea/git'

function gitDirFor(owner, repo) {
  if (!fs.existsSync(GIT_ROOT)) return null
  const owners = fs.readdirSync(GIT_ROOT)
  const o = owners.find((x) => x.toLowerCase() === owner.toLowerCase())
  if (!o) return null
  const repos = fs.readdirSync(path.join(GIT_ROOT, o))
  const r = repos.find((x) => x.toLowerCase() === `${repo}.git`.toLowerCase())
  return r ? path.join(GIT_ROOT, o, r) : null
}

function git(args, gitDir) {
  return execFileSync('git', ['--git-dir', gitDir, ...args], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
}

/** 列出某目录内容（含 size / type） */
function gitList(gitDir, ref, dirPath) {
  const target = dirPath ? `${ref}:${dirPath}` : ref
  const out = git(['ls-tree', '--long', target], gitDir)
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      // <mode> <type> <sha> <size>\t<name>
      const [meta, name] = line.split('\t')
      const parts = meta.trim().split(/\s+/)
      const type = parts[1] === 'tree' ? 'dir' : 'file'
      const size = type === 'file' ? Number(parts[3]) || 0 : 0
      return {
        name,
        path: dirPath ? `${dirPath}/${name}` : name,
        type,
        size,
      }
    })
    .sort((a, b) =>
      a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1,
    )
}

/** 读取文件（二进制返回 null 标记） */
function gitRead(gitDir, ref, filePath) {
  const buf = execFileSync('git', ['--git-dir', gitDir, 'show', `${ref}:${filePath}`], {
    maxBuffer: 8 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
  if (buf.includes(0)) return { binary: true, size: buf.length }
  return { text: buf.toString('utf8'), size: buf.length }
}

function jsonRes(res, obj, code = 200) {
  res.writeHead(code, { 'content-type': MIME['.json'], 'cache-control': 'no-cache' })
  res.end(JSON.stringify(obj))
}

/** /repo-fs/<owner>/<repo>/tree?ref=&path=  |  /repo-fs/<owner>/<repo>/raw?ref=&path= */
async function repoFs(req, res) {
  const u = new URL(req.url, 'http://x')
  const m = u.pathname.match(/^\/repo-fs\/([^/]+)\/([^/]+)\/(tree|raw)$/)
  if (!m) return jsonRes(res, { error: 'bad path' }, 400)
  const [, owner, repo, kind] = m
  const ref = u.searchParams.get('ref') || 'HEAD'
  const filePath = u.searchParams.get('path') || ''

  const gitDir = gitDirFor(owner, repo)
  if (gitDir) {
    try {
      if (kind === 'tree') return jsonRes(res, { source: 'git', entries: gitList(gitDir, ref, filePath) })
      const r = gitRead(gitDir, ref, filePath)
      if (r.binary) return jsonRes(res, { source: 'git', binary: true, size: r.size })
      return jsonRes(res, { source: 'git', text: r.text, size: r.size })
    } catch (e) {
      /* 落到 Gitea API */
    }
  }

  // 回落：Gitea API
  try {
    const apiPath =
      kind === 'tree'
        ? `/api/v1/repos/${owner}/${repo}/contents/${filePath}?ref=${ref}&per_page=200`
        : `/api/v1/repos/${owner}/${repo}/raw/${filePath}?ref=${ref}`
    const upstream = await fetch(`${GITEA}${apiPath}`)
    if (!upstream.ok) return jsonRes(res, { error: `upstream ${upstream.status}` }, 502)
    if (kind === 'raw') {
      const text = await upstream.text()
      return jsonRes(res, { source: 'gitea', text, size: text.length })
    }
    const data = await upstream.json()
    const entries = (Array.isArray(data) ? data : [data]).map((f) => ({
      name: f.name,
      path: f.path,
      type: f.type === 'dir' ? 'dir' : 'file',
      size: f.size || 0,
    }))
    return jsonRes(res, { source: 'gitea', entries })
  } catch (e) {
    return jsonRes(res, { error: e.message }, 502)
  }
}

function fixtureFor(reqUrl) {
  const u = new URL(reqUrl, 'http://x')
  const p = u.pathname
  if (p === '/api/v1/repos/search') {
    const f = path.join(ROOT, 'src2', 'fixtures', 'search.json')
    return fs.existsSync(f) ? f : null
  }
  const m = p.match(/^\/api\/v1\/repos\/([^/]+)\/([^/]+)(\/.*)?$/)
  if (!m) return null
  const [, owner, repo, rest] = m
  const sub = (rest || '/').split('/').filter(Boolean)
  let kind
  if (sub.length === 0) kind = 'repos'
  else if (sub[0] === 'contents') {
    kind = sub.length === 1 ? 'contents' : 'readme' // 仅 README 做快照
  } else if (sub[0] === 'commits') kind = 'commits'
  else if (sub[0] === 'branches') kind = 'branches'
  else if (sub[0] === 'languages') kind = 'langs'
  else return null
  const file = path.join(ROOT, 'src2', 'fixtures', `${kind}.${owner}.${repo}.json`)
  return fs.existsSync(file) ? file : null
}

function fixtureFallback(req, res) {
  const file = fixtureFor(req.url)
  if (!file) {
    res.writeHead(503, { 'content-type': 'text/plain' })
    res.end('proxy error: gitea unavailable and no fixture')
    return
  }
  try {
    res.writeHead(200, { 'content-type': MIME['.json'], 'cache-control': 'no-cache' })
    res.end(fs.readFileSync(file))
  } catch (e) {
    res.writeHead(503, { 'content-type': 'text/plain' })
    res.end(`fixture error: ${e.message}`)
  }
}

function proxyApi(req, res) {
  const target = new URL(`${GITEA}${req.url}`)
  const proxy = http.request(
    target,
    {
      method: req.method,
      headers: { ...req.headers, host: target.host },
    },
    (upstream) => {
      // Gitea 宕机 / 接口 404 时，回退到静态快照
      if (upstream.statusCode === 502 || upstream.statusCode === 404 || upstream.statusCode >= 500) {
        return fixtureFallback(req, res)
      }
      res.writeHead(upstream.statusCode, upstream.headers)
      upstream.pipe(res)
    },
  )
  proxy.on('error', (e) => {
    console.error('proxy error → fixture fallback:', e.message)
    fixtureFallback(req, res)
  })
  req.pipe(proxy)
}

http
  .createServer((req, res) => {
    if (req.url.startsWith('/repo-fs/')) return repoFs(req, res)
    if (req.url.startsWith('/api/')) return proxyApi(req, res)
    serveStatic(req, res)
  })
  .listen(PORT, '127.0.0.1', () => {
    console.log(`▶ WCode 预览: http://127.0.0.1:${PORT}  （/api → ${GITEA}）`)
  })
