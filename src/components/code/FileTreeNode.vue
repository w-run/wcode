<script setup lang="ts">
import { getContents } from '@/api/repos'
import type { TreeNode } from './types'

const props = defineProps<{
  node: TreeNode
  owner: string
  repo: string
  refName?: string
  depth: number
  activePath?: string
}>()

const emit = defineEmits<{
  openFile: [path: string]
}>()

async function toggle() {
  const node = props.node
  if (node.type !== 'dir') {
    emit('openFile', node.path)
    return
  }
  node.expanded = !node.expanded
  if (node.children === null) {
    node.loading = true
    try {
      const items = await getContents(
        props.owner,
        props.repo,
        node.path,
        props.refName,
      )
      node.children = (items ?? []).map((item) => ({
        name: item.name ?? item.path ?? '',
        path: item.path ?? '',
        type: item.type ?? 'file',
        children: item.type === 'dir' ? null : [],
        expanded: false,
        loading: false,
      }))
    } catch {
      node.children = []
    } finally {
      node.loading = false
    }
  }
}
</script>

<template>
  <li class="tree-item">
    <button
      type="button"
      class="tree-row"
      :class="{
        'tree-row--dir': node.type === 'dir',
        'tree-row--active': node.type === 'file' && node.path === activePath,
      }"
      :style="{ paddingLeft: `${depth * 14 + 8}px` }"
      :aria-expanded="node.type === 'dir' ? node.expanded : undefined"
      @click="toggle"
    >
      <svg
        v-if="node.type === 'dir'"
        class="tree-chevron"
        :class="{ 'tree-chevron--open': node.expanded }"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <path d="M6 4l4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <svg
        v-else
        class="tree-icon"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="1.2"
        aria-hidden="true"
      >
        <path
          d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-3.5-3.5Z"
          stroke-linejoin="round"
        />
        <path d="M9.5 1.5V5H13" stroke-linejoin="round" />
      </svg>
      <span v-if="node.loading" class="tree-spinner" aria-hidden="true" />
      <span class="tree-name">{{ node.name }}</span>
    </button>

    <ul
      v-if="node.type === 'dir' && node.expanded && node.children?.length"
      class="tree-children"
    >
      <FileTreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :owner="owner"
        :repo="repo"
        :ref-name="refName"
        :depth="depth + 1"
        :active-path="activePath"
        @open-file="emit('openFile', $event)"
      />
    </ul>
  </li>
</template>

<style lang="scss" scoped>
.tree-item {
  list-style: none;
}

.tree-children {
  padding: 0;
  margin: 0;
  list-style: none;
}

.tree-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  height: 30px;
  padding-right: 8px;
  border: none;
  border-radius: $radius-sm;
  background: transparent;
  color: $color-text-muted;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition:
    background $transition-fast,
    color $transition-fast;

  &:hover {
    background: $color-surface-2;
    color: $color-text;
  }

  &--active {
    background: $color-accent-light;
    color: $color-accent;
    font-weight: 500;
  }
}

.tree-chevron {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  color: $color-text-muted;
  transform: rotate(-90deg);
  transition: transform 0.15s ease;

  &--open {
    transform: rotate(0);
  }
}

.tree-icon {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin-left: 14px;
  color: $color-text-muted;
}

.tree-spinner {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  margin-left: 14px;
  border: 1.5px solid $color-text-muted;
  border-top-color: transparent;
  border-radius: $radius-full;
  animation: tree-spin 0.7s linear infinite;
}

.tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

@keyframes tree-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
