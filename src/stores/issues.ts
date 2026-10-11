import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  Issue,
  IssueListOptions,
  CreateIssueOptions,
  Comment,
} from '@/api/types'
import { ApiError } from '@/api/errors'
import {
  listIssues,
  getIssue,
  createIssue,
  listIssueComments,
  createIssueComment,
} from '@/api/issues'
import { MOCK_ISSUES, MOCK_COMMENTS } from './mockIssues'

/** 加载状态 */
export type IssueLoadState = 'idle' | 'loading' | 'success' | 'error'

/** 从错误对象提取友好文案 */
function toMessage(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback
}

export const useIssuesStore = defineStore('issues', () => {
  // ============ Issue 列表 ============
  const issues = ref<Issue[]>([])
  const listState = ref<IssueLoadState>('idle')
  const listError = ref<string | null>(null)
  const usingMock = ref(false)
  /** 当前状态筛选：open / closed / all */
  const stateFilter = ref<'open' | 'closed' | 'all'>('open')
  /** 当前选中的标签名集合（多选） */
  const selectedLabels = ref<string[]>([])

  /** 标签去重汇总（用于过滤栏） */
  const allLabels = computed(() => {
    const seen = new Map<string, string>()
    for (const issue of issues.value) {
      for (const label of issue.labels ?? []) {
        if (!seen.has(label.name)) seen.set(label.name, label.color)
      }
    }
    return [...seen.entries()].map(([name, color]) => ({ name, color }))
  })

  /** 按状态 + 标签筛选后的列表 */
  const filteredIssues = computed(() => {
    return issues.value.filter((issue) => {
      const stateOk =
        stateFilter.value === 'all' || issue.state === stateFilter.value
      if (!stateOk) return false
      if (selectedLabels.value.length === 0) return true
      const names = new Set((issue.labels ?? []).map((l) => l.name))
      return selectedLabels.value.every((name) => names.has(name))
    })
  })

  async function fetchIssues(owner: string, repo: string) {
    listState.value = 'loading'
    listError.value = null
    try {
      const opts: IssueListOptions = { page: 1, limit: 50 }
      if (stateFilter.value !== 'all') opts.state = stateFilter.value
      if (selectedLabels.value.length > 0) {
        opts.labels = selectedLabels.value.join(',')
      }
      issues.value = await listIssues(owner, repo, opts)
      usingMock.value = false
      listState.value = 'success'
    } catch (err) {
      listError.value = toMessage(err, '无法加载 Issue 列表')
      issues.value = MOCK_ISSUES
      usingMock.value = true
      listState.value = 'success'
    }
  }

  // ============ Issue 详情 ============
  const currentIssue = ref<Issue | null>(null)
  const detailState = ref<IssueLoadState>('idle')
  const detailError = ref<string | null>(null)
  const comments = ref<Comment[]>([])
  const commentsState = ref<IssueLoadState>('idle')

  async function fetchIssueDetail(owner: string, repo: string, number: number) {
    detailState.value = 'loading'
    detailError.value = null
    currentIssue.value = null
    try {
      currentIssue.value = await getIssue(owner, repo, number)
      detailState.value = 'success'
    } catch (err) {
      const fallback = MOCK_ISSUES.find((i) => i.number === number)
      if (fallback) {
        currentIssue.value = fallback
        detailState.value = 'success'
        return
      }
      detailError.value = toMessage(err, '无法加载 Issue 详情')
      detailState.value = 'error'
    }
  }

  async function fetchComments(owner: string, repo: string, number: number) {
    commentsState.value = 'loading'
    try {
      comments.value = await listIssueComments(owner, repo, number)
      commentsState.value = 'success'
    } catch {
      comments.value = MOCK_COMMENTS
      commentsState.value = 'success'
    }
  }

  // ============ 新建 / 评论 ============
  const creating = ref(false)
  const createError = ref<string | null>(null)

  async function createNewIssue(
    owner: string,
    repo: string,
    data: CreateIssueOptions,
  ): Promise<Issue | null> {
    creating.value = true
    createError.value = null
    try {
      const issue = await createIssue(owner, repo, data)
      creating.value = false
      return issue
    } catch (err) {
      // 降级：本地生成一条 mock issue 追加到列表，保证交互不中断
      createError.value = toMessage(err, '创建 Issue 失败')
      const mock: Issue = {
        id: Date.now(),
        number: Math.max(0, ...issues.value.map((i) => i.number)) + 1,
        title: data.title,
        body: data.body,
        state: 'open',
        user: { id: 0, login: 'local', full_name: '本地预览' },
        labels: [],
        comments: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      issues.value.unshift(mock)
      usingMock.value = true
      creating.value = false
      return mock
    }
  }

  const commenting = ref(false)
  const commentError = ref<string | null>(null)

  async function addComment(
    owner: string,
    repo: string,
    number: number,
    body: string,
  ): Promise<Comment | null> {
    commenting.value = true
    commentError.value = null
    try {
      const comment = await createIssueComment(owner, repo, number, { body })
      comments.value.push(comment)
      commenting.value = false
      return comment
    } catch (err) {
      commentError.value = toMessage(err, '发表评论失败')
      const mock: Comment = {
        id: Date.now(),
        body,
        user: { id: 0, login: 'local', full_name: '本地预览' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      comments.value.push(mock)
      commenting.value = false
      return mock
    }
  }

  return {
    issues,
    listState,
    listError,
    usingMock,
    stateFilter,
    selectedLabels,
    allLabels,
    filteredIssues,
    fetchIssues,
    currentIssue,
    detailState,
    detailError,
    comments,
    commentsState,
    fetchIssueDetail,
    fetchComments,
    creating,
    createError,
    createNewIssue,
    commenting,
    commentError,
    addComment,
  }
})
