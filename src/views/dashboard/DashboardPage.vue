<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import StatCard from '@/components/dashboard/StatCard.vue'
import PinnedRepoCard from '@/components/dashboard/PinnedRepoCard.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ErrorState from '@/components/feedback/ErrorState.vue'
import Skeleton from '@/components/feedback/Skeleton.vue'
import { formatCount } from '@/utils/format'

const store = useDashboardStore()
const { loading, error, source, isEmpty, pinnedRepos, stats, recentActivity } =
  storeToRefs(store)

/** ISO 时间字符串 → `YYYY-MM-DD` */
function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

onMounted(() => {
  store.fetchDashboard()
})
</script>

<template>
  <main class="dashboard-page">
    <!-- 降级提示：后端不可达时温和提示 -->
    <div v-if="source === 'mock'" class="dashboard-banner">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span>当前展示示例数据，请确认 Gitea 后端已启动并登录</span>
    </div>

    <!-- Loading -->
    <template v-if="loading">
      <div class="dashboard-stats">
        <Skeleton height="96px" border-radius="16px" />
        <Skeleton height="96px" border-radius="16px" />
        <Skeleton height="96px" border-radius="16px" />
      </div>
      <div class="dashboard-grid">
        <Skeleton height="160px" border-radius="16px" />
        <Skeleton height="160px" border-radius="16px" />
        <Skeleton height="160px" border-radius="16px" />
      </div>
    </template>

    <!-- Error -->
    <template v-else-if="error && isEmpty">
      <ErrorState :message="error" @retry="store.fetchDashboard()" />
    </template>

    <!-- Empty -->
    <template v-else-if="isEmpty">
      <EmptyState
        title="暂无仓库"
        description="登录后即可在这里看到你的置顶仓库和统计数据"
      />
    </template>

    <!-- Data -->
    <template v-else>
      <!-- 统计小卡（1x3 BentoGrid） -->
      <div class="dashboard-stats">
        <StatCard
          icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
          label="Star 总数"
          :value="formatCount(stats.stars)"
          variant="accent"
        />
        <StatCard
          icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
          label="Issue 总数"
          :value="formatCount(stats.issues)"
          variant="warning"
        />
        <StatCard
          icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>'
          label="PR 总数"
          :value="formatCount(stats.pulls)"
          variant="success"
        />
      </div>

      <!-- 置顶仓库大卡 -->
      <section class="dashboard-pinned">
        <h2 class="dashboard-section-title">置顶仓库</h2>
        <div class="dashboard-grid">
          <PinnedRepoCard
            v-for="repo in pinnedRepos"
            :key="repo.id"
            :repo="repo"
          />
        </div>
      </section>

      <!-- 最近活动时间线 -->
      <section v-if="recentActivity.length > 0" class="dashboard-activity">
        <h2 class="dashboard-section-title">最近活动</h2>
        <ul class="activity-list">
          <li
            v-for="item in recentActivity"
            :key="item.id"
            class="activity-item"
          >
            <span class="activity-actor">{{ item.actor }}</span>
            <span class="activity-message">{{ item.message }}</span>
            <span class="activity-repo">{{ item.repo }}</span>
            <time class="activity-time">{{ formatDate(item.at) }}</time>
          </li>
        </ul>
      </section>
    </template>
  </main>
</template>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-8);
  padding: var(--wd-space-6);
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-banner {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  padding: var(--wd-space-3) var(--wd-space-4);
  background: var(--wd-warning-soft);
  border-radius: var(--wd-radius-lg);
  font-size: 0.875rem;
  color: var(--wd-warning);
}

.dashboard-stats {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--wd-space-4);

  @media (min-width: $bp-tablet) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--wd-space-4);

  @media (min-width: $bp-tablet) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: $bp-desktop) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.dashboard-pinned {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-4);
}

.dashboard-activity {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-4);
}

.dashboard-section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--wd-ink);
}

.activity-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-2);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  padding: var(--wd-space-3) var(--wd-space-4);
  background: var(--wd-card);
  border-radius: var(--wd-radius-md);
  box-shadow: var(--wd-shadow-sm);
  font-size: 0.875rem;
  flex-wrap: wrap;

  @media (min-width: $bp-tablet) {
    flex-wrap: nowrap;
  }
}

.activity-actor {
  font-weight: 600;
  color: var(--wd-red);
  flex-shrink: 0;
}

.activity-message {
  color: var(--wd-ink-2);
  flex-shrink: 0;
}

.activity-repo {
  color: var(--wd-ink);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.activity-time {
  font-size: 0.75rem;
  color: var(--wd-ink-2);
  flex-shrink: 0;
  margin-left: auto;
}
</style>
