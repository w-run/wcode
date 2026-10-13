<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import PinnedRepoCard from '@/components/dashboard/PinnedRepoCard.vue'
import ActivityTimeline from '@/components/dashboard/ActivityTimeline.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ErrorState from '@/components/feedback/ErrorState.vue'
import Skeleton from '@/components/feedback/Skeleton.vue'
import { formatCount } from '@/utils/format'

const store = useDashboardStore()
const { loading, error, source, isEmpty, pinnedRepos, stats, recentActivity } =
  storeToRefs(store)

/** 时间段问候（给首页一点人味） */
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

/** 私有仓库的真实可用指标（star/PR/issue 恒为 0，故不用） */
const repoCount = computed(() => store.repos.length)

const langCount = computed(
  () => new Set(store.repos.map((r) => r.language).filter(Boolean)).size,
)

/** 最近一次更新时间（相对时间） */
const lastUpdated = computed(() => {
  const times = store.repos
    .map((r) => (r.updated_at ? new Date(r.updated_at).getTime() : 0))
    .filter((t) => t > 0)
  if (!times.length) return '—'
  return formatRelativeTime(new Date(Math.max(...times)).toISOString())
})

onMounted(() => {
  store.fetchDashboard()
})
</script>

<template>
  <main class="dashboard-page">
    <!-- 降级提示：后端不可达时温和提示 -->
    <div v-if="source === 'mock'" class="dashboard-banner">
      <WdIcon name="info-circle" :size="16" />
      <span>当前展示示例数据，请确认 Gitea 后端已启动并登录</span>
    </div>

    <!-- Hero：编辑部式引言 -->
    <header class="dash-hero">
      <div class="dash-hero__main">
        <p class="dash-hero__kicker">Dashboard</p>
        <h1 class="dash-hero__title">{{ greeting }}<span class="dash-hero__dot" aria-hidden="true"></span></h1>
        <p class="dash-hero__lead">wcode，你的代码都在这。仓库与最近动态一览。</p>
        <span class="dash-hero__rule" aria-hidden="true"></span>
      </div>

      <!-- 统计胶囊：次要信息，放角落不抢焦点 -->
      <ul v-if="!loading && !isEmpty" class="stat-pills" aria-label="仓库统计">
        <li class="stat-pill" title="Star 总数">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
          </svg>
          <span>{{ formatCount(stats.stars) }}</span>
        </li>
        <li class="stat-pill" title="Issue 总数">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12.5" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{{ formatCount(stats.issues) }}</span>
        </li>
        <li class="stat-pill" title="PR 总数">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
            <circle cx="18" cy="18" r="2.6" /><circle cx="6" cy="6" r="2.6" />
            <path d="M13 6h3a2 2 0 0 1 2 2v6" /><line x1="6" y1="9" x2="6" y2="20" />
          </svg>
          <span>{{ formatCount(stats.pulls) }}</span>
        </li>
      </ul>
    </header>

    <!-- Loading -->
    <template v-if="loading">
      <div class="dash-repos">
        <Skeleton height="180px" border-radius="24px" />
        <Skeleton height="180px" border-radius="24px" />
        <Skeleton height="180px" border-radius="24px" />
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
      <!-- 01 置顶仓库 -->
      <section class="dash-section">
        <header class="section-head">
          <span class="section-idx" aria-hidden="true">01</span>
          <h2 class="section-title">置顶仓库</h2>
          <router-link class="section-more" to="/repos">全部仓库<span aria-hidden="true">→</span></router-link>
        </header>
        <div class="dash-repos">
          <PinnedRepoCard
            v-for="repo in pinnedRepos"
            :key="repo.id"
            :repo="repo"
          />
        </div>
      </section>

      <!-- 02 最近活动 -->
      <section v-if="recentActivity.length > 0" class="dash-section">
        <header class="section-head">
          <span class="section-idx" aria-hidden="true">02</span>
          <h2 class="section-title">最近活动</h2>
        </header>
        <div class="dash-activity">
          <ActivityTimeline :items="recentActivity" />
        </div>
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

/* ══════ Hero ══════ */
.dash-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--wd-space-6);
  padding: var(--wd-space-4) 0 var(--wd-space-2);
}

.dash-hero__main {
  min-width: 0;
}

/* ── 统计胶囊 ── */
.stat-pills {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  margin: 2px 0 0;
  padding: 0;
  list-style: none;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-field);
  color: var(--wd-ink-3);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  transition: color $wd-dur-slow $wd-ease-smooth;

  &:hover {
    color: var(--wd-ink);
  }
}

/* 窄屏：胶囊移到标题下、允许换行 */
@include media-down($bp-tablet) {
  .dash-hero {
    flex-direction: column;
    gap: var(--wd-space-4);
  }
  .stat-pills {
    margin-top: var(--wd-space-2);
  }
}

.dash-hero__kicker {
  margin: 0 0 var(--wd-space-3);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--wd-ink-3);
}

.dash-hero__title {
  margin: 0 0 var(--wd-space-3);
  font-size: clamp(30px, 4vw, 40px);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: var(--wd-ink);
}

.dash-hero__dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-left: 6px;
  border-radius: 50%;
  background: var(--wd-red);
  vertical-align: baseline;
}

.dash-hero__lead {
  margin: 0 0 var(--wd-space-6);
  font-size: 15px;
  line-height: 1.8;
  color: var(--wd-ink-2);
}

.dash-hero__rule {
  display: block;
  width: 56px;
  height: 4px;
  border-radius: 999px;
  background: var(--wd-red);
}

/* ══════ 分区 ══════ */
.dash-section {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-4);
}

.section-head {
  display: flex;
  align-items: baseline;
  gap: var(--wd-space-3);
}

.section-idx {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  font-variant-numeric: tabular-nums;
  color: var(--wd-red);
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--wd-ink);
}

.section-more {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--wd-ink-3);
  text-decoration: none;
  transition: color $wd-dur-slow $wd-ease-smooth;

  &:hover {
    color: var(--wd-red);

    span {
      transform: translateX(3px);
    }
  }

  span {
    transition: transform $wd-dur-slow $wd-ease-spring-soft;
  }
}

/* 仓库卡网格 */
.dash-repos {
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

/* 活动时间线容器 */
.dash-activity {
  padding: var(--wd-space-6) var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
}
</style>