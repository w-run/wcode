<script setup lang="ts">
import type { Repository } from '@/api/types'
import { renderMarkdown } from '@/utils/markdown'
import { formatCount } from '@/utils/format'
import { splitMarkdownSections } from '@/utils/markdownSections'

const props = defineProps<{
  repo: Repository
  markdown: string
  hasReadme: boolean
}>()

const sections = splitMarkdownSections(props.markdown)
</script>

<template>
  <div class="cards">
    <section class="cards__hero">
      <span class="cards__owner">{{ repo.owner.login }}</span>
      <h1 class="cards__name">{{ repo.name }}</h1>
      <p v-if="repo.description" class="cards__desc">{{ repo.description }}</p>
      <div class="cards__stats">
        <span>{{ formatCount(repo.stars_count) }} stars</span>
        <span>{{ formatCount(repo.forks_count) }} forks</span>
      </div>
    </section>

    <section v-if="hasReadme && sections.length" class="cards__grid">
      <article v-for="(s, i) in sections" :key="s.title" class="card">
        <h2 class="card__title">
          <span class="card__num">{{ String(i + 1).padStart(2, '0') }}</span>
          {{ s.title }}
        </h2>
        <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown 已转义 -->
        <div class="wd-markdown" v-html="renderMarkdown(s.body)" />
      </article>
    </section>

    <section v-else-if="hasReadme" class="cards__grid">
      <article class="card card--full">
        <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown 已转义 -->
        <div class="wd-markdown" v-html="renderMarkdown(markdown)" />
      </article>
    </section>

    <section v-else class="cards__empty">
      <p>该仓库还没有 README</p>
      <a
        :href="repo.html_url ?? '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="cards__empty-link"
      >
        前往创建 →
      </a>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.cards {
  max-width: 1024px;
  margin: 0 auto;
  padding: var(--wd-space-16) var(--wd-space-6) var(--wd-space-16);
}

.cards__hero {
  text-align: center;
  margin-bottom: var(--wd-space-12);
}

.cards__owner {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wd-ink-2);
}

.cards__name {
  margin-top: var(--wd-space-2);
  font-size: 2.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--wd-ink);
}

.cards__desc {
  max-width: 520px;
  margin: var(--wd-space-3) auto 0;
  color: var(--wd-ink-2);
  font-size: 15px;
}

.cards__stats {
  margin-top: var(--wd-space-6);
  font-size: 13px;
  color: var(--wd-ink-2);

  span + span::before {
    content: '·';
    margin: 0 var(--wd-space-3);
    opacity: 0.5;
  }
}

.cards__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--wd-space-4);
}

.card {
  padding: var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-xl);
  box-shadow: var(--wd-shadow);
  transition:
    transform var(--wd-dur-fast) var(--wd-ease),
    box-shadow var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--wd-shadow-pop);
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.card__title {
  display: flex;
  align-items: baseline;
  gap: var(--wd-space-2);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--wd-ink);
  margin-bottom: var(--wd-space-3);
}

.card__num {
  font-size: 12px;
  font-weight: 600;
  color: var(--wd-red);
}

.cards__empty {
  text-align: center;
  padding: var(--wd-space-12) 0;
  color: var(--wd-ink-2);
}

.cards__empty-link {
  color: var(--wd-red);
  text-decoration: none;
}
</style>
