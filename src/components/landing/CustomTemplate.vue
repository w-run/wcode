<script setup lang="ts">
import { computed } from 'vue'
import type { Repository } from '@/api/types'
import { renderMarkdown } from '@/utils/markdown'
import { buildTemplateContext, renderTemplate } from '@/utils/templateEngine'

const props = defineProps<{
  repo: Repository
  markdown: string
  hasReadme: boolean
  /** .tpl 模板原文 */
  tpl: string
}>()

const html = computed(() => {
  const readmeHtml = props.hasReadme ? renderMarkdown(props.markdown) : ''
  const ctx = buildTemplateContext(props.repo, readmeHtml)
  return renderTemplate(props.tpl, ctx)
})
</script>

<template>
  <div class="custom">
    <!-- eslint-disable-next-line vue/no-v-html -- 沙箱模板引擎输出（字段已转义） -->
    <div class="custom__inner markdown" v-html="html" />
  </div>
</template>

<style lang="scss" scoped>
.custom {
  min-height: 100vh;
  background: var(--wd-bg);
}

.custom__inner {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--wd-space-12) var(--wd-space-6) var(--wd-space-16);
}
</style>
