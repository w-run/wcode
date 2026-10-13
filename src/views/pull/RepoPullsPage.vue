<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import { usePullsStore, type PullFilter } from '@/stores/pulls'
import PullCard from '@/components/pull/PullCard.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ErrorState from '@/components/feedback/ErrorState.vue'
import Button from '@/components/ui/Button.vue'

const route = useRoute()
const store = usePullsStore()
const {
  filteredPulls,
  listState,
  filter,
  openCount,
  closedCount,
  mergedCount,
  usingMock,
} = storeToRefs(store)

const owner = computed(() => route.params.owner as string)
const name = computed(() => route.params.name as string)

const tabs = computed<PullFilter[]>(() => ['open', 'closed', 'merged'])

function tabLabel(f: PullFilter): string {
  switch (f) {
    case 'open':
      return `打开 ${openCount.value}`
    case 'closed':
      return `已关闭 ${closedCount.value}`
    default:
      return `已合并 ${mergedCount.value}`
  }
}

onMounted(() => {
  if (listState.value === 'idle') {
    store.fetchPulls(owner.value, name.value)
  }
})
</script>

<template>
  <div class="repo-pulls-page">
    <!-- 顶部栏 -->
    <div class="repo-pulls-page__header">
      <div class="repo-pulls-page__heading">
        <h1 class="repo-pulls-page__title">Pull Requests</h1>
        <span v-if="usingMock" class="repo-pulls-page__badge">离线预览</span>
      </div>
      <Button size="sm">新建 PR</Button>
    </div>

    <!-- 状态 Tabs -->
    <nav class="repo-pulls-page__tabs" role="tablist" aria-label="PR 状态">
      <button
        v-for="f in tabs"
        :key="f"
        role="tab"
        class="tab-btn"
        :class="{ 'tab-btn--active': filter === f }"
        :aria-selected="filter === f"
        type="button"
        @click="store.setFilter(f)"
      >
        {{ tabLabel(f) }}
      </button>
    </nav>

    <!-- 加载态 -->
    <div v-if="listState === 'loading'" class="repo-pulls-page__grid">
      <div v-for="i in 3" :key="i" class="repo-pulls-page__skeleton" />
    </div>

    <!-- 错误态 -->
    <template v-else-if="listState === 'error'">
      <ErrorState
        message="无法加载 PR 列表"
        @retry="store.fetchPulls(owner, name)"
      />
    </template>

    <!-- 空态 -->
    <template v-else-if="filteredPulls.length === 0">
      <EmptyState
        :title="`暂无 ${filter === 'open' ? '打开的' : filter === 'closed' ? '已关闭' : '已合并'} PR`"
        description="该仓库目前没有符合条件的 Pull Request"
      />
    </template>

    <!-- PR 网格 -->
    <div v-else class="repo-pulls-page__grid">
      <PullCard
        v-for="pr in filteredPulls"
        :key="pr.id"
        :pr="pr"
        :owner="owner"
        :name="name"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.repo-pulls-page {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-6);
  padding: var(--wd-space-6);
  max-width: 1280px;
  margin: 0 auto;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--wd-space-3);
  }

  &__heading {
    display: flex;
    align-items: center;
    gap: var(--wd-space-3);
  }

  &__title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--wd-ink);
  }

  &__badge {
    padding: 0.25rem 0.75rem;
    border-radius: var(--wd-radius-pill);
    background: var(--wd-warning-soft);
    color: var(--wd-warning);
    font-size: 0.75rem;
    font-weight: 500;
  }

  &__tabs {
    display: flex;
    gap: var(--wd-space-2);
    flex-wrap: wrap;
  }

  &__grid {
    display: grid;
    gap: var(--wd-space-4);
    grid-template-columns: 1fr;

    @media (min-width: $bp-tablet) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: $bp-desktop) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  &__skeleton {
    height: 130px;
    border-radius: var(--wd-radius-lg);
    background: var(--wd-field);
    animation: skeleton-shimmer 1.5s ease-in-out infinite;
  }
}

.tab-btn {
  padding: var(--wd-space-2) var(--wd-space-4);
  border: none;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-card);
  color: var(--wd-ink-2);
  font-family: inherit;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: var(--wd-shadow-sm);
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease;
  min-height: 44px;

  &:hover {
    background: var(--wd-field);
    color: var(--wd-ink);
  }

  &--active {
    background: var(--wd-red);
    color: #fff;
    box-shadow: var(--wd-shadow-accent);

    &:hover {
      background: var(--wd-red-hover);
      color: #fff;
    }
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
