<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({ name: 'WdTable' })

export interface WdTableColumn {
  key: string
  title: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

const props = withDefaults(
  defineProps<{
    columns?: WdTableColumn[]
    rows?: Record<string, unknown>[]
    striped?: boolean
    emptyText?: string
  }>(),
  { columns: () => [], rows: () => [], striped: true, emptyText: '暂无数据' },
)

const sortKey = ref('')
const sortDir = ref<'asc' | 'desc'>('asc')

const sorted = computed(() => {
  if (!sortKey.value) return props.rows
  return [...props.rows].sort((a, b) => {
    const av = String(a[sortKey.value] ?? ''), bv = String(b[sortKey.value] ?? '')
    const cmp = av.localeCompare(bv, 'zh-CN', { numeric: true })
    return sortDir.value === 'asc' ? cmp : -cmp
  })
})

function toggleSort(key: string, col: WdTableColumn) {
  if (!col.sortable) return
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}
</script>

<template>
  <div class="wd-table-wrap">
    <table v-if="props.rows.length" class="wd-table" :class="{ 'wd-table--striped': striped }">
      <thead>
        <tr>
          <th
            v-for="col in props.columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : undefined"
            class="wd-table__th"
            :class="{ 'wd-table__th--sort': col.sortable }"
            :aria-sort="sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'"
            @click="toggleSort(col.key, col)"
          >
            {{ col.title }}
            <span v-if="col.sortable" class="wd-table__sort">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
                :style="{ color: sortKey === col.key ? 'var(--wd-red)' : 'var(--wd-ink-3)' }">
                <path v-if="sortKey !== col.key || sortDir === 'asc'" d="M12 5l7 7H5l7-7z"></path>
                <path v-else d="M12 19l-7-7h14l-7 7z"></path>
              </svg>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, i) in sorted" :key="i">
          <td
            v-for="col in props.columns"
            :key="col.key"
            :style="col.align ? { textAlign: col.align } : undefined"
          >
            <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">{{ row[col.key] }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-else class="wd-table__empty">{{ emptyText }}</div>
  </div>
</template>

<style scoped>
.wd-table__th { cursor: default; }
.wd-table__th--sort { cursor: pointer; user-select: none; }
.wd-table__th--sort:hover { color: var(--wd-red); }
.wd-table__sort { display: inline-flex; margin-left: 5px; vertical-align: middle; }
</style>
