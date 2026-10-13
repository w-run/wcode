<script setup lang="ts">
import type { Repository } from '@/api/types'
import { renderMarkdown } from '@/utils/markdown'
import { formatCount } from '@/utils/format'

defineProps<{
  repo: Repository
  markdown: string
  hasReadme: boolean
}>()
</script>

<template>
  <div class="minimal">
    <section class="minimal__hero">
      <p class="minimal__owner">{{ repo.owner.login }} /</p>
      <h1 class="minimal__name">{{ repo.name }}</h1>
      <p v-if="repo.description" class="minimal__desc">
        {{ repo.description }}
      </p>
      <div class="minimal__stats">
        <span>{{ formatCount(repo.stars_count) }} stars</span>
        <span class="minimal__dot" />
        <span>{{ formatCount(repo.forks_count) }} forks</span>
      </div>
    </section>

    <section class="minimal__body">
      <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown 已转义 -->
      <div
        v-if="hasReadme"
        class="wd-markdown"
        v-html="renderMarkdown(markdown)"
      />

      <div v-else class="minimal__empty">
        <p class="minimal__empty-title">该仓库还没有 README</p>
        <a
          :href="repo.html_url ?? `/repos/${repo.owner.login}/${repo.name}`"
          target="_blank"
          rel="noopener noreferrer"
          class="minimal__empty-link"
        >
          前往仓库创建 →
        </a>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.minimal {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--wd-space-16) var(--wd-space-6) var(--wd-space-16);
}

.minimal__hero {
  text-align: center;
  margin-bottom: var(--wd-space-16);
}

.minimal__owner {
  font-size: 14px;
  letter-spacing: 0.05em;
  color: var(--wd-ink-2);
  text-transform: uppercase;
  margin-bottom: var(--wd-space-2);
}

.minimal__name {
  font-size: 3rem;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--wd-ink);
  line-height: 1.1;
}

.minimal__desc {
  margin: var(--wd-space-4) auto 0;
  max-width: 480px;
  font-size: 16px;
  color: var(--wd-ink-2);
  line-height: 1.7;
}

.minimal__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--wd-space-3);
  margin-top: var(--wd-space-6);
  font-size: 13px;
  color: var(--wd-ink-2);
}

.minimal__dot {
  width: 3px;
  height: 3px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-ink-2);
  opacity: 0.5;
}

.minimal__body {
  // 极简留白：正文不加背景卡片
  .markdown {
    :deep(h2) {
      text-align: center;
      font-weight: 500;
    }
  }
}

.minimal__empty {
  text-align: center;
  padding: var(--wd-space-12) 0;
}

.minimal__empty-title {
  font-size: 15px;
  color: var(--wd-ink-2);
  margin-bottom: var(--wd-space-3);
}

.minimal__empty-link {
  font-size: 14px;
  color: var(--wd-red);
  text-decoration: none;

  &:hover {
    color: var(--wd-red-hover);
  }
}
</style>
