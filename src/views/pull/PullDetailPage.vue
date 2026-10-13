<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { usePullsStore, resolvePullStatus } from '@/stores/pulls'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Avatar from '@/components/ui/Avatar.vue'
import Skeleton from '@/components/feedback/Skeleton.vue'
import ErrorState from '@/components/feedback/ErrorState.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { renderMarkdown } from '@/utils/markdown'
import { formatRelativeTime } from '@/utils/format'

const props = defineProps<{
  owner: string
  name: string
  number: string
}>()

const store = usePullsStore()

const pull = computed(() => store.currentPull)
const status = computed(() =>
  pull.value ? resolvePullStatus(pull.value) : 'open',
)

const statusLabel = computed(() => {
  switch (status.value) {
    case 'open':
      return '打开'
    case 'merged':
      return '已合并'
    default:
      return '已关闭'
  }
})

const statusVariant = computed<'success' | 'accent' | 'danger'>(() => {
  switch (status.value) {
    case 'open':
      return 'success'
    case 'merged':
      return 'accent'
    default:
      return 'danger'
  }
})

/** 是否可合并：打开且未合并 */
const canMerge = computed(
  () =>
    !!pull.value && status.value === 'open' && pull.value.mergeable !== false,
)

const bodyHtml = computed(() =>
  pull.value?.body ? renderMarkdown(pull.value.body) : '',
)

/** 评论输入 */
const commentText = ref('')

const isLoading = computed(() => store.detailState === 'loading')

async function handleMerge() {
  await store.doMerge(props.owner, props.name, Number(props.number))
}

async function handleAddComment() {
  const ok = await store.addComment(
    props.owner,
    props.name,
    Number(props.number),
    commentText.value,
  )
  if (ok) commentText.value = ''
}

onMounted(async () => {
  await store.fetchPullDetail(props.owner, props.name, Number(props.number))
  await store.fetchComments(props.owner, props.name, Number(props.number))
})
</script>

<template>
  <div class="pull-detail-page">
    <!-- 加载态 -->
    <template v-if="isLoading">
      <Skeleton height="28px" width="70%" />
      <Skeleton height="16px" width="40%" />
      <Skeleton height="200px" border-radius="16px" />
    </template>

    <!-- 错误态 -->
    <template v-else-if="store.detailState === 'error'">
      <ErrorState
        :message="store.detailError ?? '无法加载 PR 详情'"
        @retry="
          store.fetchPullDetail(props.owner, props.name, Number(props.number))
        "
      />
    </template>

    <template v-else-if="pull">
      <!-- 标题栏 -->
      <header class="pd__header">
        <div class="pd__titlebar">
          <h1 class="pd__title">
            <span class="pd__number">#{{ pull.number }}</span>
            {{ pull.title }}
          </h1>
          <Badge :variant="statusVariant">{{ statusLabel }}</Badge>
        </div>

        <div class="pd__actions">
          <Button
            v-if="canMerge"
            :loading="store.merging"
            :disabled="store.merging"
            size="sm"
            @click="handleMerge"
          >
            合并
          </Button>
          <span v-if="store.mergeDone" class="pd__merge-done" role="status">
            已合并
          </span>
          <span v-if="store.mergeError" class="pd__merge-error" role="alert">
            {{ store.mergeError }}
          </span>
        </div>
      </header>

      <!-- 分支信息 -->
      <div class="pd__branches">
        <span class="branch-chip">{{ pull.head?.ref ?? '—' }}</span>
        <svg
          class="branch-arrow"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M8.75 1.75v11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 1 1 1.06-1.06l3.72 3.72V1.75a.75.75 0 0 1 1.5 0Z"
          />
        </svg>
        <span class="branch-chip branch-chip--base">{{
          pull.base?.ref ?? '—'
        }}</span>
        <span class="pd__author">
          <Avatar
            :src="pull.user?.avatar_url"
            :name="pull.user?.login"
            size="sm"
          />
          <span>{{ pull.user?.login ?? 'unknown' }}</span>
        </span>
      </div>

      <!-- 正文（Markdown） -->
      <article v-if="bodyHtml" class="pd__card pd__body" v-html="bodyHtml" />

      <!-- 评论列表 -->
      <section class="pd__comments">
        <h2 class="pd__section-title">评论（{{ store.comments.length }}）</h2>

        <div v-if="store.commentsState === 'loading'" class="pd__comment-list">
          <Skeleton height="64px" border-radius="12px" />
        </div>

        <div v-else-if="store.comments.length === 0" class="pd__comments-empty">
          <EmptyState title="还没有评论" description="留下第一条评论吧" />
        </div>

        <ul v-else class="pd__comment-list">
          <li v-for="c in store.comments" :key="c.id" class="comment">
            <Avatar :src="c.user?.avatar_url" :name="c.user?.login" size="sm" />
            <div class="comment__main">
              <div class="comment__head">
                <span class="comment__author">{{
                  c.user?.login ?? 'unknown'
                }}</span>
                <time class="comment__time">{{
                  formatRelativeTime(c.created_at)
                }}</time>
              </div>
              <p class="comment__body">{{ c.body }}</p>
            </div>
          </li>
        </ul>
      </section>

      <!-- 添加评论 -->
      <section class="pd__add-comment">
        <h2 class="pd__section-title">添加评论</h2>
        <textarea
          v-model="commentText"
          class="pd__textarea"
          rows="4"
          placeholder="写下你的评论…"
          aria-label="评论内容"
        />
        <div v-if="store.commentError" class="pd__comment-error" role="alert">
          {{ store.commentError }}
        </div>
        <div class="pd__add-actions">
          <Button
            :loading="store.sendingComment"
            :disabled="!commentText.trim()"
            size="sm"
            @click="handleAddComment"
          >
            发表评论
          </Button>
        </div>
      </section>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.pull-detail-page {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-6);
  padding: var(--wd-space-6);
  max-width: 900px;
  margin: 0 auto;
}

.pd {
  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--wd-space-4);
  }

  &__titlebar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wd-space-3);
    min-width: 0;
  }

  &__title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.4;
    color: var(--wd-ink);
    word-break: break-word;
  }

  &__number {
    color: var(--wd-ink-2);
    font-weight: 500;
  }

  &__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wd-space-3);
  }

  &__merge-done {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--wd-success);
  }

  &__merge-error,
  &__comment-error {
    font-size: 0.8125rem;
    color: var(--wd-danger);
  }

  &__branches {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wd-space-3);
    padding: var(--wd-space-4);
    background: var(--wd-card);
    border-radius: var(--wd-radius-lg);
    box-shadow: var(--wd-shadow-sm);
  }

  &__author {
    display: inline-flex;
    align-items: center;
    gap: var(--wd-space-2);
    margin-left: auto;
    font-size: 0.8125rem;
    color: var(--wd-ink-2);
  }

  &__card {
    background: var(--wd-card);
    border-radius: var(--wd-radius-lg);
    box-shadow: var(--wd-shadow-sm);
  }

  &__body {
    padding: var(--wd-space-6);
    font-size: 0.875rem;
    line-height: 1.7;
    color: var(--wd-ink);
    overflow-wrap: break-word;
  }

  &__comments {
    display: flex;
    flex-direction: column;
    gap: var(--wd-space-4);
  }

  &__section-title {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--wd-ink);
  }

  &__comment-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--wd-space-3);
  }

  &__comments-empty {
    padding: var(--wd-space-4);
  }

  &__add-comment {
    display: flex;
    flex-direction: column;
    gap: var(--wd-space-3);
    padding: var(--wd-space-4);
    background: var(--wd-card);
    border-radius: var(--wd-radius-lg);
    box-shadow: var(--wd-shadow-sm);
  }

  &__textarea {
    width: 100%;
    box-sizing: border-box;
    padding: var(--wd-space-3) var(--wd-space-4);
    border: none;
    border-radius: var(--wd-radius-md);
    background: var(--wd-field);
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--wd-ink);
    resize: vertical;
    outline: none;

    &:focus {
      background: var(--wd-tint-2);
    }

    &::placeholder {
      color: var(--wd-ink-2);
    }
  }

  &__add-actions {
    display: flex;
    justify-content: flex-end;
  }
}

// 分支胶囊
.branch-chip {
  padding: 0.25rem 0.875rem;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-field);
  color: var(--wd-ink-2);
  font-family: var(--wd-font-mono);
  font-size: 0.75rem;
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--base {
    background: var(--wd-tint-2);
    color: var(--wd-red);
  }
}

.branch-arrow {
  flex-shrink: 0;
  width: 0.875rem;
  height: 0.875rem;
  color: var(--wd-ink-2);
}

// 单条评论
.comment {
  display: flex;
  gap: var(--wd-space-3);
  padding: var(--wd-space-4);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__head {
    display: flex;
    align-items: baseline;
    gap: var(--wd-space-3);
    margin-bottom: var(--wd-space-2);
  }

  &__author {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--wd-ink);
  }

  &__time {
    font-size: 0.75rem;
    color: var(--wd-ink-2);
  }

  &__body {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--wd-ink);
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }
}

// Markdown 内容样式
:deep(.pd__body) {
  h1,
  h2,
  h3,
  h4 {
    margin: var(--wd-space-6) 0 var(--wd-space-3);
    font-weight: 600;
    color: var(--wd-ink);
    border-bottom: 1px solid var(--wd-field);
    padding-bottom: var(--wd-space-2);
  }

  h1 {
    font-size: 1.5rem;
  }
  h2 {
    font-size: 1.25rem;
  }
  h3 {
    font-size: 1.1rem;
  }

  p {
    margin: 0 0 var(--wd-space-4);
  }

  a {
    color: var(--wd-red);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  ul,
  ol {
    margin: 0 0 var(--wd-space-4);
    padding-left: var(--wd-space-6);
  }

  li {
    margin-bottom: var(--wd-space-1);
  }

  pre {
    padding: var(--wd-space-4);
    background: var(--wd-field);
    border-radius: var(--wd-radius-md);
    overflow-x: auto;
    margin: 0 0 var(--wd-space-4);
  }

  code.inline-code {
    padding: 0.125rem 0.375rem;
    background: var(--wd-field);
    border-radius: var(--wd-radius-sm);
    font-family: var(--wd-font-mono);
    font-size: 0.8125rem;
    color: var(--wd-red);
  }

  blockquote {
    margin: 0 0 var(--wd-space-4);
    padding: var(--wd-space-3) var(--wd-space-4);
    border-left: 3px solid var(--wd-red);
    background: var(--wd-tint-2);
    border-radius: 0 var(--wd-radius-md) var(--wd-radius-md) 0;
    color: var(--wd-ink-2);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 var(--wd-space-4);
    font-size: 0.8125rem;
  }

  th,
  td {
    padding: var(--wd-space-2) var(--wd-space-3);
    text-align: left;
    border-bottom: 1px solid var(--wd-field);
  }

  th {
    font-weight: 600;
    background: var(--wd-field);
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: var(--wd-radius-md);
  }

  input[type='checkbox'] {
    margin-right: var(--wd-space-2);
  }
}
</style>
