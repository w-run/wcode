<script setup lang="ts">
import { onMounted } from 'vue'
import { useReposStore } from '@/stores/repos'
import RepoCard from '@/components/repository/RepoCard.vue'

const store = useReposStore()

onMounted(() => {
  if (store.listState === 'idle') {
    store.fetchRepos()
  }
})
</script>

<template>
  <div class="repo-list-page">
    <!-- 搜索栏 -->
    <div class="repo-list-page__toolbar">
      <div class="repo-list-page__search">
        <svg
          class="icon-search"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
            clip-rule="evenodd"
          />
        </svg>
        <input
          v-model="store.searchQuery"
          type="search"
          class="repo-list-page__input"
          placeholder="搜索仓库…"
          aria-label="搜索仓库"
        />
      </div>
      <span v-if="store.usingMock" class="repo-list-page__badge">
        离线预览
      </span>
    </div>

    <!-- 加载态：骨架屏 -->
    <div v-if="store.listState === 'loading'" class="repo-list-page__grid">
      <div v-for="i in 6" :key="i" class="repo-list-page__skeleton" />
    </div>

    <!-- 错误态（仅 API 错误，非 mock 降级） -->
    <div v-else-if="store.listState === 'error'" class="repo-list-page__error">
      <p>{{ store.listError }}</p>
      <button class="btn-retry" @click="store.fetchRepos()">重试</button>
    </div>

    <!-- 空态 -->
    <div
      v-else-if="store.filteredRepos.length === 0"
      class="repo-list-page__empty"
    >
      <svg
        class="icon-empty"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>
      <p>没有找到匹配的仓库</p>
    </div>

    <!-- 仓库网格 -->
    <div v-else class="repo-list-page__grid">
      <RepoCard
        v-for="repo in store.filteredRepos"
        :key="repo.id"
        :repo="repo"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.repo-list-page {
  display: flex;
  flex-direction: column;
  gap: $space-6;
  padding: $space-6;
  max-width: 1280px;
  margin: 0 auto;

  &__toolbar {
    display: flex;
    align-items: center;
    gap: $space-3;
  }

  &__search {
    flex: 1;
    display: flex;
    align-items: center;
    gap: $space-3;
    height: 2.75rem;
    padding: 0 $space-4;
    background: $color-surface;
    border-radius: $radius-full;
    box-shadow: $shadow-sm;

    .icon-search {
      flex-shrink: 0;
      width: 1.125rem;
      height: 1.125rem;
      color: $color-text-muted;
    }
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 0.875rem;
    color: $color-text;

    &::placeholder {
      color: $color-text-muted;
    }

    &::-webkit-search-cancel-button {
      display: none;
    }
  }

  &__badge {
    flex-shrink: 0;
    padding: 0.25rem 0.75rem;
    border-radius: $radius-full;
    background: $color-warning-light;
    color: $color-warning;
    font-size: 0.75rem;
    font-weight: 500;
  }

  &__grid {
    display: grid;
    gap: $space-4;
    grid-template-columns: 1fr;

    @media (min-width: $bp-tablet) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: $bp-desktop) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (min-width: $bp-wide) {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  &__skeleton {
    height: 140px;
    border-radius: $radius-lg;
    background: $color-surface-2;
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-4;
    padding: $space-12;
    text-align: center;

    p {
      color: $color-danger;
      font-size: 0.875rem;
    }
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $space-4;
    padding: $space-12;
    color: $color-text-muted;
    text-align: center;

    .icon-empty {
      width: 3rem;
      height: 3rem;
    }

    p {
      font-size: 0.875rem;
    }
  }
}

.btn-retry {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: $radius-full;
  background: $color-surface;
  color: $color-text;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: $shadow-sm;
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: $color-surface-2;
    box-shadow: $shadow-md;
  }
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
