<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Repository } from '@/api/types'
import { getLangColor } from '@/utils/langColors'
import { formatCount } from '@/utils/format'

const props = defineProps<{
  repo: Repository
}>()

const router = useRouter()

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

/** 点击进入仓库详情（owner/name 取自 full_name，兼容字段缺失） */
function navigate() {
  const [owner, repoName] = props.repo.full_name.split('/')
  router.push(`/repos/${owner}/${repoName}`)
}
</script>

<template>
  <article
    class="repo-card"
    role="link"
    tabindex="0"
    @click="navigate"
    @keydown.enter="navigate"
  >
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

    <p class="repo-card__desc">{{ repo.description }}</p>

    <div class="repo-card__meta">
      <span v-if="langColor" class="repo-card__lang">{{ repo.language }}</span>
      <span class="repo-card__time">更新于 {{ updatedText }}</span>
    </div>

  </article>
</template>

<style lang="scss" scoped>
.repo-card {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-3);
  height: 100%;
  padding: var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: var(--wd-shadow-pop);
    transform: translateY(-2px);
  }

  &__head {
    display: flex;
    align-items: center;
    gap: var(--wd-space-2);
    min-width: 0;
  }

  &__dot {
    flex-shrink: 0;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: var(--wd-radius-pill);
  }

  &__name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1rem;
    font-weight: 600;
    color: var(--wd-ink);
  }

  &__badge {
    flex-shrink: 0;
    padding: 0.125rem 0.5rem;
    border-radius: var(--wd-radius-pill);
    background: var(--wd-field);
    color: var(--wd-ink-2);
    font-size: 0.6875rem;
    font-weight: 500;
  }

  /* 描述固定预留 2 行：行数不等时卡片高度仍一致，元信息位置对齐 */
  &__desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
    min-height: calc(1.5em * 2);
    color: var(--wd-ink-2);
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  &__meta {
    /* 贴底：不同描述行数下，底部信息始终对齐 */
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--wd-space-2);
    padding-top: var(--wd-space-1);
    color: var(--wd-ink-2);
    font-size: 0.75rem;
  }

  &__lang {
    font-weight: 500;
  }

  &__time {
    white-space: nowrap;
  }

}
</style>
