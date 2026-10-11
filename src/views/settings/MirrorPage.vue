<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  listMirrors,
  syncMirror,
  createMirror,
  type Mirror,
  type MirrorType,
} from '@/api/mirrors'
import { formatRelativeTime } from '@/utils/format'

const props = defineProps<{
  owner: string
  name: string
}>()

const mirrors = ref<Mirror[]>([])
const loading = ref(true)
const usingMock = ref(false)
const syncing = ref<number | null>(null)

const form = ref({
  type: 'pull' as MirrorType,
  url: '',
  username: '',
  password: '',
})
const creating = ref(false)

const MOCK: Mirror[] = [
  {
    id: 1,
    remote_address: 'https://github.com/example/demo.git',
    interval: '8h0m0s',
    sync_on_commit: false,
    updated_at: new Date(Date.now() - 3600_000).toISOString(),
  },
]

async function load() {
  loading.value = true
  try {
    mirrors.value = await listMirrors(props.owner, props.name)
    usingMock.value = false
  } catch {
    mirrors.value = MOCK
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

async function doSync(id: number) {
  syncing.value = id
  try {
    await syncMirror(props.owner, props.name)
  } catch {
    // 忽略（离线预览）
  }
  syncing.value = null
}

async function submit() {
  if (!form.value.url.trim()) return
  creating.value = true
  try {
    const m = await createMirror(props.owner, props.name, form.value.type, {
      remote_address: form.value.url.trim(),
      remote_username: form.value.username || undefined,
      remote_password: form.value.password || undefined,
    })
    mirrors.value.push(m)
  } catch {
    mirrors.value.push({
      id: Date.now(),
      remote_address: form.value.url.trim(),
    })
    usingMock.value = true
  } finally {
    form.value = { type: 'pull', url: '', username: '', password: '' }
    creating.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mirror">
    <header class="mirror__head">
      <h1 class="mirror__title">镜像同步</h1>
      <p class="mirror__desc">
        将本仓库与 GitHub / Gitee / GitLab 等远端镜像同步。
      </p>
    </header>

    <p v-if="usingMock" class="mirror__banner">
      离线预览：后端不可达，展示示例数据
    </p>

    <section class="mirror__list">
      <div v-if="loading" class="mirror__skeleton">
        <span v-for="i in 3" :key="i" class="mirror__skel" />
      </div>

      <p v-else-if="!mirrors.length" class="mirror__empty">还没有配置镜像</p>

      <article v-for="m in mirrors" v-else :key="m.id" class="mirror-card">
        <div class="mirror-card__main">
          <span class="mirror-card__badge">拉取</span>
          <span class="mirror-card__url">{{ m.remote_address }}</span>
        </div>
        <div class="mirror-card__meta">
          <span v-if="m.interval">间隔 {{ m.interval }}</span>
          <span v-if="m.updated_at"
            >上次 {{ formatRelativeTime(m.updated_at) }}</span
          >
        </div>
        <button
          type="button"
          class="mirror-card__sync"
          :disabled="syncing === m.id"
          @click="doSync(m.id)"
        >
          {{ syncing === m.id ? '同步中...' : '立即同步' }}
        </button>
      </article>
    </section>

    <section class="mirror__form">
      <h2 class="mirror__subtitle">新建镜像</h2>

      <div class="segmented">
        <button
          type="button"
          class="segmented__item"
          :class="{ 'segmented__item--active': form.type === 'pull' }"
          @click="form.type = 'pull'"
        >
          拉取（Pull）
        </button>
        <button
          type="button"
          class="segmented__item"
          :class="{ 'segmented__item--active': form.type === 'push' }"
          @click="form.type = 'push'"
        >
          推送（Push）
        </button>
      </div>

      <input
        v-model="form.url"
        class="field"
        placeholder="远端仓库 URL（https://...）"
      />
      <div class="field-row">
        <input
          v-model="form.username"
          class="field"
          placeholder="用户名（可选）"
        />
        <input
          v-model="form.password"
          class="field"
          type="password"
          placeholder="访问令牌 / 密码（可选）"
        />
      </div>

      <button
        type="button"
        class="mirror__submit"
        :disabled="creating || !form.url.trim()"
        @click="submit"
      >
        {{ creating ? '创建中...' : '创建镜像' }}
      </button>
    </section>

    <section class="mirror__guide">
      <h2 class="mirror__subtitle">平台接入指引</h2>
      <ul class="guide-list">
        <li>
          <strong>GitHub</strong> — Personal Access Token，Scope 仅需
          <code>repo</code>
        </li>
        <li><strong>Gitee</strong> — 私有令牌（access_token）</li>
        <li>
          <strong>GitLab</strong> — Project/Deploy Token（read_repository +
          write_repository）
        </li>
      </ul>
      <p class="mirror__note">
        <strong>双向同步</strong
        >：同时配置「拉取」与「推送」两条镜像。检测到两侧分支分叉时，Gitea
        会暂停同步并告警，需人工合并后再恢复，避免回写覆盖。
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.mirror {
  max-width: 720px;
  margin: 0 auto;
}

.mirror__head {
  margin-bottom: $space-6;
}

.mirror__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: $color-text;
}

.mirror__desc {
  margin-top: $space-2;
  color: $color-text-muted;
  font-size: 14px;
}

.mirror__banner {
  padding: $space-2 $space-4;
  margin-bottom: $space-4;
  border-radius: $radius-md;
  background: $color-warning-light;
  color: $color-warning;
  font-size: 13px;
}

.mirror__list {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  margin-bottom: $space-8;
}

.mirror__skeleton {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.mirror__skel {
  height: 64px;
  border-radius: $radius-lg;
  background: $color-surface-2;
  animation: mirror-shimmer 1.5s ease-in-out infinite;
}

.mirror__empty {
  padding: $space-8;
  color: $color-text-muted;
  text-align: center;
  font-size: 14px;
}

.mirror-card {
  display: flex;
  align-items: center;
  gap: $space-4;
  padding: $space-4;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.mirror-card__main {
  display: flex;
  align-items: center;
  gap: $space-2;
  flex: 1;
  min-width: 0;
}

.mirror-card__badge {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: $radius-full;
  background: $color-accent-light;
  color: $color-accent;
  font-size: 12px;
}

.mirror-card__url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: $color-text;
}

.mirror-card__meta {
  display: flex;
  gap: $space-3;
  font-size: 12px;
  color: $color-text-muted;

  @include media-down($bp-desktop) {
    display: none;
  }
}

.mirror-card__sync {
  flex-shrink: 0;
  padding: 6px 14px;
  border: none;
  border-radius: $radius-full;
  background: $color-surface-2;
  color: $color-text;
  font-size: 12.5px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: $color-accent-light;
    color: $color-accent;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.mirror__form {
  padding: $space-6;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.mirror__subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: $color-text;
  margin-bottom: $space-4;
}

.segmented {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  margin-bottom: $space-3;
  background: $color-surface-2;
  border-radius: $radius-full;
}

.segmented__item {
  padding: 6px 16px;
  border: none;
  border-radius: $radius-full;
  background: transparent;
  color: $color-text-muted;
  font-size: 13px;
  cursor: pointer;

  &--active {
    background: $color-surface;
    color: $color-accent;
    font-weight: 500;
  }
}

.field {
  width: 100%;
  padding: $space-2 $space-3;
  border: none;
  border-radius: $radius-md;
  background: $color-bg;
  color: $color-text;
  font-size: 13px;

  &::placeholder {
    color: $color-text-muted;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px $color-accent-light;
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $space-3;
  margin-top: $space-3;

  @include media-down($bp-tablet) {
    grid-template-columns: 1fr;
  }
}

.mirror__submit {
  margin-top: $space-4;
  padding: $space-2 $space-6;
  border: none;
  border-radius: $radius-full;
  background: $color-accent;
  color: #fff;
  font-size: 13px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: $color-accent-hover;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.mirror__guide {
  margin-top: $space-4;
  padding: $space-6;
  background: $color-surface;
  border-radius: $radius-lg;
  box-shadow: $shadow-sm;
}

.guide-list {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: $space-2;
  font-size: 13.5px;
  color: $color-text;

  strong {
    font-weight: 600;
  }

  code {
    padding: 1px 6px;
    border-radius: 6px;
    background: $color-surface-2;
    font-family: $font-mono;
    font-size: 0.9em;
  }
}

.mirror__note {
  margin-top: $space-6;
  font-size: 13px;
  color: $color-text-muted;
  line-height: 1.7;

  strong {
    color: $color-text;
  }
}

@keyframes mirror-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
