// serve-static.mjs — 极简静态 npm 源服务器（仅验证用）
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.argv[2] || 'dist-npm'
const PORT = Number(process.argv[3] || 8899)

const mime = (p) =>
  p.endsWith('.tgz') ? 'application/octet-stream'
  : p.endsWith('.json') ? 'application/json'
  : 'application/json'

http
  .createServer((req, res) => {
    const clean = decodeURIComponent(req.url.split('?')[0])
    // 复刻 Nginx try_files：/wdesign → /wdesign.json → 404
    const candidates = [
      path.join(ROOT, clean),
      path.join(ROOT, clean + '.json'),
      path.join(ROOT, clean, 'package.json'),
    ]
    for (const f of candidates) {
      try {
        const st = fs.statSync(f)
        if (st.isFile()) {
          res.writeHead(200, {
            'Content-Type': mime(f),
            'Cache-Control': 'max-age=60',
          })
          fs.createReadStream(f).pipe(res)
          console.log('200', req.method, clean, '→', path.relative(ROOT, f))
          return
        }
      } catch {}
    }
    res.writeHead(404)
    res.end('not found')
    console.log('404', req.method, clean)
  })
  .listen(PORT, () => console.log(`static-npm 服务已启动: http://127.0.0.1:${PORT} (root=${ROOT})`))