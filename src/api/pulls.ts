import { client, buildQuery } from './client'
import type {
  PullRequest,
  PullListOptions,
  CreatePullOptions,
  Comment,
  CreateCommentOptions,
} from './types'

/**
 * 列出仓库的 Pull Request（支持按 state 过滤）
 * GET /repos/{owner}/{repo}/pulls
 */
export async function listPulls(
  owner: string,
  repo: string,
  opts?: PullListOptions,
): Promise<PullRequest[]> {
  return client.get<PullRequest[]>(
    `/repos/${owner}/${repo}/pulls${buildQuery(opts)}`,
  )
}

/**
 * 获取单个 Pull Request 详情
 * GET /repos/{owner}/{repo}/pulls/{index}
 */
export async function getPull(
  owner: string,
  repo: string,
  index: number,
): Promise<PullRequest> {
  return client.get<PullRequest>(`/repos/${owner}/${repo}/pulls/${index}`)
}

/**
 * 创建 Pull Request
 * POST /repos/{owner}/{repo}/pulls
 */
export async function createPull(
  owner: string,
  repo: string,
  data: CreatePullOptions,
): Promise<PullRequest> {
  return client.post<PullRequest>(`/repos/${owner}/${repo}/pulls`, data)
}

/**
 * 合并 Pull Request
 * POST /repos/{owner}/{repo}/pulls/{index}/merge
 */
export async function mergePull(
  owner: string,
  repo: string,
  index: number,
): Promise<void> {
  return client.post<void>(`/repos/${owner}/${repo}/pulls/${index}/merge`, {})
}

/**
 * 列出 Issue/PR 的评论（PR 复用 issue 评论接口）
 * GET /repos/{owner}/{repo}/issues/{index}/comments
 */
export async function listComments(
  owner: string,
  repo: string,
  index: number,
): Promise<Comment[]> {
  return client.get<Comment[]>(
    `/repos/${owner}/${repo}/issues/${index}/comments`,
  )
}

/**
 * 添加 Issue/PR 评论（PR 复用 issue 评论接口）
 * POST /repos/{owner}/{repo}/issues/{index}/comments
 */
export async function createComment(
  owner: string,
  repo: string,
  index: number,
  data: CreateCommentOptions,
): Promise<Comment> {
  return client.post<Comment>(
    `/repos/${owner}/${repo}/issues/${index}/comments`,
    data,
  )
}
