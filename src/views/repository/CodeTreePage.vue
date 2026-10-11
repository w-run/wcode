<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getContents, listBranches } from '@/api/repos'
import type { ContentsResponse } from '@/api/types'
import FileTree from '@/components/code/FileTree.vue'

const props = defineProps<{
  owner: string
  name: string
  refName?: string
  path?: string | string[]
}>()

const router = useRouter()

const currentPath = computed(() =>
  Array.isArray(props.path) ? props.path.join('/') : (props.path ?? ''),
)

const branch = ref(props.refName ?? 'main')
const branches = ref<string[]>([])
const error = ref<string | null>(null)
const entries = ref<ContentsResponse[]>([])

function treeUrl(p = '') {
  return `/repos/${props.owner}/${props.name}/tree/${branch.value}${p ? `/${p}` : ''}`
}

function blobUrl(p: string) {
  return `/repos/${props.owner}/${props.name}/blob/${branch.value}/${p}`
}

function crumbs() {
  const segs = currentPath.value ? currentPath.value.split('/') : []
  const list = [{ label: props.name, to: treeUrl() }]
  let acc = ''
  for (const s of segs) {
    acc = acc ? `${acc}/${s}` : s
    list.push({ label: s, to: treeUrl(acc) })
  }
  return list
}

async function load() {
  error.value = null
  try {
    entries.value = await getContents(
      props.owner,
      props.name,
      currentPath.value,
      branch.value,
    )
  } catch (e) {
    error.value = e instanceof Error ? e.message : '加载失败'
    entries.value = []
  }
}

async function loadBranches() {
  try {
    const bs = await listBranches(props.owner, props.name)
    branches.value = bs.map((b) => b.name)
    if (!branch.value && branches.value.length) branch.value = branches.value[0]
  } catch {
    // 忽略
  }
}

watch(
  () => [currentPath.value, branch.value] as const,
  () => load(),
  { immediate: true },
)
onMounted(loadBranches)
</script>

<template>
  <div class="browse">
    <header class="browse__head">
      <div class="browse__title">
        <h1 class="browse__repo">{{ owner }}/{{ name }}</h1>
        <select v-model="branch" class="browse__branch" aria-label="分支">
          <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
        </select>
      </div>
      <nav class="browse__crumbs" aria-label="路径">
        <router-link
          v-for="(c, i) in crumbs()"
          :key="c.to"
          :to="c.to"
          class="browse__crumb"
          :class="{ 'browse__crumb--active': i === crumbs().length - 1 }"
        >
          {{ c.label }}
        </router-link>
      </nav>
    </header>

    <div class="browse__body">
      <aside class="browse__tree">
        <FileTree
          :owner="owner"
          :repo="name"
          :ref-name="branch"
          :current-path="currentPath"
          @open-file="router.push(blobUrl($event))"
        />
      </aside>

      <section class="browse__files">
        <p v-if="error" class="browse__error">{{ error }}</p>
        <p v-else-if="!entries.length" class="browse__empty">目录为空</p>
        <ul v-else class="entry-list">
          <li v-for="e in entries" :key="e.path">
            <router-link :to="blobUrl(e.path ?? '')" class="entry">
              <svg
                class="entry__icon"
                :class="{ 'entry__icon--dir': e.type === 'dir' }"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.2"
              >
                <path
                  v-if="e.type === 'dir'"
                  d="M1.75 2.5h3.6c.35 0 .68.14.93.39l.97.97c.25.25.58.39.93.39h5.57c.69 0 1.25.56 1.25 1.25v6.5c0 .69-.56 1.25-1.25 1.25H1.75C1.06 13.25.5 12.69.5 12V3.5c0-.69.56-1.25 1.25-1.25Z"
                  stroke-linejoin="round"
                />
                <path
                  v-else
                  d="M9.5 1.5H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5l-3.5-3.5Z"
                  stroke-linejoin="round"
                />
                <path
                  v-if="e.type !== 'dir'"
                  d="M9.5 1.5V5H13"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="entry__name">{{ e.name }}</span>
            </router-link>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.browse {
  max-width: 960px;
  margin: 0 auto;
}

.browse__head {
  margin-bottom: $space-4;
}

.browse__title {
  display: flex;
  align-items: center;
  gap: $space-3;
}

.browse__repo {
  font-size: 1.25rem;
  font-weight: 600;
  color: $color-text;
}

.browse__branch {
  padding: $space-1 $space-3;
  border: none;
  border-radius: $radius-full;
  background: $color-surface;
  color: $color-text-muted;
  font-size: 13px;
  cursor: pointer;
}

.browse__crumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: $space-2;
  font-size: 13px;
}

.browse__crumb {
  color: $color-text-muted;
  text-decoration: none;

  &::before {
    content: '/';
    margin-right: 4px;
    opacity: 0.4;
  }

  &:hover {
    color: $color-accent;
  }

  &--active {
    color: $color-text;
    font-weight: 500;
    pointer-events: none;
  }
}

.browse__body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: $space-4;
  align-items: start;

  @include media-down(calc($bp-desktop - 1px)) {
    grid-template-columns: 1fr;
  }
}

.browse__tree {
  position: sticky;
  top: 72px;
  max-height: calc(100vh - 96px);
  overflow-y: auto;

  @include media-down(calc($bp-desktop - 1px)) {
    position: static;
    max-height: 240px;
  }
}

.browse__files {
  background: $color-surface;
  border-radius: $radius-lg;
  padding: $space-2;
  box-shadow: $shadow-md;
  min-height: 200px;
}

.entry-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.entry {
  display: flex;
  align-items: center;
  gap: $space-2;
  height: 36px;
  padding: 0 $space-3;
  border-radius: $radius-md;
  color: $color-text;
  text-decoration: none;
  transition: background $transition-fast;

  &:hover {
    background: $color-surface-2;
  }
}

.entry__icon {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  color: $color-text-muted;

  &--dir {
    color: $color-warning;
  }
}

.entry__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.5px;
}

.browse__error,
.browse__empty {
  padding: $space-8 $space-4;
  color: $color-text-muted;
  font-size: 13px;
  text-align: center;
}
</style>
