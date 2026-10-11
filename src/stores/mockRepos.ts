import type { Repository, Branch } from '@/api/types'

/**
 * 本地 mock 仓库数据：当 Gitea 后端不可达时用于优雅降级。
 * 字段与 Gitea `/api/v1` 返回保持一致。
 */
export const MOCK_REPOS: Repository[] = [
  {
    id: 1,
    name: 'wcode',
    full_name: 'w-run/wcode',
    owner: { id: 1, login: 'w-run', full_name: 'w-run' },
    description: '保留 Gitea 后端能力、全新便当盒风格前端的定制 Web UI',
    private: false,
    fork: false,
    template: false,
    empty: false,
    archived: false,
    mirror: false,
    size: 2048,
    language: 'Vue',
    default_branch: 'develop',
    stars_count: 342,
    forks_count: 28,
    watchers_count: 15,
    open_issues_count: 6,
    open_pr_counter: 2,
    topics: ['vue', 'gitea', 'frontend', 'bento'],
    html_url: 'https://github.com/w-run/wcode',
    created_at: '2026-08-01T09:00:00Z',
    updated_at: '2026-10-10T16:20:00Z',
  },
  {
    id: 2,
    name: 'MeuOS-Kit',
    full_name: 'w-run/MeuOS-Kit',
    owner: { id: 1, login: 'w-run', full_name: 'w-run' },
    description: '系统级工程规约体系：分支策略、门禁、知识沉淀与多 Agent 协作',
    private: false,
    fork: false,
    default_branch: 'main',
    stars_count: 128,
    forks_count: 9,
    watchers_count: 7,
    open_issues_count: 3,
    topics: ['engineering', 'conventions', 'agents'],
    html_url: 'https://github.com/w-run/MeuOS-Kit',
    created_at: '2026-05-12T08:00:00Z',
    updated_at: '2026-10-09T11:05:00Z',
  },
  {
    id: 3,
    name: 'gitea',
    full_name: 'w-run/gitea',
    owner: { id: 1, login: 'w-run', full_name: 'w-run' },
    description:
      'Git with a cup of tea! Painless self-hosted all-in-one software development service',
    private: false,
    fork: true,
    default_branch: 'main',
    language: 'Go',
    stars_count: 51,
    forks_count: 4,
    open_issues_count: 0,
    topics: ['gitea', 'git', 'go'],
    html_url: 'https://github.com/w-run/gitea',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-10-08T20:41:00Z',
  },
  {
    id: 4,
    name: 'w-box-config',
    full_name: 'w-run/w-box-config',
    owner: { id: 1, login: 'w-run', full_name: 'w-run' },
    description: 'w-box（Rocky Linux）Nginx 反代与一键部署脚本配置',
    private: true,
    fork: false,
    default_branch: 'main',
    language: 'Shell',
    stars_count: 12,
    forks_count: 1,
    open_issues_count: 1,
    topics: ['nginx', 'deploy', 'rocky-linux'],
    html_url: 'https://github.com/w-run/w-box-config',
    created_at: '2026-06-20T12:00:00Z',
    updated_at: '2026-10-07T09:30:00Z',
  },
  {
    id: 5,
    name: 'mirror-sync',
    full_name: 'w-run/mirror-sync',
    owner: { id: 1, login: 'w-run', full_name: 'w-run' },
    description: 'Gitea 单向/双向镜像同步管理工具',
    private: false,
    fork: false,
    default_branch: 'develop',
    language: 'Python',
    stars_count: 27,
    forks_count: 3,
    open_issues_count: 2,
    topics: ['mirror', 'python', 'sync'],
    html_url: 'https://github.com/w-run/mirror-sync',
    created_at: '2026-07-15T14:00:00Z',
    updated_at: '2026-10-06T18:12:00Z',
  },
  {
    id: 6,
    name: 'dotfiles',
    full_name: 'w-run/dotfiles',
    owner: { id: 1, login: 'w-run', full_name: 'w-run' },
    description: '个人开发环境配置：zsh / tmux / nvim / git',
    private: false,
    fork: false,
    default_branch: 'main',
    language: 'Shell',
    stars_count: 8,
    forks_count: 0,
    open_issues_count: 0,
    topics: ['dotfiles', 'zsh', 'nvim'],
    html_url: 'https://github.com/w-run/dotfiles',
    created_at: '2026-01-10T07:00:00Z',
    updated_at: '2026-09-28T22:00:00Z',
  },
]

/** mock 分支列表 */
export const MOCK_BRANCHES: Branch[] = [
  { name: 'main', protected: true },
  { name: 'develop', protected: false },
  { name: 'feat/s3-repo', protected: false },
  { name: 'fix/api-timeout', protected: false },
]

/** mock README（Markdown 原文） */
export const MOCK_README = `# wcode

保留 Gitea 后端全部能力，用全新前端替换默认 Web UI。
风格：**圆润 · 便当盒卡片 · 色块区分 · 留白**。

## 技术栈

- Vue 3 + TypeScript + Vite
- SCSS + Pinia
- pnpm 管理依赖

## 快速开始

\`\`\`sh
pnpm install
pnpm dev
\`\`\`

## 目录结构

| 目录 | 说明 |
|------|------|
| \`src/api\` | Gitea OpenAPI v1 客户端封装 |
| \`src/components\` | UI / bento 组件 |
| \`src/views\` | 页面级组件 |

## 许可

MIT
`
