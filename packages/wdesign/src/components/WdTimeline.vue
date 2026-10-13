<script setup lang="ts">
/**
 * WdTimeline — 时间线
 * 反向迭代（源：w-run/blog 的 About 经历区块）
 */
defineOptions({ name: 'WdTimeline' })

withDefaults(
  defineProps<{
    items: { period?: string; title: string; desc?: string }[]
    /** 左侧贯穿竖线变体 */
    line?: boolean
  }>(),
  { line: false },
)
</script>

<template>
  <ul class="wd-timeline" :class="{ 'wd-timeline--line': line }">
    <li v-for="(it, i) in items" :key="i" class="wd-timeline__item">
      <span v-if="it.period" class="wd-timeline__period">{{ it.period }}</span>
      <div class="wd-timeline__body">
        <h3 class="wd-timeline__title">{{ it.title }}</h3>
        <p v-if="it.desc" class="wd-timeline__desc">{{ it.desc }}</p>
      </div>
    </li>
  </ul>
</template>
