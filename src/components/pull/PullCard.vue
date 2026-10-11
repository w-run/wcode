<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { PullRequest } from '@/api/types'
import { resolvePullStatus, type PullStatus } from '@/stores/pulls'
import Badge from '@/components/ui/Badge.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { formatRelativeTime } from '@/utils/format'

const props = defineProps<{
  pr: PullRequest
  owner: string
  name: string
}>()

const status = computed<PullStatus>(() => resolvePullStatus(props.pr))

/** 状态徽章文案 */
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

/** 状态徽章配色：open=success，merged=accent，closed=danger */
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

const detailTo = computed(() => ({
  name: 'pull-detail',
  params: { owner: props.owner, name: props.name, number: props.pr.number },
}))
</script>

<template>
  <article class="pull-card">
    <RouterLink class="pull-card__main" :to="detailTo">
      <div class="pull-card__head">
        <Badge :variant="statusVariant">{{ statusLabel }}</Badge>
        <h3 class="pull-card__title" :title="pr.title">
          <span class="pull-card__number">#{{ pr.number }}</span>
          {{ pr.title }}
        </h3>
      </div>

      <div class="pull-card__branches">
        <span class="branch-chip">{{ pr.head?.ref ?? '—' }}</span>
        <svg
          class="branch-arrow"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M8.75 1.75v11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-5 5a.75.75 0 0 1-1.06 0l-5-5a.75.75 0 1 1 1.06-1.06l3.72 3.72V1.75a.75.75 0 0 1 1.5 0Z" />
        </svg>
        <span class="branch-chip branch-chip--base">{{
          pr.base?.ref ?? '—'
        }}</span>
      </div>
    </RouterLink>

    <footer class="pull-card__foot">
      <Avatar :src="pr.user?.avatar_url" :name="pr.user?.login" size="sm" />
      <span class="pull-card__author">{{ pr.user?.login ?? 'unknown' }}</span>
      <time class="pull-card__time">{{
        formatRelativeTime(pr.updated_at)
      }}</time>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.pull-card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  height: 100%;
  padding: $space-4;
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

  &__main {
    display: flex;
    flex-direction: column;
    gap: $space-3;
    flex: 1;
    min-width: 0;
    text-decoration: none;
    color: inherit;
  }

  &__head {
    display: flex;
    align-items: flex-start;
    gap: $space-2;
    min-width: 0;
  }

  &__title {
    flex: 1;
    min-width: 0;
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1.4;
    color: $color-text;
  }

  &__number {
    color: $color-text-muted;
    font-weight: 500;
    margin-right: $space-1;
  }

  &__branches {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-2;
    font-size: 0.75rem;
  }

  &__foot {
    display: flex;
    align-items: center;
    gap: $space-2;
    padding-top: $space-2;
    border-top: 1px solid $color-surface-2;
    font-size: 0.75rem;
    color: $color-text-muted;
  }

  &__author {
    font-weight: 500;
    color: $color-text;
  }

  &__time {
    margin-left: auto;
    white-space: nowrap;
  }
}

.branch-chip {
  padding: 0.125rem 0.625rem;
  border-radius: $radius-full;
  background: $color-surface-2;
  color: $color-text-muted;
  font-family: $font-mono;
  font-size: 0.6875rem;
  max-width: 12rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &--base {
    background: $color-accent-light;
    color: $color-accent;
  }
}

.branch-arrow {
  flex-shrink: 0;
  width: 0.75rem;
  height: 0.75rem;
  color: $color-text-muted;
}
</style>