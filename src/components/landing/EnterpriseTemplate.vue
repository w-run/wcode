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

const stats = [
  { label: 'Stars', value: formatCount(props.repo.stars_count) },
  { label: 'Forks', value: formatCount(props.repo.forks_count) },
  {
    label: 'Issues',
    value: formatCount(props.repo.open_issues_count ?? 0),
  },
]

function scrollTo(index: number) {
  document
    .getElementById(`sec-${index}`)
    ?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="ent">
    <header class="ent__bar">
      <div class="ent__brand">
        <span class="ent__logo">{{ repo.name.charAt(0).toUpperCase() }}</span>
        <span class="ent__name">{{ repo.name }}</span>
      </div>

      <nav class="ent__nav" aria-label="章节">
        <button
          v-for="(s, i) in sections"
          :key="s.title"
          type="button"
          class="ent__nav-link"
          @click="scrollTo(i)"
        >
          {{ s.title }}
        </button>
      </nav>

      <a
        :href="repo.html_url ?? '#'"
        target="_blank"
        rel="noopener noreferrer"
        class="ent__cta"
      >
        查看仓库
      </a>
    </header>

    <section class="ent__hero">
      <h1 class="ent__title">{{ repo.name }}</h1>
      <p v-if="repo.description" class="ent__sub">{{ repo.description }}</p>

      <div class="ent__stats">
        <span v-for="s in stats" :key="s.label" class="ent__badge">
          <strong>{{ s.value }}</strong>
          {{ s.label }}
        </span>
        <span v-if="repo.language" class="ent__badge">
          <span class="ent__lang-dot" />{{ repo.language }}
        </span>
      </div>
    </section>

    <div class="ent__layout">
      <aside v-if="hasReadme && sections.length" class="ent__toc">
        <span class="ent__toc-title">目录</span>
        <button
          v-for="(s, i) in sections"
          :key="s.title"
          type="button"
          class="ent__toc-link"
          @click="scrollTo(i)"
        >
          {{ s.title }}
        </button>
      </aside>

      <section class="ent__body">
        <template v-if="hasReadme">
          <section
            v-for="(s, i) in sections"
            :id="`sec-${i}`"
            :key="s.title"
            class="ent__section"
          >
            <h2 class="ent__section-title">{{ s.title }}</h2>
            <!-- eslint-disable-next-line vue/no-v-html -- renderMarkdown 已转义 -->
            <div class="wd-markdown" v-html="renderMarkdown(s.body)" />
          </section>

          <div
            v-if="!sections.length"
            class="markdown ent__full"
            v-html="renderMarkdown(markdown)"
          />
        </template>

        <div v-else class="ent__empty">
          <p>该仓库还没有 README</p>
          <a
            :href="repo.html_url ?? '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="ent__empty-link"
          >
            前往创建 →
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ent {
  min-height: 100vh;
  background: var(--wd-card);
}

.ent__bar {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  display: flex;
  align-items: center;
  gap: var(--wd-space-6);
  padding: var(--wd-space-3) var(--wd-space-8);
  background: var(--wd-card);
  box-shadow: var(--wd-shadow-sm);
}

.ent__brand {
  display: flex;
  align-items: center;
  gap: var(--wd-space-3);
}

.ent__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-red);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}

.ent__name {
  font-weight: 600;
  color: var(--wd-ink);
}

.ent__nav {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  flex: 1;
  overflow-x: auto;
}

.ent__nav-link {
  padding: 6px 12px;
  border: none;
  border-radius: var(--wd-radius-pill);
  background: transparent;
  color: var(--wd-ink-2);
  font-size: 12.5px;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background var(--wd-dur-fast) var(--wd-ease),
    color var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    background: var(--wd-field);
    color: var(--wd-red);
  }
}

.ent__cta {
  padding: 6px 16px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-red);
  color: #fff;
  font-size: 13px;
  text-decoration: none;

  &:hover {
    background: var(--wd-red-hover);
  }
}

.ent__hero {
  max-width: 860px;
  margin: 0 auto;
  padding: var(--wd-space-16) var(--wd-space-6) var(--wd-space-12);
  text-align: center;
}

.ent__title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--wd-ink);
}

.ent__sub {
  max-width: 560px;
  margin: var(--wd-space-3) auto 0;
  color: var(--wd-ink-2);
  font-size: 15px;
}

.ent__stats {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--wd-space-2);
  margin-top: var(--wd-space-6);
}

.ent__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-field);
  color: var(--wd-ink-2);
  font-size: 12.5px;

  strong {
    color: var(--wd-ink);
    font-weight: 600;
  }
}

.ent__lang-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-red);
}

.ent__layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 var(--wd-space-6) var(--wd-space-16);
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: var(--wd-space-8);
  align-items: start;

  @include media-down($bp-desktop) {
    grid-template-columns: 1fr;
  }
}

.ent__toc {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--wd-space-4);
  border-radius: var(--wd-radius-lg);
  background: var(--wd-bg);

  @include media-down($bp-desktop) {
    display: none;
  }
}

.ent__toc-title {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--wd-ink-2);
  margin-bottom: var(--wd-space-2);
}

.ent__toc-link {
  text-align: left;
  padding: 6px 10px;
  border: none;
  border-radius: var(--wd-radius-md);
  background: transparent;
  color: var(--wd-ink-2);
  font-size: 13px;
  cursor: pointer;
  transition:
    background var(--wd-dur-fast) var(--wd-ease),
    color var(--wd-dur-fast) var(--wd-ease);

  &:hover {
    background: var(--wd-field);
    color: var(--wd-red);
  }
}

.ent__section {
  margin-bottom: var(--wd-space-8);

  &:last-child {
    margin-bottom: 0;
  }
}

.ent__section-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--wd-ink);
  margin-bottom: var(--wd-space-3);
  padding-bottom: var(--wd-space-2);
  border-bottom: 2px solid var(--wd-tint-2);
}

.ent__full {
  background: var(--wd-bg);
  padding: 0;
}

.ent__empty {
  text-align: center;
  padding: var(--wd-space-12) 0;
  color: var(--wd-ink-2);
}

.ent__empty-link {
  color: var(--wd-red);
  text-decoration: none;
}
</style>
