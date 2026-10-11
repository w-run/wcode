import type { Issue, Comment } from '@/api/types'

/** 后端不可达时用于降级的 mock Issue 列表 */
export const MOCK_ISSUES: Issue[] = [
  {
    id: 1,
    number: 42,
    title: '前端：Issue 列表页缺少状态筛选 Tabs',
    body: '## 问题描述\n\n当前 Issue 列表页没有 Open / Closed / All 的状态切换 Tab，导致用户无法快速筛选。\n\n## 期望行为\n\n在列表页顶部增加状态切换 Tab，支持 Open / Closed / All 三种筛选。\n\n## 优先级\n\nP2',
    state: 'open',
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    labels: [
      { id: 101, name: 'frontend', color: '3b82f6', description: '' },
      { id: 102, name: 'enhancement', color: '16a34a', description: '' },
    ],
    comments: 3,
    created_at: '2026-10-01T08:00:00Z',
    updated_at: '2026-10-10T16:20:00Z',
    html_url: 'https://gitea.example.com/w-run/wcode/issues/42',
  },
  {
    id: 2,
    number: 41,
    title: 'MCP 服务在 Linux 下启动报 permission denied',
    body: '## 环境\n\nRocky Linux 9.2，Node.js 22\n\n## 复现步骤\n\n```sh\nnode dist/mcp-server/index.js\n```\n\n## 错误\n\n\`permission denied\` 错误，需要 `chmod +x` 后才能运行。',
    state: 'open',
    user: { id: 2, login: 'dev-alice', full_name: 'Alice' },
    labels: [
      { id: 103, name: 'bug', color: 'dc2626', description: '' },
      { id: 104, name: 'mcp', color: '9333ea', description: '' },
    ],
    comments: 1,
    created_at: '2026-10-03T10:30:00Z',
    updated_at: '2026-10-09T11:05:00Z',
    html_url: 'https://gitea.example.com/w-run/wcode/issues/41',
  },
  {
    id: 3,
    number: 40,
    title: 'docs: 补充 CI/CD 门禁管道文档',
    body: '当前 `.github/workflows/` 下的门禁流程没有文档，新成员难以理解各个 step 的作用。',
    state: 'closed',
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    labels: [
      { id: 105, name: 'documentation', color: 'ca8a04', description: '' },
    ],
    comments: 0,
    created_at: '2026-09-20T14:00:00Z',
    updated_at: '2026-09-28T18:00:00Z',
    closed_at: '2026-09-28T18:00:00Z',
    html_url: 'https://gitea.example.com/w-run/wcode/issues/40',
  },
  {
    id: 4,
    number: 39,
    title: 'repo-card-grid: 移动端布局错位',
    body: '在 iPhone SE（320px）上，RepoCard 网格出现横向滚动条，卡片被截断。',
    state: 'open',
    user: { id: 3, login: 'qa-bob', full_name: 'Bob' },
    labels: [
      { id: 106, name: 'bug', color: 'dc2626', description: '' },
      { id: 107, name: 'mobile', color: 'f97316', description: '' },
    ],
    comments: 2,
    created_at: '2026-10-05T09:00:00Z',
    updated_at: '2026-10-08T20:41:00Z',
    html_url: 'https://gitea.example.com/w-run/wcode/issues/39',
  },
  {
    id: 5,
    number: 38,
    title: 'feat: 落地页生成器支持自定义域名',
    body: '希望落地页生成器能够支持绑定自定义域名，便于用户使用自己的品牌域名。',
    state: 'closed',
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    labels: [
      { id: 108, name: 'enhancement', color: '16a34a', description: '' },
    ],
    comments: 5,
    created_at: '2026-08-15T12:00:00Z',
    updated_at: '2026-09-10T15:30:00Z',
    closed_at: '2026-09-10T15:30:00Z',
    html_url: 'https://gitea.example.com/w-run/wcode/issues/38',
  },
]

/** mock 评论列表 */
export const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    body: '确认可以复现。看起来是响应式断点设置的问题。',
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    created_at: '2026-10-01T09:30:00Z',
    updated_at: '2026-10-01T09:30:00Z',
  },
  {
    id: 2,
    body: '我来看一下，优先修移动端断点的问题。',
    user: { id: 2, login: 'dev-alice', full_name: 'Alice' },
    created_at: '2026-10-02T10:00:00Z',
    updated_at: '2026-10-02T10:00:00Z',
  },
  {
    id: 3,
    body: '已提交 PR #43，修复了网格响应式问题。',
    user: { id: 2, login: 'dev-alice', full_name: 'Alice' },
    created_at: '2026-10-03T14:20:00Z',
    updated_at: '2026-10-03T14:20:00Z',
  },
]
