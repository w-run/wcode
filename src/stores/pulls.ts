import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PullRequest, Comment, CreatePullOptions } from '@/api/types'
import { ApiError } from '@/api/errors'
import {
  listPulls,
  getPull,
  createPull,
  mergePull,
  listComments,
  createComment,
} from '@/api/pulls'
import { MOCK_PULLS, MOCK_PULL_DETAIL, MOCK_COMMENTS } from './mockPulls'

/** 加载状态 */
export type PullLoadState = 'idle' | 'loading' | 'success' | 'error'

/** 列表过滤：open / closed / merged（三态互斥） */
export type PullFilter = 'open' | 'closed' | 'merged'

/** PR 展示状态：merged 由 Gitea `merged=true` 推导 */
export type PullStatus = 'open' | 'closed' | 'merged'

/** 根据 Gitea PullRequest 推导展示状态 */
export function resolvePullStatus(pr: PullRequest): PullStatus {
  if (pr.merged) return 'merged'
  return pr.state === 'open' ? 'open' : 'closed'
}

/** 从错误对象提取友好文案 */
function toMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

export const usePullsStore = defineStore('pulls', () => {
  // ============ PR 列表 ============
  const pulls = ref<PullRequest[]>([])
  const listState = ref<PullLoadState>('idle')
  const listError = ref<string | null>(null)
  const filter = ref<PullFilter>('open')
  /** 是否处于离线降级（后端不可达，展示 mock 数据） */
  const usingMock = ref(false)

  const filteredPulls = computed(() =>
    pulls.value.filter((pr) => resolvePullStatus(pr) === filter.value),
  )

  const openCount = computed(
    () => pulls.value.filter((pr) => resolvePullStatus(pr) === 'open').length,
  )
  const closedCount = computed(
    () => pulls.value.filter((pr) => resolvePullStatus(pr) === 'closed').length,
  )
  const mergedCount = computed(
    () => pulls.value.filter((pr) => resolvePullStatus(pr) === 'merged').length,
  )

  async function fetchPulls(owner: string, name: string) {
    listState.value = 'loading'
    listError.value = null
    try {
      pulls.value = await listPulls(owner, name, {
        state: 'all',
        limit: 50,
        type: 'pulls',
      })
      usingMock.value = false
      listState.value = 'success'
    } catch (err) {
      // 降级：展示本地 mock 数据，避免红屏
      listError.value = toMessage(err, '无法加载 PR 列表')
      pulls.value = MOCK_PULLS
      usingMock.value = true
      listState.value = 'success'
    }
  }

  function setFilter(next: PullFilter) {
    filter.value = next
  }

  // ============ 新建 PR ============
  const creating = ref(false)
  const createError = ref<string | null>(null)

  async function createNewPull(
    owner: string,
    name: string,
    data: CreatePullOptions,
  ): Promise<PullRequest | null> {
    creating.value = true
    createError.value = null
    try {
      const created = await createPull(owner, name, data)
      pulls.value = [created, ...pulls.value]
      return created
    } catch (err) {
      createError.value = toMessage(err, '创建 PR 失败')
      return null
    } finally {
      creating.value = false
    }
  }

  // ============ PR 详情 ============
  const currentPull = ref<PullRequest | null>(null)
  const detailState = ref<PullLoadState>('idle')
  const detailError = ref<string | null>(null)

  async function fetchPullDetail(owner: string, name: string, number: number) {
    detailState.value = 'loading'
    detailError.value = null
    currentPull.value = null
    try {
      currentPull.value = await getPull(owner, name, number)
      detailState.value = 'success'
    } catch (err) {
      // 降级：优先用列表数据中同编号 PR 兜底
      const fallback = pulls.value.find((pr) => pr.number === number)
      if (fallback) {
        currentPull.value = fallback
        detailState.value = 'success'
        return
      }
      currentPull.value = MOCK_PULL_DETAIL
      detailState.value = 'success'
      usingMock.value = true
      detailError.value = toMessage(err, '无法加载 PR 详情')
    }
  }

  // ============ 合并 ============
  const merging = ref(false)
  const mergeError = ref<string | null>(null)
  const mergeDone = ref(false)

  async function doMerge(owner: string, name: string, number: number) {
    merging.value = true
    mergeError.value = null
    mergeDone.value = false
    try {
      await mergePull(owner, name, number)
      mergeDone.value = true
      if (currentPull.value) {
        currentPull.value = {
          ...currentPull.value,
          merged: true,
          state: 'closed',
          merged_at: new Date().toISOString(),
        }
      }
    } catch (err) {
      mergeError.value = toMessage(err, '合并失败')
    } finally {
      merging.value = false
    }
  }

  // ============ 评论 ============
  const comments = ref<Comment[]>([])
  const commentsState = ref<PullLoadState>('idle')
  const sendingComment = ref(false)
  const commentError = ref<string | null>(null)

  async function fetchComments(owner: string, name: string, number: number) {
    commentsState.value = 'loading'
    try {
      comments.value = await listComments(owner, name, number)
      usingMock.value = false
      commentsState.value = 'success'
    } catch {
      // 降级：展示 mock 评论
      comments.value = MOCK_COMMENTS
      usingMock.value = true
      commentsState.value = 'success'
    }
  }

  async function addComment(
    owner: string,
    name: string,
    number: number,
    body: string,
  ) {
    const content = body.trim()
    if (!content) return
    sendingComment.value = true
    commentError.value = null
    try {
      const created = await createComment(owner, name, number, { body: content })
      comments.value = [...comments.value, { ...created, body: content }]
      return true
    } catch (err) {
      commentError.value = toMessage(err, '评论发送失败')
      return false
    } finally {
      sendingComment.value = false
    }
  }

  return {
    pulls,
    filteredPulls,
    listState,
    listError,
    filter,
    openCount,
    closedCount,
    mergedCount,
    usingMock,
    fetchPulls,
    setFilter,
    creating,
    createError,
    createNewPull,
    currentPull,
    detailState,
    detailError,
    fetchPullDetail,
    merging,
    mergeError,
    mergeDone,
    doMerge,
    comments,
    commentsState,
    sendingComment,
    commentError,
    fetchComments,
    addComment,
  }
})