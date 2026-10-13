<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Issue } from '@/api/types'
import { formatCount } from '@/utils/format'

const props = defineProps<{
  issue: Issue
  /** 所属仓库 owner / name，用于拼接详情链接 */
  owner: string
  repo: string
}>()

const isClosed = computed(() => props.issue.state === 'closed')

/** 相对时间：xx 分钟前 / xx 小时前 / xx 天前 */
function formatRelativeTime(iso?: string): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} 个月前`
  return `${Math.floor(months / 12)} 年前`
}

const updatedText = computed(() => formatRelativeTime(props.issue.updated_at))
</script>

<template>
  <RouterLink
    class="issue-card"
    :to="`/repos/${owner}/${repo}/issues/${issue.number}`"
  >
    <div class="issue-card__main">
      <span
        class="issue-card__state"
        :class="isClosed ? 'is-closed' : 'is-open'"
        :title="isClosed ? '已关闭' : '进行中'"
        aria-hidden="true"
      >
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            v-if="isClosed"
            d="M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 1 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z"
          />
          <path v-else d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
          <path
            fill-rule="evenodd"
            d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z"
            clip-rule="evenodd"
          />
        </svg>
      </span>

      <div class="issue-card__content">
        <div class="issue-card__head">
          <h3 class="issue-card__title">{{ issue.title }}</h3>
          <span
            v-for="label in issue.labels"
            :key="label.id"
            class="issue-card__label"
            :style="{
              background: `#${label.color}22`,
              color: `#${label.color}`,
            }"
          >
            {{ label.name }}
          </span>
        </div>

        <div class="issue-card__meta">
          <span class="issue-card__number">#{{ issue.number }}</span>
          <span v-if="issue.user" class="issue-card__author">
            {{ issue.user.login }}
          </span>
          <span class="issue-card__time">更新于 {{ updatedText }}</span>
          <span v-if="issue.comments > 0" class="issue-card__comments">
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
              class="icon"
            >
              <path
                d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Z"
              />
            </svg>
            {{ formatCount(issue.comments) }}
          </span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style lang="scss" scoped>
.issue-card {
  display: block;
  padding: var(--wd-space-4) var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
  text-decoration: none;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: var(--wd-shadow);
    transform: translateY(-1px);
  }

  &__main {
    display: flex;
    align-items: flex-start;
    gap: var(--wd-space-3);
  }

  &__state {
    flex-shrink: 0;
    display: inline-flex;
    margin-top: 2px;

    svg {
      width: 1.125rem;
      height: 1.125rem;
    }

    &.is-open {
      color: var(--wd-success);
    }

    &.is-closed {
      color: var(--wd-danger);
    }
  }

  &__content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--wd-space-2);
  }

  &__head {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wd-space-2);
  }

  &__title {
    min-width: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--wd-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__label {
    flex-shrink: 0;
    padding: 0.0625rem 0.5rem;
    border-radius: var(--wd-radius-pill);
    font-size: 0.6875rem;
    font-weight: 600;
    line-height: 1.5;
  }

  &__meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--wd-space-3);
    color: var(--wd-ink-2);
    font-size: 0.75rem;
  }

  &__number {
    font-family: var(--wd-font-mono);
    color: var(--wd-ink-2);
  }

  &__comments {
    display: inline-flex;
    align-items: center;
    gap: var(--wd-space-1);

    .icon {
      width: 0.875rem;
      height: 0.875rem;
    }
  }
}
</style>
