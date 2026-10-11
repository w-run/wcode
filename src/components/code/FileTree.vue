<script setup lang="ts">
import { ref, watch } from 'vue'
import { getContents } from '@/api/repos'
import type { ContentsResponse } from '@/api/types'
import FileTreeNode from './FileTreeNode.vue'
import type { TreeNode } from './types'

const props = defineProps<{
  owner: string
  repo: string
  refName?: string
  /** 当前目录路径（面包屑/激活定位用） */
  currentPath?: string
}>()

const emit = defineEmits<{
  openFile: [path: string]
}>()

const root = ref<TreeNode>({
  name: '',
  path: '',
  type: 'dir',
  children: null,
  expanded: true,
  loading: false,
})

const treeLoading = ref(true)
const treeError = ref<string | null>(null)

function toNode(item: ContentsResponse): TreeNode {
  return {
    name: item.name ?? item.path ?? '',
    path: item.path ?? '',
    type: item.type ?? 'file',
    children: item.type === 'dir' ? null : [],
    expanded: false,
    loading: false,
  }
}

async function loadRoot() {
  treeLoading.value = true
  treeError.value = null
  root.value.children = null
  try {
    const items = await getContents(props.owner, props.repo, '', props.refName)
    root.value.children = (items ?? []).map(toNode)
  } catch (err) {
    treeError.value = err instanceof Error ? err.message : '加载失败'
    root.value.children = []
  } finally {
    treeLoading.value = false
  }
}

watch(
  () => [props.owner, props.repo, props.refName] as const,
  () => loadRoot(),
  { immediate: true },
)
</script>

<template>
  <nav class="file-tree" aria-label="仓库文件树">
    <div v-if="treeLoading" class="file-tree__skeleton">
      <span v-for="i in 10" :key="i" class="file-tree__line" />
    </div>

    <p v-else-if="treeError" class="file-tree__error">
      {{ treeError }}
      <button type="button" class="file-tree__retry" @click="loadRoot">
        重试
      </button>
    </p>

    <p v-else-if="!root.children?.length" class="file-tree__empty">空仓库</p>

    <ul v-else class="file-tree__list">
      <FileTreeNode
        v-for="node in root.children"
        :key="node.path"
        :node="node"
        :owner="owner"
        :repo="repo"
        :ref-name="refName"
        :depth="0"
        :active-path="currentPath"
        @open-file="emit('openFile', $event)"
      />
    </ul>
  </nav>
</template>

<style lang="scss" scoped>
.file-tree {
  background: $color-surface;
  border-radius: $radius-lg;
  padding: $space-2;
  overflow-y: auto;
}

.file-tree__list {
  padding: 0;
  margin: 0;
  list-style: none;
}

.file-tree__skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: $space-2;
}

.file-tree__line {
  display: block;
  height: 10px;
  border-radius: $radius-full;
  background: $color-surface-2;
  animation: tree-shimmer 1.5s ease-in-out infinite;
}

.file-tree__line:nth-child(odd) {
  width: 60%;
}

.file-tree__line:nth-child(even) {
  width: 80%;
}

.file-tree__error,
.file-tree__empty {
  padding: $space-4;
  color: $color-text-muted;
  font-size: 13px;
  text-align: center;
}

.file-tree__retry {
  margin-left: $space-2;
  color: $color-accent;
  font-size: 13px;

  &:hover {
    color: $color-accent-hover;
  }
}

@keyframes tree-shimmer {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.5;
  }
}
</style>
