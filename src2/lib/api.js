/**
 * 极简展示风仓库页 · 数据层
 * 直连 Gitea OpenAPI v1（同域 /api/v1，开发时由 tools/serve.mjs 代理）
 */
const BASE = '/api/v1'
const TOKEN_KEY = 'wcode-token'

function token() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setToken(t) {
  try {
    t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

async function req(path) {
  const headers = { Accept: 'application/json' }
  const t = token()
  if (t) headers.Authorization = `token ${t}`
  const res = await fetch(`${BASE}${path}`, { headers, credentials: 'same-origin' })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res
}

async function json(path) {
  return (await req(path)).json()
}

/* ------------------------------------------------------------------ */
export const api = {
  /** 当前登录用户（无 token 且未开匿名读取时可能 401） */
  me: () => json('/user'),

  /** 某用户的仓库列表 */
  userRepos: (owner, { page = 1, limit = 50 } = {}) =>
    json(`/users/${owner}/repos?page=${page}&limit=${limit}`),

  /** 仓库搜索（匿名可用） */
  search: (q = '', { page = 1, limit = 50 } = {}) =>
    json(`/repos/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`).then((r) => r.data ?? []),

  repo: (owner, name) => json(`/repos/${owner}/${name}`),

  /** README 原始文本（base64 → string） */
  async readme(owner, name, ref) {
    const r = await req(`/repos/${owner}/${name}/contents/README.md${ref ? `?ref=${ref}` : ''}`)
    const d = await r.json()
    const bin = atob((d.content || '').replace(/\n/g, ''))
    try {
      return decodeURIComponent(escape(bin))
    } catch {
      return bin
    }
  },

  hasReadme: (owner, name, ref) =>
    fetch(`${BASE}/repos/${owner}/${name}/contents/README.md${ref ? `?ref=${ref}` : ''}`).then((r) => r.ok),

  branches: (owner, name) => json(`/repos/${owner}/${name}/branches`),

  commits: (owner, name, { ref = '', limit = 8 } = {}) =>
    json(`/repos/${owner}/${name}/commits?limit=${limit}${ref ? `&sha=${ref}` : ''}&stat=false`),

  languages: (owner, name) => json(`/repos/${owner}/${name}/languages`),

  topics: (owner, name) =>
    json(`/repos/${owner}/${name}/topics`).then((r) => r.topics ?? []).catch(() => []),
}

/** 递归取仓库根目录内容 */
export function contents(owner, name, path = '', ref = '') {
  const q = [ref ? `ref=${ref}` : '', 'per_page=100'].filter(Boolean).join('&')
  return json(`/repos/${owner}/${name}/contents/${path}?${q}`)
}

/* ------------------------------------------------------------------ *
 *  聚合：一次把展示页需要的都取齐（容错，任一失败不阻塞）
 * ------------------------------------------------------------------ */
export async function loadShowcase(owner, name) {
  const repo = await api.repo(owner, name)
  const ref = repo.default_branch || 'main'

  const [readme, commits, branches, langs, topics, root] = await Promise.all([
    api.readme(owner, name, ref).catch(() => ''),
    api.commits(owner, name, { ref, limit: 6 }).catch(() => []),
    api.branches(owner, name).catch(() => []),
    api.languages(owner, name).catch(() => ({})),
    api.topics(owner, name).catch(() => []),
    contents(owner, name, '', ref).catch(() => []),
  ])

  return { repo, ref, readme, commits, branches, langs, topics, root }
}
