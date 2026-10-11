<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getContents, getFileRaw, listBranches } from '@/api/repos'
import type { ContentsResponse } from '@/api/types'
import FileTree from '@/components/code/FileTree.vue'
import CodeViewer from '@/components/code/CodeViewer.vue'

/**
 * VSCode 式左右布局代码浏览：
 * 左侧资源管理器（文件树）+ 右侧编辑器面板（目录列表 / 代码查看）
 * 点击树节点即时切换，URL 同步当前路径（可分享/刷新）。
 */
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
const filename = computed(() => currentPath.value.split('/').pop() ?? '')

const branch = ref(props.refName ?? 'main')
const branches = ref<string[]>([])

const entries = ref<ContentsResponse[]>([])
const fileContent = ref('')
const loading = ref(true)
const error = ref<string | null>(null)

/** 当前路径指向单个文件（编辑器模式） */
const isFile = computed(
  () => entries.value.length === 1 && entries.value[0].type === 'file',
)

const dirs = computed(() => entries.value.filter((e) => e.type === 'dir'))
const files = computed(() => entries.value.filter((e) => e.type !== 'dir'))

function browseUrl(path = '') {
  const base = `/repos/${props.owner}/${props.name}/browse/${encodeURIComponent(branch.value)}`
  return path ? `${base}/${path}` : base
}

/** 跳转（目录或文件） */
function go(path: string) {
  router.push(browseUrl(path))
}

const crumbs = computed(() => {
  const segs = currentPath.value ? currentPath.value.split('/') : []
  const list = [{ label: props.name, to: browseUrl() }]
  let acc = ''
  for (const seg of segs) {
    acc = acc ? `${acc}/${seg}` : seg
    list.push({ label: seg, to: browseUrl(acc) })
  }
  return list
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const data = await getContents(
      props.owner,
      props.name,
      currentPath.value,
      branch.value,
    )
    entries.value = data
    if (data.length === 1 && data[0].type === 'file') {
      fileContent.value = await getFileRaw(
        props.owner,
        props.name,
        branch.value,
        currentPath.value,
      )
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
    entries.value = []
  } finally {
    loading.value = false
  }
}

async function loadBranches() {
  try {
    const list = await listBranches(props.owner, props.name)
    branches.value = list.map((b) => b.name)
    if (!branch.value && branches.value.length) branch.value = branches.value[0]
  } catch {
    // 分支不可达时保持默认
  }
}

watch(
  () => [props.refName, currentPath.value] as const,
  () => load(),
  {
    immediate: true,
  },
)
onMounted(loadBranches)
</script>

<template>
  <div class="vs">
    <header class="vs__bar">
      <nav class="vs__crumbs" aria-label="路径">
        <router-link
          v-for="(c, i) in crumbs"
          :key="c.to"
          :to="c.to"
          class="vs__crumb"
          :class="{ 'vs__crumb--active': i === crumbs.length - 1 }"
        >
          {{ c.label }}
        </router-link>
      </nav>
      <select v-model="branch" class="vs__branch" aria-label="分支">
        <option v-for="b in branches" :key="b" :value="b">{{ b }}</option>
      </select>
    </header>

    <div class="vs__body">
      <!-- 左侧：资源管理器（文件树） -->
      <aside class="explorer">
        <p class="explorer__title">{{ name }}</p>
        <FileTree
          :owner="owner"
          :repo="name"
          :ref-name="branch"
          :current-path="isFile ? currentPath : undefined"
          @open-file="go"
        />
      </aside>

      <!-- 右侧：编辑器面板 -->
      <main class="edit">
        <div class="edit__tabbar">
          <span v-if="!isFile" class="edit__tab edit__tab--active">
            文件列表
          </span>
          <span v-else class="edit__tab edit__tab--active">{{ filename }}</span>
        </div>

        <div v-if="loading" class="edit__loading">
          <span v-for="i in 10" :key="i" class="edit__line" />
        </div>

        <p v-else-if="error" class="edit__empty">{{ error }}</p>

        <!-- 目录视图 -->
        <ul v-else-if="!isFile" class="edit__list">
          <li v-for="e in [...dirs, ...files]" :key="e.path">
            <button type="button" class="row" @click="go(e.path ?? '')">
              <svg
                class="row__icon"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                stroke-width="1.2"
                aria-hidden="true"
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
              <span class="row__name">{{ e.name }}</span>
            </button>
          </li>
        </ul>

        <!-- 文件视图：编辑器 -->
        <CodeViewer v-else :code="fileContent" :filename="filename" />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vs {
  height: calc(100vh - 56px - 72px);
  display: flex;
  flex-direction: column;
}

.vs__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-2 $space-4;
  margin-bottom: $space-2;
}

.vs__crumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  font-size: 13px;
  overflow: hidden;
}

.vs__crumb {
  color: $color-text-muted;
  text-decoration: none;
  white-space: nowrap;

  & + .vs__crumb::before {
    content: '/';
    margin-right: 3px;
    opacity: 0.35;
  }

  &:hover {
    color: $color-accent;
  }

  &--active {
    color: $color-text;
    font-weight: 500;
  }
}

.vs__branch {
  flex-shrink: 0;
  padding: 4px 12px;
  border: none;
  border-radius: $radius-full;
  background: $color-surface;
  color: $color-text-muted;
  font-size: 12px;
  cursor: pointer;
}

.vs__body {
  flex: 1;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: $space-3;
  min-height: 0;

  @include media-down(calc($bp-desktop - 1px)) {
    grid-template-columns: 1fr;
  }
}

/* ---------- 左侧资源管理器 ---------- */
.explorer {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
  padding: $space-2;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;

  @include media-down(calc($bp-desktop - 1px)) {
    max-height: 220px;
  }
}

.explorer__title {
  padding: $space-1 $space-2 $space-2;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: $color-text-muted;
}

/* ---------- 右侧编辑器 ---------- */
.edit {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  overflow: hidden;
}

.edit__tabbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: $space-1 $space-2;
  background: $color-surface-2;
}

.edit__tab {
  padding: 5px 14px;
  border-radius: $radius-md;
  font-size: 12.5px;
  color: $color-text-muted;

  &--active {
    background: $color-surface;
    color: $color-text;
    font-weight: 500;
    box-shadow: $shadow-sm;
  }
}

.edit__list {
  padding: $space-2;
  margin: 0;
  list-style: none;
  overflow-y: auto;
}

.row {
  display: flex;
  align-items: center;
  gap: $space-2;
  width: 100%;
  height: 34px;
  padding: 0 $space-3;
  border: none;
  border-radius: $radius-md;
  background: transparent;
  color: $color-text;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: background $transition-fast;

  &:hover {
    background: $color-surface-2;
  }
}

.row__icon {
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  color: $color-text-muted;
}

.row__name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit__loading {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: $space-3;
  overflow-y: auto;
}

.edit__line {
  display: block;
  height: 12px;
  border-radius: $radius-sm;
  background: $color-surface-2;
  animation: vs-shimmer 1.5s ease-in-out infinite;

  &:nth-child(odd) {
    width: 65%;
  }
}

.edit__empty {
  padding: $space-8;
  color: $color-text-muted;
  text-align: center;
  font-size: 13px;
}

@keyframes vs-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
