<script setup lang="ts">
import { computed } from 'vue'
import type { Repository } from '@/api/types'
import { getLangColor } from '@/utils/langColors'
import { formatCount } from '@/utils/format'

const props = defineProps<{
  repo: Repository
}>()

const langColor = computed(() => getLangColor(props.repo.language))

const updatedText = computed(() => formatRelativeTime(props.repo.updated_at))

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
</script>

<template>
  <article class="repo-card">
    <div class="repo-card__head">
      <span
        v-if="langColor"
        class="repo-card__dot"
        :style="{ background: langColor }"
      />
      <h3 class="repo-card__name" :title="repo.full_name">
        {{ repo.full_name }}
      </h3>
      <span v-if="repo.private" class="repo-card__badge">私有</span>
    </div>

    <p v-if="repo.description" class="repo-card__desc">
      {{ repo.description }}
    </p>

    <div class="repo-card__meta">
      <span v-if="langColor" class="repo-card__lang">{{ repo.language }}</span>
      <span class="repo-card__time">更新于 {{ updatedText }}</span>
    </div>

    <div class="repo-card__foot">
      <span class="repo-card__stat">
        <svg
          class="icon"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
          />
        </svg>
        {{ formatCount(repo.stars_count) }}
      </span>
      <span class="repo-card__stat">
        <svg
          class="icon"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a.25.25 0 0 1 .43-.147l2.223 2.535a.25.25 0 0 1 0 .342l-2.223 2.535a.25.25 0 0 1-.43-.147v-.878a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75v.878a.25.25 0 0 1-.43.147L2.347 8.028a.25.25 0 0 1 0-.342l2.223-2.535a.25.25 0 0 1 .43.147Z"
          />
        </svg>
        {{ formatCount(repo.forks_count) }}
      </span>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.repo-card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  height: 100%;
  padding: $space-6;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: $shadow-lg;
    transform: translateY(-2px);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: $space-2;
    min-width: 0;
  }

  &__dot {
    flex-shrink: 0;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: $radius-full;
  }

  &__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1rem;
    font-weight: 600;
    color: $color-text;
  }

  &__badge {
    flex-shrink: 0;
    padding: 0.125rem 0.5rem;
    border-radius: $radius-full;
    background: $color-surface-2;
    color: $color-text-muted;
    font-size: 0.6875rem;
    font-weight: 500;
  }

  &__desc {
    flex: 1;
    min-height: 2.5em;
    margin: 0;
    color: $color-text-muted;
    font-size: 0.8125rem;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-2;
    color: $color-text-muted;
    font-size: 0.75rem;
  }

  &__lang {
    font-weight: 500;
  }

  &__time {
    white-space: nowrap;
  }

  &__foot {
    display: flex;
    gap: $space-4;
    padding: $space-2 $space-3;
    border-radius: $radius-full;
    background: $color-surface-2;
    color: $color-text-muted;
    font-size: 0.75rem;
  }

  &__stat {
    display: inline-flex;
    align-items: center;
    gap: $space-1;

    .icon {
      width: 0.875rem;
      height: 0.875rem;
    }
  }
}
</style>
