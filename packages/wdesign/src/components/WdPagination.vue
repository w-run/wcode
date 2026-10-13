<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdPagination' })

const props = withDefaults(
  defineProps<{
    modelValue?: number
    total?: number
    pageSize?: number
  }>(),
  { modelValue: 1, total: 0, pageSize: 10 },
)

const emit = defineEmits<{ (e: 'update:modelValue', page: number): void }>()

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const range = computed<(number | '...')[]>(() => {
  const n = pageCount.value
  const cur = props.modelValue
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  const left = Math.max(2, cur - 1)
  const right = Math.min(n - 1, cur + 1)
  if (left > 2) pages.push('...')
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < n - 1) pages.push('...')
  pages.push(n)
  return pages
})

function go(p: number) {
  const v = Math.min(Math.max(1, p), pageCount.value)
  if (v !== props.modelValue) emit('update:modelValue', v)
}
</script>

<template>
  <nav class="wd-pagination" aria-label="分页">
    <button type="button" class="wd-pagination__btn" :disabled="modelValue <= 1" aria-label="上一页" @click="go(modelValue - 1)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"></path></svg>
    </button>
    <template v-for="(p, i) in range" :key="i">
      <span v-if="p === '...'" class="wd-pagination__dots">…</span>
      <button
        v-else
        type="button"
        class="wd-pagination__btn"
        :class="{ 'wd-pagination__btn--active': p === modelValue }"
        @click="go(p as number)"
      >
        {{ p }}
      </button>
    </template>
    <button type="button" class="wd-pagination__btn" :disabled="modelValue >= pageCount" aria-label="下一页" @click="go(modelValue + 1)">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>
    </button>
  </nav>
</template>
