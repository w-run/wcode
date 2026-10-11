import { client, buildQuery } from './client'
import type {
  Repository,
  RepositorySearchResults,
  ReadmeContent,
  RepoSearchOptions,
} from './types'

/**
 * 搜索仓库
 * GET /repos/search
 */
export async function searchRepos(
  query: string,
  opts?: RepoSearchOptions,
): Promise<Repository[]> {
  const params = { ...opts, q: query }
  const { data } = await client.get<RepositorySearchResults>(
    `/repos/search${buildQuery(params)}`,
  )
  return data
}

/**
 * 列出用户自己的仓库（带可选过滤）
 * GET /user/repos
 */
export async function listRepos(
  user?: string,
  opts?: RepoSearchOptions,
): Promise<Repository[]> {
  const path = user ? `/users/${user}/repos` : '/user/repos'
  return client.get<Repository[]>(`${path}${buildQuery(opts)}`)
}

/**
 * 获取单个仓库
 * GET /repos/{owner}/{repo}
 */
export async function getRepo(
  owner: string,
  repo: string,
): Promise<Repository> {
  return client.get<Repository>(`/repos/${owner}/${repo}`)
}

/**
 * 获取仓库 README 内容（Base64 编码）
 * GET /repos/{owner}/{repo}/contents/README.md
 *
 * 返回 `content`（Base64 编码的 README 文本）与 `encoding`，由调用方解码。
 */
export async function getReadme(
  owner: string,
  repo: string,
): Promise<ReadmeContent> {
  return client.get<ReadmeContent>(`/repos/${owner}/${repo}/contents/README.md`)
}
