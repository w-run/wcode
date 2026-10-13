<script setup lang="ts">
/**
 * WdPostItem — 文章条目
 * 反向迭代（源：w-run/blog 的文章列表项）
 * 刻意不含日期字段（便于批量导入、不暴露新旧）
 */
defineOptions({ name: 'WdPostItem' })

withDefaults(
  defineProps<{
    title: string
    summary?: string
    tags?: string[]
    emoji?: string
    href?: string
  }>(),
  { tags: () => [] },
)
</script>

<template>
  <component :is="href ? 'a' : 'div'" :href="href" class="wd-post-item">
    <h3 class="wd-post-item__title">
      <span v-if="emoji" class="wd-post-item__emoji">{{ emoji }}</span>{{ title }}
    </h3>
    <p v-if="summary" class="wd-post-item__summary">{{ summary }}</p>
    <div v-if="tags.length" class="wd-post-item__tags">
      <span v-for="t in tags" :key="t" class="wd-tag wd-tag--sm wd-tag--gray">{{ t }}</span>
    </div>
  </component>
</template>
