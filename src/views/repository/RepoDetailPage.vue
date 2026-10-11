<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useReposStore } from '@/stores/repos'
import { formatCount } from '@/utils/format'
import { getLangColor } from '@/utils/langColors'

const route = useRoute()
const store = useReposStore()

const owner = computed(() => route.params.owner as string)
const name = computed(() => route.params.name as string)
const langColor = computed(() => getLangColor(store.currentRepo?.language))

const readmeLoaded = computed(
  () => store.readmeState === 'success' && store.readmeHtml,
)

onMounted(async () => {
  await Promise.all([
    store.fetchRepoDetail(owner.value, name.value),
    store.fetchReadme(owner.value, name.value),
    store.fetchBranches(owner.value, name.value),
  ])
})
</script>

<template>
  <div class="repo-detail-page">
    <!-- 加载态 -->
    <div
      v-if="store.detailState === 'loading'"
      class="repo-detail-page__loading"
    >
      <div
        class="repo-detail-page__skeleton repo-detail-page__skeleton--title"
      />
      <div
        class="repo-detail-page__skeleton repo-detail-page__skeleton--readme"
      />
    </div>

    <!-- 错误态 -->
    <div
      v-else-if="store.detailState === 'error'"
      class="repo-detail-page__error"
    >
      <p>{{ store.detailError }}</p>
    </div>

    <!-- 内容 -->
    <template v-else-if="store.currentRepo">
      <!-- 标题栏 -->
      <div class="repo-detail-page__titlebar">
        <h1 class="repo-detail-page__name">
          {{ store.currentRepo.full_name }}
        </h1>
        <div class="repo-detail-page__actions">
          <router-link
            v-if="store.currentRepo.default_branch"
            :to="`/repos/${owner}/${name}/browse/${store.currentRepo.default_branch}`"
            class="code-btn"
          >
            浏览代码
          </router-link>
          <span v-if="store.currentRepo.private" class="tag tag--muted"
            >私有</span
          >
          <span v-if="store.currentRepo.archived" class="tag tag--muted"
            >已归档</span
          >
          <span v-if="store.currentRepo.mirror" class="tag tag--info"
            >镜像</span
          >
        </div>
      </div>

      <div class="repo-detail-page__body">
        <!-- README 主区 -->
        <section class="repo-detail-page__readme">
          <!-- README 加载中 -->
          <div
            v-if="store.readmeState === 'loading'"
            class="repo-detail-page__skeleton repo-detail-page__skeleton--readme"
          />

          <!-- README 渲染 -->
          <div
            v-else-if="readmeLoaded"
            class="readme-body"
            v-html="store.readmeHtml"
          />

          <!-- README 加载失败（已降级到 mock） -->
          <div v-else class="repo-detail-page__readme-fallback">
            <p>README 暂不可用</p>
          </div>
        </section>

        <!-- 信息侧栏 -->
        <aside class="repo-detail-page__sidebar">
          <!-- 基础统计 -->
          <div class="sidebar-card">
            <div class="stat-row">
              <span
                v-if="langColor"
                class="stat-dot"
                :style="{ background: langColor }"
              />
              <span class="stat-label">{{
                store.currentRepo.language ?? '—'
              }}</span>
            </div>
            <div class="stat-row">
              <svg class="icon" viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"
                />
              </svg>
              <span class="stat-label">Stars</span>
              <span class="stat-value">{{
                formatCount(store.currentRepo.stars_count)
              }}</span>
            </div>
            <div class="stat-row">
              <svg class="icon" viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a.25.25 0 0 1 .43-.147l2.223 2.535a.25.25 0 0 1 0 .342l-2.223 2.535a.25.25 0 0 1-.43-.147v-.878a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0-.75.75v.878a.25.25 0 0 1-.43.147L2.347 8.028a.25.25 0 0 1 0-.342l2.223-2.535a.25.25 0 0 1 .43.147Z"
                />
              </svg>
              <span class="stat-label">Forks</span>
              <span class="stat-value">{{
                formatCount(store.currentRepo.forks_count)
              }}</span>
            </div>
          </div>

          <!-- 分支选择器 -->
          <div class="sidebar-card">
            <h3 class="sidebar-card__title">分支</h3>
            <div v-if="store.branchState === 'loading'" class="skeleton-line" />
            <select
              v-else
              class="branch-select"
              :value="store.currentRepo.default_branch"
              aria-label="选择分支"
            >
              <option
                v-for="branch in store.branches"
                :key="branch.name"
                :value="branch.name"
              >
                {{ branch.name }}{{ branch.protected ? '（已保护）' : '' }}
              </option>
            </select>
          </div>

          <!-- 主题标签 -->
          <div v-if="store.currentRepo.topics?.length" class="sidebar-card">
            <h3 class="sidebar-card__title">主题</h3>
            <div class="topic-list">
              <span
                v-for="topic in store.currentRepo.topics"
                :key="topic"
                class="topic-tag"
              >
                {{ topic }}
              </span>
            </div>
          </div>

          <!-- 元信息 -->
          <div class="sidebar-card">
            <h3 class="sidebar-card__title">详情</h3>
            <dl class="meta-list">
              <div class="meta-row">
                <dt>默认分支</dt>
                <dd>{{ store.currentRepo.default_branch }}</dd>
              </div>
              <div v-if="store.currentRepo.created_at" class="meta-row">
                <dt>创建于</dt>
                <dd>
                  {{
                    new Date(store.currentRepo.created_at).toLocaleDateString(
                      'zh-CN',
                    )
                  }}
                </dd>
              </div>
              <div v-if="store.currentRepo.updated_at" class="meta-row">
                <dt>更新于</dt>
                <dd>
                  {{
                    new Date(store.currentRepo.updated_at).toLocaleDateString(
                      'zh-CN',
                    )
                  }}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.repo-detail-page {
  display: flex;
  flex-direction: column;
  gap: $space-6;
  padding: $space-6;
  max-width: 1280px;
  margin: 0 auto;

  &__titlebar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: $space-3;
  }

  &__name {
    font-size: 1.25rem;
    font-weight: 700;
    color: $color-text;
    word-break: break-all;
  }

  &__actions {
    display: flex;
    gap: $space-2;
    flex-wrap: wrap;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $space-6;

    @media (min-width: $bp-desktop) {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  &__readme {
    flex: 1;
    min-width: 0;
  }

  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: $space-4;
    width: 100%;

    @media (min-width: $bp-desktop) {
      width: 280px;
      flex-shrink: 0;
      position: sticky;
      top: $space-6;
    }
  }

  &__loading,
  &__error {
    padding: $space-8;
    text-align: center;
    color: $color-text-muted;
  }

  &__readme-fallback {
    padding: $space-8;
    text-align: center;
    color: $color-text-muted;
    background: $color-surface;
    border-radius: $radius-lg;
  }

  &__skeleton {
    background: $color-surface-2;
    border-radius: $radius-md;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;

    &--title {
      height: 2rem;
      width: 60%;
      margin-bottom: $space-4;
    }

    &--readme {
      height: 400px;
      border-radius: $radius-lg;
    }
  }
}

// ---- README 内容样式 ----
.readme-body {
  padding: $space-6;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
  font-size: 0.875rem;
  line-height: 1.7;
  color: $color-text;
  overflow-wrap: break-word;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: $space-6 0 $space-3;
    font-weight: 600;
    color: $color-text;
    border-bottom: 1px solid $color-surface-2;
    padding-bottom: $space-2;
  }

  :deep(h1) {
    font-size: 1.5rem;
  }
  :deep(h2) {
    font-size: 1.25rem;
  }
  :deep(h3) {
    font-size: 1.1rem;
  }

  :deep(p) {
    margin: 0 0 $space-4;
  }

  :deep(a) {
    color: $color-accent;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 $space-4;
    padding-left: $space-6;
  }

  :deep(li) {
    margin-bottom: $space-1;
  }

  :deep(pre) {
    padding: $space-4;
    background: $color-surface-2;
    border-radius: $radius-md;
    overflow-x: auto;
    margin: 0 0 $space-4;
  }

  :deep(code.inline-code) {
    padding: 0.125rem 0.375rem;
    background: $color-surface-2;
    border-radius: $radius-sm;
    font-family: $font-mono;
    font-size: 0.8125rem;
    color: $color-accent;
  }

  :deep(blockquote) {
    margin: 0 0 $space-4;
    padding: $space-3 $space-4;
    border-left: 3px solid $color-accent;
    background: $color-accent-light;
    border-radius: 0 $radius-md $radius-md 0;
    color: $color-text-muted;
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 $space-4;
    font-size: 0.8125rem;
  }

  :deep(th),
  :deep(td) {
    padding: $space-2 $space-3;
    text-align: left;
    border-bottom: 1px solid $color-surface-2;
  }

  :deep(th) {
    font-weight: 600;
    background: $color-surface-2;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: $radius-md;
  }
}

// ---- 侧栏卡片 ----
.sidebar-card {
  padding: $space-4;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  &__title {
    margin: 0 0 $space-3;
    font-size: 0.75rem;
    font-weight: 600;
    color: $color-text-muted;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

// ---- 统计行 ----
.stat-row {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-2 0;
  font-size: 0.875rem;

  &:not(:last-child) {
    border-bottom: 1px solid $color-surface-2;
  }

  .icon {
    width: 0.875rem;
    height: 0.875rem;
    color: $color-text-muted;
  }
}

.stat-dot {
  width: 0.625rem;
  height: 0.625rem;
  border-radius: $radius-full;
  flex-shrink: 0;
}

.stat-label {
  flex: 1;
  color: $color-text-muted;
}

.stat-value {
  font-weight: 600;
  color: $color-text;
}

// ---- 分支选择器 ----
.branch-select {
  width: 100%;
  padding: $space-2 $space-3;
  border: none;
  border-radius: $radius-md;
  background: $color-surface-2;
  font-family: inherit;
  font-size: 0.875rem;
  color: $color-text;
  cursor: pointer;
  outline: none;

  &:focus {
    box-shadow: 0 0 0 2px $color-accent;
  }
}

// ---- 主题标签 ----
.topic-list {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.topic-tag {
  padding: 0.25rem 0.625rem;
  border-radius: $radius-full;
  background: $color-accent-light;
  color: $color-accent;
  font-size: 0.75rem;
  font-weight: 500;
}

// ---- 标签 ----
.code-btn {
  padding: 0.3rem 0.9rem;
  border-radius: $radius-full;
  background: $color-accent;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 500;
  text-decoration: none;
  transition: background $transition-fast;

  &:hover {
    background: $color-accent-hover;
  }
}

.tag {
  padding: 0.25rem 0.625rem;
  border-radius: $radius-full;
  font-size: 0.75rem;
  font-weight: 500;

  &--muted {
    background: $color-surface-2;
    color: $color-text-muted;
  }

  &--info {
    background: $color-accent-light;
    color: $color-accent;
  }
}

// ---- 元信息 ----
.meta-list {
  margin: 0;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: $space-2;
  padding: $space-2 0;
  font-size: 0.8125rem;
  border-bottom: 1px solid $color-surface-2;

  &:last-child {
    border-bottom: none;
  }

  dt {
    color: $color-text-muted;
  }

  dd {
    margin: 0;
    font-weight: 500;
    color: $color-text;
    text-align: right;
    word-break: break-all;
  }
}

// ---- 骨架屏辅助 ----
.skeleton-line {
  height: 1rem;
  background: $color-surface-2;
  border-radius: $radius-sm;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}
</style>
