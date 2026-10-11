import { client, buildQuery } from './client'
import type { Issue, IssueListOptions, CreateIssueOptions } from './types'

/**
 * 列出仓库的 Issue
 * GET /repos/{owner}/{repo}/issues
 */
export async function listIssues(
  owner: string,
  repo: string,
  opts?: IssueListOptions,
): Promise<Issue[]> {
  return client.get<Issue[]>(
    `/repos/${owner}/${repo}/issues${buildQuery(opts)}`,
  )
}

/**
 * 获取单个 Issue 详情
 * GET /repos/{owner}/{repo}/issues/{index}
 */
export async function getIssue(
  owner: string,
  repo: string,
  number: number,
): Promise<Issue> {
  return client.get<Issue>(`/repos/${owner}/${repo}/issues/${number}`)
}

/**
 * 创建 Issue
 * POST /repos/{owner}/{repo}/issues
 */
export async function createIssue(
  owner: string,
  repo: string,
  data: CreateIssueOptions,
): Promise<Issue> {
  return client.post<Issue>(`/repos/${owner}/${repo}/issues`, data)
}
