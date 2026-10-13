import { defineStore } from 'pinia'
import { listRepos, searchRepos } from '@/api/repos'
import { listIssues } from '@/api/issues'
import { listMyOrgs } from '@/api/user'
import type { Organization, Repository } from '@/api/types'

/** 数据来源：api=真实后端，mock=后端不可达时的降级示例数据 */
export type DashboardSource = 'api' | 'mock'

/** 最近活动条目（由仓库更新时间派生） */
export interface ActivityItem {
  id: string
  repo: string
  message: string
  actor: string
  at: string
}

/** 跨仓库聚合的开放 Issue（首页 Issues 栏） */
export interface IssueRow {
  id: string
  number: number
  title: string
  repo: string
  updatedAt: string
}

/** 后端不可达 / 未登录时使用的降级示例数据 */
const MOCK_REPOS: Repository[] = [
  {
    id: 1,
    name: 'wcode',
    full_name: 'w-run/wcode',
    owner: { id: 1, login: 'w-run', avatar_url: '' },
    description: 'Gitea 定制前端 · 圆润便当盒风格的全新 Web UI',
    private: false,
    fork: false,
    default_branch: 'develop',
    language: 'TypeScript',
    stars_count: 128,
    forks_count: 24,
    open_issues_count: 6,
    open_pr_counter: 2,
    updated_at: '2026-10-11T08:30:00+08:00',
    html_url: 'https://github.com/w-run/wcode',
  },
  {
    id: 2,
    name: 'MeuOS-Kit',
    full_name: 'w-run/MeuOS-Kit',
    owner: { id: 1, login: 'w-run', avatar_url: '' },
    description: '轻量系统工具集与工程规约体系',
    private: false,
    fork: false,
    default_branch: 'main',
    language: 'Go',
    stars_count: 342,
    forks_count: 51,
    open_issues_count: 3,
    open_pr_counter: 1,
    updated_at: '2026-10-09T21:12:00+08:00',
    html_url: 'https://github.com/w-run/MeuOS-Kit',
  },
  {
    id: 3,
    name: 'w-box',
    full_name: 'w-run/w-box',
    owner: { id: 1, login: 'w-run', avatar_url: '' },
    description: 'Rocky Linux 自托管服务部署脚本与配置',
    private: false,
    fork: false,
    default_branch: 'main',
    language: 'Shell',
    stars_count: 57,
    forks_count: 9,
    open_issues_count: 1,
    open_pr_counter: 0,
    updated_at: '2026-10-05T14:00:00+08:00',
    html_url: 'https://github.com/w-run/w-box',
  },
]

/** 由仓库列表派生「最近活动」（后端无统一 activity 接口时的降级方案） */
function deriveActivity(repos: Repository[]): ActivityItem[] {
  return repos
    .filter((repo) => Boolean(repo.updated_at))
    .slice()
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? 0).getTime() -
        new Date(a.updated_at ?? 0).getTime(),
    )
    .slice(0, 5)
    .map((repo) => ({
      id: `act-${repo.id}`,
      repo: repo.full_name || repo.name,
      message: '更新了仓库',
      actor: repo.owner?.login ?? 'unknown',
      at: repo.updated_at as string,
    }))
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    repos: [] as Repository[],
    loading: false,
    /** 后端降级标记：true 表示当前展示的是示例数据 */
    source: 'api' as DashboardSource,
    /** 后端不可达时的错误信息（用于首页顶部温和提示，不阻断渲染） */
    error: '' as string,
    /** 我的组织 */
    orgs: [] as Organization[],
    /** 跨仓库的开放 Issue（按更新时间倒序） */
    openIssues: [] as IssueRow[],
  }),

  getters: {
    /** 置顶仓库：按 star 数取前 3 */
    pinnedRepos(state): Repository[] {
      return state.repos
        .slice()
        .sort((a, b) => b.stars_count - a.stars_count)
        .slice(0, 3)
    },

    /** 汇总统计：star / issue / PR 总数 */
    stats(state) {
      return {
        stars: state.repos.reduce((sum, r) => sum + (r.stars_count || 0), 0),
        issues: state.repos.reduce(
          (sum, r) => sum + (r.open_issues_count || 0),
          0,
        ),
        pulls: state.repos.reduce(
          (sum, r) => sum + (r.open_pr_counter || 0),
          0,
        ),
      }
    },

    /** 最近活动时间线 */
    recentActivity(state): ActivityItem[] {
      return deriveActivity(state.repos)
    },

    isEmpty(state): boolean {
      return !state.loading && state.repos.length === 0
    },
  },

  actions: {
    /**
     * 加载仪表盘数据。
     * 后端可达 → 使用真实数据；不可达 → 降级为示例数据（不报红屏）。
     */
    async fetchDashboard() {
      this.loading = true
      this.error = ''
      try {
        const repos = await listRepos(undefined, {
          sort: 'updated',
          order: 'desc',
          limit: 50,
        })
        this.repos = repos
        this.source = 'api'
      } catch {
        // 未登录 / 无权限时，降级为公开仓库搜索（仍展示真实数据）
        try {
          const repos = await searchRepos('', { limit: 50 })
          if (repos.length) {
            this.repos = repos
            this.source = 'api'
            return
          }
        } catch {
          // 后端不可达，继续降级
        }
        // 优雅降级：后端不可达时回退示例数据
        this.repos = MOCK_REPOS
        this.source = 'mock'
        this.error = '后端不可达，展示示例数据'
      } finally {
        this.loading = false
      }
      // 组织 / Issue 旁路加载，失败不影响主流程
      void this.fetchExtras()
    },

    /**
     * 加载「我的组织」与跨仓库开放 Issue。
     * 两者均为可选数据：任一失败只清空对应列表，不弹错。
     */
    async fetchExtras() {
      try {
        this.orgs = await listMyOrgs()
      } catch {
        this.orgs = []
      }

      const targets = this.repos.slice(0, 6)
      const settled = await Promise.allSettled(
        targets.map((r) => {
          const [owner, name] = (r.full_name || r.name).split('/')
          return listIssues(owner, name, { state: 'open', limit: 5 })
        }),
      )
      const rows: IssueRow[] = []
      settled.forEach((res, i) => {
        if (res.status !== 'fulfilled') return
        const repo = targets[i]
        for (const it of res.value) {
          rows.push({
            id: `${repo.id}-${it.id}`,
            number: it.number,
            title: it.title,
            repo: repo.full_name || repo.name,
            updatedAt: it.updated_at || it.created_at || '',
          })
        }
      })
      rows.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      this.openIssues = rows.slice(0, 6)
    },
  },
})
