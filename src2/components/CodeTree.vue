<script setup>
// 递归的文件树节点：目录懒加载 + 展开状态共享
import { computed } from 'vue'
import {
  childrenOf, isExpanded, toggleDir, openFile, selected, accentOf, loadingDirs,
} from '../lib/codefs.js'

const props = defineProps({
  dir: { type: String, default: '' },
  depth: { type: Number, default: 0 },
})

const entries = computed(() => childrenOf(props.dir))
const dirs = computed(() => entries.value.filter((e) => e.type === 'dir'))
const files = computed(() => entries.value.filter((e) => e.type === 'file'))
const sorted = computed(() => [...dirs.value, ...files.value])
const loading = computed(() => loadingDirs.value.has(props.dir))
</script>

<template>
  <div class="cb-tree" :style="{ '--depth': depth }">
    <div v-for="item in sorted" :key="item.path" class="cb-node">
      <button
        v-if="item.type === 'dir'"
        class="cb-row cb-row--dir"
        :class="{ 'cb-row--open': isExpanded(item.path) }"
        :style="{ paddingLeft: 8 + depth * 13 + 'px' }"
        @click="toggleDir(item.path)"
      >
        <svg class="cb-row__chev" :class="{ 'cb-row__chev--open': isExpanded(item.path) }" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
        <svg class="cb-row__ic cb-row__ic--dir" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h3.6a2 2 0 0 1 1.5.7l1 1.3H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </svg>
        <span class="cb-row__name">{{ item.name }}</span>
        <span v-if="loading" class="cb-row__spin"></span>
      </button>

      <button
        v-else
        class="cb-row cb-row--file"
        :class="{ 'cb-row--active': selected === item.path }"
        :data-accent="accentOf(item.name)"
        :style="{ paddingLeft: 8 + depth * 13 + 13 + 'px' }"
        @click="openFile(item)"
      >
        <svg class="cb-row__ic cb-row__ic--file" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
        <span class="cb-row__name">{{ item.name }}</span>
      </button>

      <!-- 递归：子目录 -->
      <CodeTree v-if="item.type === 'dir' && isExpanded(item.path)" :dir="item.path" :depth="depth + 1" />
    </div>
  </div>
</template>

<script>
// 递归组件自引用（SFC 同名 + name 选项）
export default { name: 'CodeTree' }
</script>