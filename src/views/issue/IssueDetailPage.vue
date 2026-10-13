<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useIssuesStore } from '@/stores/issues'
import { formatRelativeTime } from '@/utils/format'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'

const props = defineProps<{
  owner: string
  name: string
  number: string
}>()

const num = Number(props.number)
const store = useIssuesStore()
const comment = ref('')
const submitting = ref(false)

onMounted(() => {
  store.fetchIssueDetail(props.owner, props.name, num)
  store.fetchComments(props.owner, props.name, num)
})

async function submit() {
  if (!comment.value.trim()) return
  submitting.value = true
  await store.addComment(props.owner, props.name, num, comment.value)
  comment.value = ''
  submitting.value = false
}
</script>

<template>
  <div class="issue">
    <template v-if="store.detailState === 'loading'">
      <div class="issue__skeleton">
        <span v-for="i in 8" :key="i" class="issue__line" />
      </div>
    </template>

    <template v-else-if="store.detailError">
      <div class="issue__error">
        <p>{{ store.detailError }}</p>
        <button
          type="button"
          class="issue__retry"
          @click="store.fetchIssueDetail(owner, name, num)"
        >
          重试
        </button>
      </div>
    </template>

    <template v-else-if="store.currentIssue">
      <div class="issue__head">
        <Badge
          :label="store.currentIssue.state === 'open' ? 'Open' : 'Closed'"
          :variant="store.currentIssue.state === 'open' ? 'success' : 'danger'"
        />
        <h1 class="issue__title">{{ store.currentIssue.title }}</h1>
      </div>

      <div class="issue__meta">
        <Avatar :name="store.currentIssue.user?.login ?? ''" size="sm" />
        <span class="issue__author">{{ store.currentIssue.user?.login }}</span>
        于
        <span>{{ formatRelativeTime(store.currentIssue.created_at) }}</span>
        开启
        <span v-if="store.currentIssue.labels?.length" class="issue__labels">
          <Badge
            v-for="label in store.currentIssue.labels"
            :key="label.name"
            :label="label.name"
            variant="default"
          />
        </span>
      </div>

      <div class="issue__body">
        {{ store.currentIssue.body || '（无正文）' }}
      </div>

      <div class="issue__comments">
        <h2 class="issue__sub">评论 {{ store.comments.length }}</h2>

        <div v-if="store.commentsState === 'loading'" class="issue__skeleton">
          <span v-for="i in 3" :key="i" class="issue__comment-skel" />
        </div>

        <ul class="comment-list">
          <li v-for="c in store.comments" :key="c.id" class="comment">
            <Avatar :name="c.user?.login ?? ''" size="sm" />
            <div class="comment__body">
              <div class="comment__meta">
                <span class="comment__author">{{ c.user?.login }}</span>
                <span>{{ formatRelativeTime(c.created_at) }}</span>
              </div>
              <p class="comment__text">{{ c.body }}</p>
            </div>
          </li>
        </ul>

        <form class="issue__reply" @submit.prevent="submit">
          <textarea
            v-model="comment"
            class="issue__textarea"
            placeholder="发表评论..."
            rows="3"
          />
          <button
            type="submit"
            class="issue__submit"
            :disabled="submitting || !comment.trim()"
          >
            {{ submitting ? '提交中...' : '评论' }}
          </button>
        </form>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.issue {
  max-width: 720px;
  margin: 0 auto;
}

.issue__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-3);
  padding: var(--wd-space-4);
}

.issue__line {
  height: 16px;
  border-radius: var(--wd-radius-sm);
  background: var(--wd-field);
  animation: issue-shimmer 1.5s ease-in-out infinite;

  &:nth-child(odd) {
    width: 70%;
  }
  &:nth-child(even) {
    width: 45%;
  }
}

.issue__error {
  padding: var(--wd-space-8);
  color: var(--wd-danger);
  text-align: center;
}

.issue__retry {
  margin-top: var(--wd-space-3);
  padding: var(--wd-space-2) var(--wd-space-4);
  border-radius: var(--wd-radius-pill);
  background: var(--wd-red);
  color: #fff;
}

.issue__head {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-3);
  margin-bottom: var(--wd-space-4);
}

.issue__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--wd-ink);
  line-height: 1.3;
}

.issue__meta {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  margin-bottom: var(--wd-space-4);
  font-size: 13px;
  color: var(--wd-ink-2);
}

.issue__author {
  font-weight: 500;
}

.issue__labels {
  display: flex;
  gap: var(--wd-space-1);
}

.issue__body {
  padding: var(--wd-space-4);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  color: var(--wd-ink);
  line-height: 1.7;
  white-space: pre-wrap;
  box-shadow: var(--wd-shadow-sm);
}

.issue__comments {
  margin-top: var(--wd-space-6);
}

.issue__sub {
  font-size: 1rem;
  font-weight: 600;
  color: var(--wd-ink);
  margin-bottom: var(--wd-space-4);
}

.issue__comment-skel {
  display: block;
  height: 60px;
  margin-bottom: var(--wd-space-3);
  border-radius: var(--wd-radius-md);
  background: var(--wd-field);
  animation: issue-shimmer 1.5s ease-in-out infinite;
}

.comment-list {
  padding: 0;
  margin: 0 0 var(--wd-space-4);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-4);
}

.comment {
  display: flex;
  gap: var(--wd-space-3);
  align-items: flex-start;
}

.comment__body {
  flex: 1;
  padding: var(--wd-space-3);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
}

.comment__meta {
  display: flex;
  gap: var(--wd-space-2);
  margin-bottom: var(--wd-space-2);
  font-size: 12.5px;
  color: var(--wd-ink-2);
}

.comment__author {
  font-weight: 500;
}

.comment__text {
  color: var(--wd-ink);
  line-height: 1.6;
  white-space: pre-wrap;
}

.issue__reply {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-2);
}

.issue__textarea {
  padding: var(--wd-space-3);
  border: none;
  border-radius: var(--wd-radius-md);
  background: var(--wd-card);
  color: var(--wd-ink);
  font: inherit;
  resize: vertical;
  box-shadow: var(--wd-shadow-sm);

  &::placeholder {
    color: var(--wd-ink-2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--wd-tint-2);
  }
}

.issue__submit {
  align-self: flex-end;
  padding: var(--wd-space-2) var(--wd-space-4);
  border: none;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-red);
  color: #fff;
  font-size: 13px;
  cursor: pointer;
  transition: background var(--wd-dur-fast) var(--wd-ease);

  &:hover:not(:disabled) {
    background: var(--wd-red-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@keyframes issue-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
