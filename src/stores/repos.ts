import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Repository, Branch } from '@/api/types'
import { ApiError } from '@/api/errors'
import { listRepos, getRepo, getReadme } from '@/api/repos'
import { client } from '@/api/client'
import { renderMarkdown, decodeContent } from '@/utils/markdown'
import { MOCK_REPOS, MOCK_BRANCHES, MOCK_README } from './mockRepos'

/** 加载状态 */
export type RepoLoadState = 'idle' | 'loading' | 'success' | 'error'

/** 从错误对象提取友好文案 */
function toMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

export const useReposStore = defineStore('repos', () => {
  // ============ 仓库列表 ============
  const allRepos = ref<Repository[]>([])
  const listState = ref<RepoLoadState>('idle')
  const listError = ref<string | null>(null)
  const searchQuery = ref('')
  /** 是否处于离线降级（后端不可达，展示 mock 数据） */
  const usingMock = ref(false)

  const filteredRepos = computed(() => {
    if (!searchQuery.value.trim()) return allRepos.value
    const q = searchQuery.value.toLowerCase()
    return allRepos.value.filter(
      (r) =>
        r.full_name.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        (r.language?.toLowerCase().includes(q) ?? false),
    )
  })

  async function fetchRepos() {
    listState.value = 'loading'
    listError.value = null
    try {
      allRepos.value = await listRepos()
      usingMock.value = false
      listState.value = 'success'
    } catch (err) {
      // 降级：展示本地 mock 数据，避免红屏
      listError.value = toMessage(err, '无法加载仓库列表')
      allRepos.value = MOCK_REPOS
      usingMock.value = true
      listState.value = 'success'
    }
  }

  // ============ 仓库详情 ============
  const currentRepo = ref<Repository | null>(null)
  const detailState = ref<RepoLoadState>('idle')
  const detailError = ref<string | null>(null)

  async function fetchRepoDetail(owner: string, name: string) {
    detailState.value = 'loading'
    detailError.value = null
    currentRepo.value = null
    try {
      currentRepo.value = await getRepo(owner, name)
      detailState.value = 'success'
    } catch (err) {
      // 降级：尝试用 mock 中同名仓库兜底
      const fallback = MOCK_REPOS.find(
        (r) =>
          r.name.toLowerCase() === name.toLowerCase() &&
          r.owner.login.toLowerCase() === owner.toLowerCase(),
      )
      if (fallback) {
        currentRepo.value = fallback
        detailState.value = 'success'
        return
      }
      detailError.value = toMessage(err, '无法加载仓库详情')
      detailState.value = 'error'
    }
  }

  // ============ README ============
  const readmeHtml = ref('')
  const readmeState = ref<RepoLoadState>('idle')
  const readmeError = ref<string | null>(null)

  async function fetchReadme(owner: string, name: string) {
    readmeState.value = 'loading'
    readmeError.value = null
    readmeHtml.value = ''
    try {
      const raw = await getReadme(owner, name)
      readmeHtml.value = renderMarkdown(
        decodeContent(raw.content, raw.encoding),
      )
      readmeState.value = 'success'
    } catch (err) {
      // 降级：展示 mock README
      readmeError.value = toMessage(err, '无法加载 README')
      readmeHtml.value = renderMarkdown(MOCK_README)
      readmeState.value = 'success'
    }
  }

  // ============ 分支列表 ============
  const branches = ref<Branch[]>([])
  const branchState = ref<RepoLoadState>('idle')

  async function fetchBranches(owner: string, name: string) {
    branchState.value = 'loading'
    try {
      branches.value = await client.get<Branch[]>(
        `/repos/${owner}/${name}/branches`,
      )
      branchState.value = 'success'
    } catch {
      branches.value = MOCK_BRANCHES
      branchState.value = 'success'
    }
  }

  return {
    allRepos,
    filteredRepos,
    listState,
    listError,
    searchQuery,
    usingMock,
    fetchRepos,
    currentRepo,
    detailState,
    detailError,
    fetchRepoDetail,
    readmeHtml,
    readmeState,
    readmeError,
    fetchReadme,
    branches,
    branchState,
    fetchBranches,
  }
})
