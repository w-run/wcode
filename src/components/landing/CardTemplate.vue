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
  padding: $space-16 $space-6 $space-16;
}

.cards__hero {
  text-align: center;
  margin-bottom: $space-12;
}

.cards__owner {
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-text-muted;
}

.cards__name {
  margin-top: $space-2;
  font-size: 2.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: $color-text;
}

.cards__desc {
  max-width: 520px;
  margin: $space-3 auto 0;
  color: $color-text-muted;
  font-size: 15px;
}

.cards__stats {
  margin-top: $space-6;
  font-size: 13px;
  color: $color-text-muted;

  span + span::before {
    content: '·';
    margin: 0 $space-3;
    opacity: 0.5;
  }
}

.cards__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $space-4;
}

.card {
  padding: $space-6;
  background: $color-surface;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  transition:
    transform $transition-fast,
    box-shadow $transition-fast;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-lg;
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.card__title {
  display: flex;
  align-items: baseline;
  gap: $space-2;
  font-size: 1.05rem;
  font-weight: 600;
  color: $color-text;
  margin-bottom: $space-3;
}

.card__num {
  font-size: 12px;
  font-weight: 600;
  color: $color-accent;
}

.cards__empty {
  text-align: center;
  padding: $space-12 0;
  color: $color-text-muted;
}

.cards__empty-link {
  color: $color-accent;
  text-decoration: none;
}
</style>
