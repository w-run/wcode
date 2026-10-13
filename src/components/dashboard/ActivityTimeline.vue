<template>
  <ol class="activity-timeline">
    <li v-for="item in items" :key="item.id" class="activity-item">
      <span class="activity-dot" aria-hidden="true" />
      <div class="activity-body">
        <p class="activity-line">
          <strong class="activity-actor">{{ item.actor }}</strong>
          <span class="activity-message">{{ item.message }}</span>
          <span class="activity-repo">{{ item.repo }}</span>
        </p>
        <time class="activity-time">{{ formatRelativeTime(item.at) }}</time>
      </div>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { formatRelativeTime } from '@/utils/format'

interface ActivityItem {
  id: string
  repo: string
  message: string
  actor: string
  at: string
}

withDefaults(
  defineProps<{
    items?: ActivityItem[]
  }>(),
  { items: () => [] },
)
</script>

<style lang="scss" scoped>
.activity-timeline {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.activity-item {
  position: relative;
  display: flex;
  gap: var(--wd-space-4);
  padding: 0 0 var(--wd-space-6);
}

/* 连接线：竖线贯穿（无边框，用淡色点线） */
.activity-item::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 16px;
  bottom: 0;
  width: 1px;
  background: var(--wd-ink-5);
}
.activity-item:last-child::before {
  display: none;
}

.activity-dot {
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  width: 11px;
  height: 11px;
  margin-top: 3px;
  border-radius: 50%;
  background: var(--wd-red);
  box-shadow: 0 0 0 4px var(--wd-tint-2);
}

.activity-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.activity-line {
  display: flex;
  align-items: baseline;
  gap: var(--wd-space-2);
  margin: 0;
  font-size: 13.5px;
  flex-wrap: wrap;
}

.activity-actor {
  color: var(--wd-red);
  font-weight: 700;
  flex-shrink: 0;
}

.activity-message {
  color: var(--wd-ink-2);
  flex-shrink: 0;
}

.activity-repo {
  color: var(--wd-ink);
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.activity-time {
  font-size: 12px;
  color: var(--wd-ink-3);
  font-variant-numeric: tabular-nums;
}
</style>
