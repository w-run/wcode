import type { PullRequest, Comment } from '@/api/types'

/**
 * 本地 mock PR 数据：当 Gitea 后端不可达时用于优雅降级。
 * 字段与 Gitea `/api/v1` 返回保持一致。
 */
export const MOCK_PULLS: PullRequest[] = [
  {
    id: 101,
    number: 42,
    title: 'feat: 便当盒卡片网格与语言色点',
    body: '为仓库列表引入便当盒卡片网格，补齐语言色点与更新时间展示。',
    state: 'open',
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    merged: false,
    merged_at: null,
    mergeable: true,
    draft: false,
    comments: 2,
    head: { label: 'w-run:feat/repo-grid', ref: 'feat/repo-grid', sha: 'a1b2c3d' },
    base: { label: 'w-run:develop', ref: 'develop', sha: 'd4e5f6a' },
    created_at: '2026-10-10T09:12:00Z',
    updated_at: '2026-10-11T10:30:00Z',
    html_url: 'https://github.com/w-run/wcode/pulls/42',
  },
  {
    id: 102,
    number: 41,
    title: 'fix: 修正分支选择器的默认值绑定',
    body: '默认分支未正确回填，导致选择器初始值异常。',
    state: 'closed',
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    merged: true,
    merged_at: '2026-10-09T18:00:00Z',
    merged_by: { id: 1, login: 'w-run' },
    mergeable: true,
    draft: false,
    comments: 0,
    head: { label: 'w-run:fix/branch-select', ref: 'fix/branch-select', sha: '11aa22b' },
    base: { label: 'w-run:develop', ref: 'develop', sha: 'd4e5f6a' },
    created_at: '2026-10-08T14:20:00Z',
    updated_at: '2026-10-09T18:00:00Z',
    html_url: 'https://github.com/w-run/wcode/pulls/41',
  },
  {
    id: 103,
    number: 40,
    title: 'chore: 升级 shiki 到 1.x',
    body: '同步升级代码高亮依赖，受益于更小的包体积。',
    state: 'closed',
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    merged: false,
    merged_at: null,
    mergeable: false,
    draft: false,
    comments: 1,
    head: { label: 'w-run:chore/shiki', ref: 'chore/shiki', sha: '34cd56e' },
    base: { label: 'w-run:develop', ref: 'develop', sha: 'd4e5f6a' },
    created_at: '2026-10-05T11:00:00Z',
    updated_at: '2026-10-06T09:15:00Z',
    html_url: 'https://github.com/w-run/wcode/pulls/40',
  },
]

/** mock PR 详情（按 number 索引时兜底返回 42 号） */
export const MOCK_PULL_DETAIL: PullRequest = {
  ...MOCK_PULLS[0],
  body: `## 背景

仓库列表页需要更强的视觉分层，采用便当盒卡片网格。

## 变更

- 新增 \`RepoCard\` 语言色点
- 更新时间为相对时间（xx 天前）
- 网格断点自适应：移动端单列 → 桌面 3 列

## 验收

- [x] \`pnpm check\` 通过
- [x] 移动端单列布局正常`,
}

/** mock 评论列表 */
export const MOCK_COMMENTS: Comment[] = [
  {
    id: 1,
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    body: '配色看起来不错，建议把 star 计数也做成胶囊标签。',
    created_at: '2026-10-10T10:00:00Z',
  },
  {
    id: 2,
    user: { id: 1, login: 'w-run', full_name: 'w-run' },
    body: '已按反馈调整，等待合并。',
    created_at: '2026-10-11T09:30:00Z',
  },
]