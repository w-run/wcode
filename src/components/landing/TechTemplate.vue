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
        class="markdown"
        v-html="renderMarkdown(markdown)"
      />

      <div v-else class="tech__empty">该仓库还没有 README</div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.tech {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 50% -10%,
      rgba(214, 40, 57, 0.28),
      transparent 55%
    ),
    #0d0f13;
  color: #fff;
}

.tech__hero {
  max-width: 800px;
  margin: 0 auto;
  padding: $space-16 $space-6 $space-12;
  text-align: center;
}

.tech__lang {
  display: inline-block;
  padding: 4px 14px;
  margin-bottom: $space-4;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
}

.tech__name {
  font-size: 3.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.1;
  background: linear-gradient(120deg, #fff 30%, #ff8a95);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.tech__desc {
  max-width: 520px;
  margin: $space-4 auto 0;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.7;
}

.tech__stats {
  display: flex;
  justify-content: center;
  gap: $space-8;
  margin-top: $space-8;
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
    color: rgba(255, 255, 255, 0.4);
  }
}

.tech__body {
  max-width: 760px;
  margin: 0 auto;
  padding: $space-8 $space-6 $space-16;

  :deep(.markdown) {
    color: rgba(255, 255, 255, 0.82);

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: #fff;
    }

    a {
      color: #ff8a95;

      &:hover {
        color: #ffb0b8;
      }
    }

    code {
      background: rgba(255, 255, 255, 0.08);
      color: #ffd7db;
    }

    pre {
      background: rgba(255, 255, 255, 0.05);
    }

    blockquote {
      border-color: $color-accent;
      color: rgba(255, 255, 255, 0.6);
    }

    th,
    td {
      border-color: rgba(255, 255, 255, 0.12);
    }

    th {
      background: rgba(255, 255, 255, 0.06);
    }
  }
}

.tech__empty {
  text-align: center;
  padding: $space-12 0;
  color: rgba(255, 255, 255, 0.5);
}
</style>
