/**
 * Gitea OpenAPI v1 类型定义
 *
 * 字段命名与 Gitea `/api/v1` 返回保持一致，仅覆盖前端当前使用到的字段。
 * 参考：https://docs.gitea.com/api/1.22/
 */

/** 用户 / 组织 */
export interface User {
  id: number
  login: string
  login_name?: string
  full_name?: string
  email?: string
  avatar_url?: string
  html_url?: string
  language?: string
  is_admin?: boolean
  created?: string
}

/** 仓库标签 */
export interface Label {
  id: number
  name: string
  color: string
  description?: string
  exclusive?: boolean
  is_archived?: boolean
}

/** 里程碑 */
export interface Milestone {
  id: number
  title: string
  description?: string
  state?: string
  open_issues?: number
  closed_issues?: number
  due_on?: string | null
  created_at?: string
  updated_at?: string
}

/** 仓库 */
export interface Repository {
  id: number
  name: string
  full_name: string
  owner: User
  description?: string
  private: boolean
  fork: boolean
  template?: boolean
  empty?: boolean
  archived?: boolean
  mirror?: boolean
  size?: number
  language?: string
  default_branch: string
  stars_count: number
  forks_count: number
  watchers_count?: number
  open_issues_count?: number
  open_pr_counter?: number
  website?: string
  topics?: string[]
  html_url?: string
  clone_url?: string
  ssh_url?: string
  created_at?: string
  updated_at?: string
}

/** 仓库搜索结果（Gitea `GET /repos/search`） */
export interface RepositorySearchResults {
  ok: boolean
  data: Repository[]
  total_count: number
}

/** 仓库文件内容（readme 等，Gitea contents 接口） */
export interface ContentsResponse {
  name?: string
  path?: string
  sha?: string
  type?: string
  size?: number
  encoding?: string
  content?: string
  html_url?: string
  download_url?: string
  url?: string
}

/** readme 精简结果：content 为按 encoding 编码的文本（通常 base64） */
export interface ReadmeContent {
  content: string
  encoding: string
}

/** commit 作者 / 提交者 */
export interface CommitUser {
  name: string
  email: string
  username?: string
}

/** 提交 */
export interface Commit {
  sha: string
  message: string
  author: CommitUser
  committer?: CommitUser
  /** 提交时间（ISO 8601）；对应 Gitea 的 `created` */
  commited_date?: string
  created?: string
  html_url?: string
}

/** 分支 */
export interface Branch {
  name: string
  protected: boolean
  commit?: Commit
}

/** PR 的目标/来源分支引用 */
export interface PullRequestBranch {
  label: string
  ref: string
  sha: string
  repo_id?: number
  repo?: Repository
}

/** PR 摘要（内嵌于 Issue 的 `pull_request` 字段） */
export interface PullRequestMeta {
  merged: boolean
  merged_at?: string | null
  draft?: boolean
  html_url?: string
}

/** Issue */
export interface Issue {
  id: number
  number: number
  title: string
  body?: string
  state: string
  user?: User
  labels?: Label[]
  assignees?: User[] | null
  milestone?: Milestone | null
  comments: number
  is_locked?: boolean
  due_date?: string | null
  created_at?: string
  updated_at?: string
  closed_at?: string | null
  html_url?: string
  url?: string
  pull_request?: PullRequestMeta | null
}

/** Pull Request */
export interface PullRequest {
  id: number
  number: number
  title: string
  body?: string
  state: string
  user?: User
  labels?: Label[]
  assignees?: User[] | null
  milestone?: Milestone | null
  comments?: number
  merged: boolean
  merged_at?: string | null
  mergeable?: boolean
  merged_by?: User | null
  head?: PullRequestBranch
  base?: PullRequestBranch
  draft?: boolean
  created_at?: string
  updated_at?: string
  closed_at?: string | null
  html_url?: string
  url?: string
}

/** 仓库搜索 / 列表的可选参数 */
export interface RepoSearchOptions {
  page?: number
  limit?: number
  sort?: 'alphabetically' | 'created' | 'updated' | 'size' | 'id'
  order?: 'asc' | 'desc'
  topic?: boolean
  includeDesc?: boolean
}

/** issue 列表的可选参数 */
export interface IssueListOptions {
  page?: number
  limit?: number
  state?: 'open' | 'closed' | 'all'
  labels?: string
  q?: string
  type?: 'issues' | 'pulls' | 'all'
  sort?:
    | 'oldest'
    | 'recentupdate'
    | 'recentclose'
    | 'leastupdate'
    | 'mostcomment'
    | 'leastcomment'
    | 'priority'
}

/** 新建 issue 的请求体 */
export interface CreateIssueOptions {
  title: string
  body?: string
  assignees?: string[]
  labels?: number[]
  milestone?: number
  due_date?: string
}

/** Issue / PR 评论 */
export interface Comment {
  id: number
  html_url?: string
  body?: string
  user?: User
  created_at?: string
  updated_at?: string
}

/** 新建评论的请求体 */
export interface CreateCommentOptions {
  body: string
}
