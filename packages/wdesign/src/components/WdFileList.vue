<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({ name: 'WdFileList' })

export interface WdFileNode {
  name: string
  type?: 'file' | 'folder'
  size?: number
  children?: WdFileNode[]
}

const props = withDefaults(
  defineProps<{
    items?: WdFileNode[]
  }>(),
  { items: () => [] },
)

const emit = defineEmits<{ (e: 'select', item: WdFileNode): void }>()

const openPaths = ref<Set<string>>(new Set())

/** 扁平化：只展开 openPaths 命中的层级（避免递归组件） */
const rows = computed(() => {
  const out: { node: WdFileNode; depth: number; path: string }[] = []
  const walk = (nodes: WdFileNode[], depth: number, base: string) => {
    nodes.forEach((n, i) => {
      const path = `${base}${i}/`
      out.push({ node: n, depth, path })
      if (n.type === 'folder' && openPaths.value.has(path)) {
        walk(n.children || [], depth + 1, path)
      }
    })
  }
  walk(props.items, 0, '')
  return out
})

function onRow(row: { node: WdFileNode; path: string }) {
  if (row.node.type === 'folder') {
    const s = new Set(openPaths.value)
    if (s.has(row.path)) s.delete(row.path)
    else s.add(row.path)
    openPaths.value = s
  } else {
    emit('select', row.node)
  }
}

function fmtSize(n?: number) {
  if (!n) return ''
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}
</script>

<template>
  <div class="wd-file-list">
    <div
      v-for="row in rows"
      :key="row.path"
      class="wd-file-list__row"
      :class="`wd-file-list__row--${row.node.type || 'file'}`"
      :style="{ paddingLeft: 12 + row.depth * 20 + 'px' }"
      @click="onRow(row)"
    >
      <!-- 箭头列始终占位：文件夹与文件的图标保持同列对齐 -->
      <span class="wd-file-list__chevron wd-chevron wd-chevron--right" :class="{ 'wd-chevron--open': openPaths.has(row.path) }">
        <svg v-if="row.node.type === 'folder'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"></path></svg>
      </span>
      <span class="wd-file-list__icon">
        <svg v-if="row.node.type === 'folder'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4 8a3 3 0 0 1 3-3h2.6c.5 0 1 .2 1.4.6l1 1c.4.4.9.6 1.4.6H18a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"></path></svg>
        <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4a2 2 0 0 1 2-2h6.6L20 7.4V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"></path></svg>
      </span>
      <span class="wd-file-list__name">{{ row.node.name }}</span>
      <span class="wd-file-list__size">{{ fmtSize(row.node.size) }}</span>
    </div>
  </div>
</template>
