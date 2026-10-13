<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useDashboardStore } from '@/stores/dashboard'
import DashboardRepoCard from '@/components/dashboard/DashboardRepoCard.vue'
import ActivityTimeline from '@/components/dashboard/ActivityTimeline.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ErrorState from '@/components/feedback/ErrorState.vue'
import Skeleton from '@/components/feedback/Skeleton.vue'
import { formatCount, formatRelativeTime } from '@/utils/format'

const store = useDashboardStore()
const { loading, error, source, isEmpty, stats, recentActivity, openIssues, orgs } =
  storeToRefs(store)

/** 时间段问候 */
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

/** 仓库排序（star 仅用于排序，不在界面展示） */
const sortedRepos = computed(() =>
  store.repos.slice().sort((a, b) => b.stars_count - a.stars_count),
)
/** 首行：大卡（4 个） */
const primaryRepos = computed(() => sortedRepos.value.slice(0, 4))
/** 其余：展开行（紧凑卡，无描述） */
const restRepos = computed(() => sortedRepos.value.slice(4))
const expanded = ref(false)

onMounted(() => {
  store.fetchDashboard()
})
</script>

<template>
  <main class="dashboard-page">
    <!-- 降级提示 -->
    <div v-if="source === 'mock'" class="dashboard-banner">
      <WdIcon name="info-circle" :size="16" />
      <span>当前展示示例数据，请确认 Gitea 后端已启动并登录</span>
    </div>

    <!-- Hero -->
    <header class="dash-hero">
      <div class="dash-hero__main">
        <p class="dash-hero__kicker">Dashboard</p>
        <h1 class="dash-hero__title">
          {{ greeting }}<span class="dash-hero__dot" aria-hidden="true"></span>
        </h1>
        <p class="dash-hero__lead">wcode，你的代码都在这。</p>
        <span class="dash-hero__rule" aria-hidden="true"></span>
      </div>

      <!-- 统计胶囊：次要信息，放角落 -->
      <ul v-if="!loading && !isEmpty" class="stat-pills" aria-label="统计">
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
      <div class="repo-grid">
        <Skeleton v-for="i in 4" :key="i" height="128px" border-radius="24px" />
      </div>
      <div class="dash-cols">
        <Skeleton height="240px" border-radius="24px" />
        <Skeleton height="240px" border-radius="24px" />
        <Skeleton height="240px" border-radius="24px" />
      </div>
    </template>

    <!-- Error -->
    <template v-else-if="error && isEmpty">
      <ErrorState :message="error" @retry="store.fetchDashboard()" />
    </template>

    <!-- Empty -->
    <template v-else-if="isEmpty">
      <EmptyState title="暂无仓库" description="登录后即可看到你的仓库与动态" />
    </template>

    <!-- Data -->
    <template v-else>
      <!-- 01 仓库 -->
      <section class="dash-section">
        <header class="section-head">
          <span class="section-idx" aria-hidden="true">01</span>
          <h2 class="section-title">仓库</h2>
          <button
            v-if="restRepos.length"
            class="section-toggle"
            type="button"
            :aria-expanded="expanded"
            @click="expanded = !expanded"
          >
            {{ expanded ? '收起' : `展开全部 ${sortedRepos.length}` }}
            <span class="section-toggle__caret" :class="{ 'is-open': expanded }" aria-hidden="true">
              <WdIcon name="chevron-down" :size="15" />
            </span>
          </button>
          <router-link v-else class="section-more" to="/repos">
            全部仓库<span aria-hidden="true">→</span>
          </router-link>
        </header>

        <!-- 首行：大卡 -->
        <div class="repo-grid">
          <DashboardRepoCard v-for="repo in primaryRepos" :key="repo.id" :repo="repo" />
        </div>

        <!-- 展开行：紧凑卡（无描述，一屏放更多） -->
        <div v-if="expanded && restRepos.length" class="repo-grid repo-grid--compact">
          <DashboardRepoCard v-for="repo in restRepos" :key="repo.id" :repo="repo" compact />
        </div>
      </section>

      <!-- 02/03/04 三栏 -->
      <div class="dash-cols">
        <!-- 最近活动 -->
        <section class="dash-col">
          <header class="section-head section-head--sm">
            <span class="section-idx" aria-hidden="true">02</span>
            <h2 class="section-title">最近活动</h2>
          </header>
          <div class="dash-col__body">
            <ActivityTimeline v-if="recentActivity.length" :items="recentActivity" />
            <p v-else class="col-empty">暂无活动</p>
          </div>
        </section>

        <!-- Issues -->
        <section class="dash-col">
          <header class="section-head section-head--sm">
            <span class="section-idx" aria-hidden="true">03</span>
            <h2 class="section-title">Issues</h2>
          </header>
          <div class="dash-col__body">
            <ul v-if="openIssues.length" class="issue-list">
              <li v-for="it in openIssues" :key="it.id" class="issue-item">
                <span class="issue-item__title">
                  <span class="issue-item__no">#{{ it.number }}</span>
                  {{ it.title }}
                </span>
                <span class="issue-item__meta">
                  <span class="issue-item__repo">{{ it.repo }}</span>
                  <span class="issue-item__time">{{ formatRelativeTime(it.updatedAt) }}</span>
                </span>
              </li>
            </ul>
            <p v-else class="col-empty">暂无未关闭的 Issue</p>
          </div>
        </section>

        <!-- 我的组织 -->
        <section class="dash-col">
          <header class="section-head section-head--sm">
            <span class="section-idx" aria-hidden="true">04</span>
            <h2 class="section-title">我的组织</h2>
          </header>
          <div class="dash-col__body">
            <ul v-if="orgs.length" class="org-list">
              <li v-for="org in orgs" :key="org.id" class="org-item">
                <span class="org-item__avatar" aria-hidden="true">
                  <img v-if="org.avatar_url" :src="org.avatar_url" :alt="org.name" />
                  <span v-else>{{ org.name.charAt(0).toUpperCase() }}</span>
                </span>
                <span class="org-item__body">
                  <span class="org-item__name">{{ org.full_name || org.name }}</span>
                  <span v-if="org.description" class="org-item__desc">{{ org.description }}</span>
                </span>
              </li>
            </ul>
            <p v-else class="col-empty">暂无组织</p>
          </div>
        </section>
      </div>
    </template>
  </main>
</template>

<style lang="scss" scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-8);
  padding: var(--wd-space-6);
  max-width: 1320px;
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
}
.dash-hero__lead {
  margin: 0 0 var(--wd-space-5);
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
}

/* ══════ 区块 ══════ */
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
.section-head--sm {
  margin-bottom: var(--wd-space-3);
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
.section-head--sm .section-title {
  font-size: 15px;
}

/* 展开/收起 */
.section-toggle {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: none;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-field);
  color: var(--wd-ink-2);
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition:
    color $wd-dur-slow $wd-ease-smooth,
    background $wd-dur-slow $wd-ease-smooth;

  &:hover {
    color: var(--wd-red);
  }
}
.section-toggle__caret {
  display: grid;
  place-items: center;
  transition: transform $wd-dur-slow $wd-ease-spring-soft;

  &.is-open {
    transform: rotate(180deg);
  }
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
  }
}

/* ══════ 仓库网格：一行 4 个 ══════ */
.repo-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--wd-space-4);

  @media (max-width: 1280px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
}

.repo-grid--compact {
  gap: var(--wd-space-3);
  margin-top: var(--wd-space-3);
}

/* ══════ 三栏 ══════ */
.dash-cols {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--wd-space-4);

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.dash-col {
  display: flex;
  flex-direction: column;
  padding: var(--wd-space-5, 20px);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
  min-width: 0;
}

.dash-col__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  max-height: 320px;
}

.col-empty {
  margin: 0;
  padding: var(--wd-space-4) 0;
  font-size: 13px;
  color: var(--wd-ink-3);
}

/* ── Issues ── */
.issue-list,
.org-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.issue-item {
  padding: 9px 0;
  border-bottom: 1px solid var(--wd-ink-5);

  &:last-child {
    border-bottom: none;
  }
}

.issue-item__title {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--wd-ink);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.issue-item__no {
  color: var(--wd-red);
  font-weight: 700;
}

.issue-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-space-2);
  margin-top: 3px;
  font-size: 11.5px;
  color: var(--wd-ink-3);
}

.issue-item__repo {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

/* ── 组织 ── */
.org-item {
  display: flex;
  align-items: center;
  gap: var(--wd-space-3);
  padding: 9px 0;
}

.org-item__avatar {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  overflow: hidden;
  background: var(--wd-tint-2);
  color: var(--wd-red);
  font-size: 14px;
  font-weight: 800;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.org-item__body {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.org-item__name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--wd-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-item__desc {
  font-size: 11.5px;
  color: var(--wd-ink-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── 窄屏 ── */
@include media-down($bp-tablet) {
  .dash-hero {
    flex-direction: column;
    gap: var(--wd-space-4);
  }
  .stat-pills {
    margin-top: var(--wd-space-2);
  }
}
</style>
