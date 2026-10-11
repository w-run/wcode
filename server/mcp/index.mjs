#!/usr/bin/env node
/**
 * wcode MCP 服务（Model Context Protocol）
 *
 * 传输：stdio（JSON-RPC 2.0 + Content-Length 分帧）
 * 依赖：零第三方依赖（Node 22 内置 fetch）
 *
 * 环境变量：
 *   GITEA_URL    Gitea 基础地址（默认 http://127.0.0.1:3000）
 *   GITEA_TOKEN  Gitea API Token（用户授权后提供）
 *
 * 接入：Claude Desktop / Cursor 等 MCP 客户端一行配置
 *   {"mcpServers": {"wcode": {"command": "node", "args": ["server/mcp/index.mjs"]}}}
 */

const GITEA_URL = process.env.GITEA_URL ?? 'http://127.0.0.1:3000'
const TOKEN = process.env.GITEA_TOKEN ?? ''

async function gitea(path, method = 'GET', body) {
  const headers = { Accept: 'application/json' }
  if (TOKEN) headers.Authorization = `token ${TOKEN}`
  const res = await fetch(`${GITEA_URL}/api/v1${path}`, {
    method,
    headers: body
      ? { ...headers, 'Content-Type': 'application/json' }
      : headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => '')
    throw new Error(`Gitea HTTP ${res.status}: ${msg.slice(0, 120)}`)
  }
  if (res.status === 204) return null
  return res.json()
}

/** 工具定义 */
const TOOLS = [
  {
    name: 'repo_list',
    description: '列出当前用户的所有仓库',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'repo_search',
    description: '搜索 Gitea 仓库',
    inputSchema: {
      type: 'object',
      properties: {
        q: { type: 'string', description: '搜索关键词' },
        limit: { type: 'number', description: '返回数量上限，默认 20' },
      },
      required: ['q'],
    },
  },
  {
    name: 'issue_list',
    description: '列出仓库的 Issue',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        state: { type: 'string', enum: ['open', 'closed', 'all'] },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'issue_create',
    description: '在仓库创建 Issue',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        title: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['owner', 'repo', 'title'],
    },
  },
  {
    name: 'pr_list',
    description: '列出仓库的 Pull Request',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        state: { type: 'string', enum: ['open', 'closed', 'all'] },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'repo_get',
    description: '获取仓库元数据（描述/语言/star/默认分支等）',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
      },
      required: ['owner', 'repo'],
    },
  },
  {
    name: 'file_read',
    description: '读取仓库中的文件内容（文本）',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        path: { type: 'string', description: '文件路径，如 src/main.ts' },
        ref: { type: 'string', description: '分支/tag，默认默认分支' },
      },
      required: ['owner', 'repo', 'path'],
    },
  },
  {
    name: 'issue_close',
    description: '关闭一个 Issue（需写权限 Token）',
    inputSchema: {
      type: 'object',
      properties: {
        owner: { type: 'string' },
        repo: { type: 'string' },
        index: { type: 'number', description: 'Issue 编号' },
      },
      required: ['owner', 'repo', 'index'],
    },
  },
  {
    name: 'repo_create',
    description: '为当前用户创建仓库（需写权限 Token）',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        private: { type: 'boolean', description: '是否私有，默认 false' },
        auto_init: {
          type: 'boolean',
          description: '是否初始化 README，默认 true',
        },
      },
      required: ['name'],
    },
  },
]

async function callTool(name, args) {
  switch (name) {
    case 'repo_list': {
      const data = await gitea('/user/repos?limit=50')
      return data
        .map(
          (r) =>
            `${r.full_name} ★${r.stars_count ?? 0} — ${r.description ?? ''}`,
        )
        .join('\n')
    }
    case 'repo_search': {
      const { q, limit = 20 } = args
      const res = await gitea(
        `/repos/search?q=${encodeURIComponent(q)}&limit=${limit}`,
      )
      return (res.data ?? [])
        .map(
          (r) =>
            `${r.full_name} ★${r.stars_count ?? 0} — ${r.description ?? ''}`,
        )
        .join('\n')
    }
    case 'issue_list': {
      const { owner, repo, state = 'open' } = args
      const data = await gitea(
        `/repos/${owner}/${repo}/issues?state=${state}&limit=50`,
      )
      return data
        .filter((i) => !i.pull_request)
        .map((i) => `#${i.number} [${i.state}] ${i.title}`)
        .join('\n')
    }
    case 'issue_create': {
      const { owner, repo, title, body = '' } = args
      const issue = await gitea(`/repos/${owner}/${repo}/issues`, 'POST', {
        title,
        body,
      })
      return `已创建 Issue #${issue.number}: ${issue.title}`
    }
    case 'pr_list': {
      const { owner, repo, state = 'open' } = args
      const data = await gitea(
        `/repos/${owner}/${repo}/pulls?state=${state}&limit=50`,
      )
      return data.map((p) => `#${p.number} [${p.state}] ${p.title}`).join('\n')
    }
    case 'repo_get': {
      const { owner, repo } = args
      const r = await gitea(`/repos/${owner}/${repo}`)
      return [
        `仓库: ${r.full_name}`,
        `描述: ${r.description ?? '（无）'}`,
        `语言: ${r.language ?? '（未知）'}  默认分支: ${r.default_branch}`,
        `Stars: ${r.stars_count ?? 0}  Forks: ${r.forks_count ?? 0}  Issues: ${r.open_issues_count ?? 0}`,
        `地址: ${r.html_url ?? ''}`,
      ].join('\n')
    }
    case 'file_read': {
      const { owner, repo, path, ref } = args
      const q = ref ? `?ref=${encodeURIComponent(ref)}` : ''
      const data = await gitea(`/repos/${owner}/${repo}/contents/${path}${q}`)
      const item = Array.isArray(data) ? data[0] : data
      if (!item || item.type === 'dir') {
        throw new Error(`路径是目录或不存在: ${path}`)
      }
      if (item.encoding === 'base64' && item.content) {
        return Buffer.from(item.content, 'base64').toString('utf8')
      }
      return String(item.content ?? '')
    }
    case 'issue_close': {
      const { owner, repo, index } = args
      await gitea(`/repos/${owner}/${repo}/issues/${index}`, 'PATCH', {
        state: 'closed',
      })
      return `已关闭 Issue #${index}`
    }
    case 'repo_create': {
      const { name, description = '' } = args
      const r = await gitea('/user/repos', 'POST', {
        name,
        description,
        private: Boolean(args.private),
        auto_init: args.auto_init ?? true,
      })
      return `已创建仓库 ${r.full_name}`
    }
    default:
      throw new Error(`未知工具: ${name}`)
  }
}

/* ---------------- stdio 分帧（Content-Length） ---------------- */

let buffer = ''

function sendFrame(str) {
  const bytes = Buffer.from(str, 'utf8')
  process.stdout.write(`Content-Length: ${bytes.length}\r\n\r\n${str}`)
}

function respond(id, result) {
  sendFrame(JSON.stringify({ jsonrpc: '2.0', id, result }))
}

function respondError(id, code, message) {
  sendFrame(JSON.stringify({ jsonrpc: '2.0', id, error: { code, message } }))
}

async function handleMessage(msg) {
  if (!msg || typeof msg !== 'object') return

  // 通知（无 id）：忽略
  if (msg.method === 'notifications/initialized') return

  if (msg.id === undefined || msg.id === null) return

  try {
    switch (msg.method) {
      case 'initialize': {
        respond(msg.id, {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'wcode-mcp', version: '0.1.0' },
        })
        return
      }
      case 'tools/list': {
        respond(msg.id, { tools: TOOLS })
        return
      }
      case 'tools/call': {
        const { name, arguments: args = {} } = msg.params ?? {}
        const text = await callTool(name, args)
        respond(msg.id, {
          content: [{ type: 'text', text }],
          isError: false,
        })
        return
      }
      case 'ping': {
        respond(msg.id, {})
        return
      }
      default: {
        respondError(msg.id, -32601, `Method not found: ${msg.method}`)
      }
    }
  } catch (err) {
    respondError(
      msg.id,
      -32603,
      err instanceof Error ? err.message : String(err),
    )
  }
}

function drainBuffer() {
  let match
  while ((match = buffer.match(/^Content-Length: (\d+)\r\n\r\n/))) {
    const len = Number(match[1])
    const headLen = match[0].length
    if (buffer.length < headLen + len) return
    const jsonStr = buffer.slice(headLen, headLen + len)
    buffer = buffer.slice(headLen + len)
    try {
      handleMessage(JSON.parse(jsonStr))
    } catch (err) {
      console.error(`[mcp] 解析消息失败: ${err.message}`)
    }
  }
}

process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  buffer += chunk
  drainBuffer()
})

process.stderr.write(
  `[wcode-mcp] 已启动（Gitea: ${GITEA_URL}${TOKEN ? '，已授权' : '，无 Token'}）\n`,
)
