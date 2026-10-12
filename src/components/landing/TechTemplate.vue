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
  <div class="tech">
    <section class="tech__hero">
      <span class="tech__lang" v-if="repo.language">{{ repo.language }}</span>
      <h1 class="tech__name">{{ repo.name }}</h1>
      <p v-if="repo.description" class="tech__desc">{{ repo.description }}</p>

      <div class="tech__stats">
        <div class="tech__stat">
          <strong>{{ formatCount(repo.stars_count) }}</strong>
          <span>Stars</span>
        </div>
        <div class="tech__stat">
          <strong>{{ formatCount(repo.forks_count) }}</strong>
          <span>Forks</span>
        </div>
        <div class="tech__stat">
          <strong>{{ repo.owner.login }}</strong>
          <span>Owner</span>
        </div>
      </div>
    </section>

    <section class="tech__body">
      <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown 已转义 -->
      <div
        v-if="hasReadme"
        class="wd-markdown"
        v-html="renderMarkdown(markdown)"
      />

      <div v-else class="tech__empty">该仓库还没有 README</div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.tech {
  min-height: 100vh;
  background: var(--wd-bg);
  color: var(--wd-ink);
}

.tech__hero {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--wd-space-12) var(--wd-space-6) var(--wd-space-8);
  text-align: center;
}

.tech__lang {
  display: inline-block;
  padding: 4px 14px;
  margin-bottom: var(--wd-space-4);
  border-radius: var(--wd-radius-pill);
  background: var(--wd-field);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wd-ink-2);
}

.tech__name {
  font-size: 3.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--wd-ink);
}

.tech__desc {
  max-width: 520px;
  margin: var(--wd-space-4) auto 0;
  font-size: 16px;
  color: var(--wd-ink-2);
  line-height: 1.7;
}

.tech__stats {
  display: flex;
  justify-content: center;
  gap: var(--wd-space-8);
  margin-top: var(--wd-space-8);
}

.tech__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;

  strong {
    font-size: 1.4rem;
    font-weight: 600;
  }

  span {
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--wd-ink-2);
  }
}

.tech__body {
  max-width: 760px;
  margin: 0 auto;
  padding: var(--wd-space-8) var(--wd-space-6) var(--wd-space-12);
}

.tech__empty {
  text-align: center;
  padding: var(--wd-space-12) 0;
  color: var(--wd-ink-2);
}
</style>
