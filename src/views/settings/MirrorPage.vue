<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
const pushMirrors = ref<Mirror[]>([])
const loading = ref(true)
const usingMock = ref(false)
const syncing = ref<number | null>(null)

const groups = computed(() => [
  { key: 'pull', label: '拉取镜像', items: mirrors.value },
  { key: 'push', label: '推送镜像', items: pushMirrors.value },
])

const pushAddresses = computed(
  () => new Set(pushMirrors.value.map((m) => m.remote_address)),
)

/** 该远端是否同时配置了推送镜像（双向同步） */
function isDual(addr: string) {
  return pushAddresses.value.has(addr)
}

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
    const [pull, push] = await Promise.all([
      listMirrors(props.owner, props.name, 'pull'),
      listMirrors(props.owner, props.name, 'push'),
    ])
    mirrors.value = pull
    pushMirrors.value = push
    usingMock.value = false
  } catch {
    mirrors.value = MOCK
    pushMirrors.value = []
    usingMock.value = true
  } finally {
    loading.value = false
  }
}

function addMirror(m: Mirror, type: MirrorType) {
  if (type === 'push') pushMirrors.value.push(m)
  else mirrors.value.push(m)
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
    addMirror(m, form.value.type)
  } catch {
    addMirror(
      { id: Date.now(), remote_address: form.value.url.trim() },
      form.value.type,
    )
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

    <section v-for="g in groups" :key="g.key" class="mirror__list">
      <h2 class="mirror__group-title">{{ g.label }}</h2>

      <div v-if="loading" class="mirror__skeleton">
        <span v-for="i in 3" :key="i" class="mirror__skel" />
      </div>

      <p v-else-if="!g.items.length" class="mirror__empty">
        暂无 {{ g.label }}
      </p>

      <article v-for="m in g.items" v-else :key="m.id" class="mirror-card">
        <div class="mirror-card__main">
          <span class="mirror-card__badge">
            {{ g.key === 'pull' ? '拉取' : '推送' }}
          </span>
          <span v-if="isDual(m.remote_address)" class="mirror-card__dual">
            双向
          </span>
          <span class="mirror-card__url">{{ m.remote_address }}</span>
        </div>
        <div class="mirror-card__meta">
          <span v-if="m.interval">间隔 {{ m.interval }}</span>
          <span v-if="m.updated_at">
            上次 {{ formatRelativeTime(m.updated_at) }}
          </span>
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
  margin-bottom: var(--wd-space-6);
}

.mirror__title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--wd-ink);
}

.mirror__desc {
  margin-top: var(--wd-space-2);
  color: var(--wd-ink-2);
  font-size: 14px;
}

.mirror__banner {
  padding: var(--wd-space-2) var(--wd-space-4);
  margin-bottom: var(--wd-space-4);
  border-radius: var(--wd-radius-md);
  background: var(--wd-warning-soft);
  color: var(--wd-warning);
  font-size: 13px;
}

.mirror__group-title {
  margin: 0 0 var(--wd-space-2) var(--wd-space-2);
  font-size: 13px;
  font-weight: 600;
  color: var(--wd-ink);
}

.mirror__list {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-3);
  margin-bottom: var(--wd-space-8);
}

.mirror__skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-3);
}

.mirror__skel {
  height: 64px;
  border-radius: var(--wd-radius-lg);
  background: var(--wd-field);
  animation: mirror-shimmer 1.5s ease-in-out infinite;
}

.mirror__empty {
  padding: var(--wd-space-8);
  color: var(--wd-ink-2);
  text-align: center;
  font-size: 14px;
}

.mirror-card {
  display: flex;
  align-items: center;
  gap: var(--wd-space-4);
  padding: var(--wd-space-4);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
}

.mirror-card__main {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  flex: 1;
  min-width: 0;
}

.mirror-card__badge {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-tint-2);
  color: var(--wd-red);
  font-size: 12px;
}

.mirror-card__dual {
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-warning-soft);
  color: var(--wd-warning);
  font-size: 12px;
}

.mirror-card__url {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--wd-ink);
}

.mirror-card__meta {
  display: flex;
  gap: var(--wd-space-3);
  font-size: 12px;
  color: var(--wd-ink-2);

  @include media-down($bp-desktop) {
    display: none;
  }
}

.mirror-card__sync {
  flex-shrink: 0;
  padding: 6px 14px;
  border: none;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-field);
  color: var(--wd-ink);
  font-size: 12.5px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--wd-tint-2);
    color: var(--wd-red);
  }

  &:disabled {
    opacity: 0.6;
  }
}

.mirror__form {
  padding: var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
}

.mirror__subtitle {
  font-size: 1rem;
  font-weight: 600;
  color: var(--wd-ink);
  margin-bottom: var(--wd-space-4);
}

.segmented {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  margin-bottom: var(--wd-space-3);
  background: var(--wd-field);
  border-radius: var(--wd-radius-pill);
}

.segmented__item {
  padding: 6px 16px;
  border: none;
  border-radius: var(--wd-radius-pill);
  background: transparent;
  color: var(--wd-ink-2);
  font-size: 13px;
  cursor: pointer;

  &--active {
    background: var(--wd-card);
    color: var(--wd-red);
    font-weight: 500;
  }
}

.field {
  width: 100%;
  padding: var(--wd-space-2) var(--wd-space-3);
  border: none;
  border-radius: var(--wd-radius-md);
  background: var(--wd-bg);
  color: var(--wd-ink);
  font-size: 13px;

  &::placeholder {
    color: var(--wd-ink-2);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--wd-tint-2);
  }
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--wd-space-3);
  margin-top: var(--wd-space-3);

  @include media-down($bp-tablet) {
    grid-template-columns: 1fr;
  }
}

.mirror__submit {
  margin-top: var(--wd-space-4);
  padding: var(--wd-space-2) var(--wd-space-6);
  border: none;
  border-radius: var(--wd-radius-pill);
  background: var(--wd-red);
  color: #fff;
  font-size: 13px;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--wd-red-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.mirror__guide {
  margin-top: var(--wd-space-4);
  padding: var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
}

.guide-list {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-2);
  font-size: 13.5px;
  color: var(--wd-ink);

  strong {
    font-weight: 600;
  }

  code {
    padding: 1px 6px;
    border-radius: 6px;
    background: var(--wd-field);
    font-family: var(--wd-font-mono);
    font-size: 0.9em;
  }
}

.mirror__note {
  margin-top: var(--wd-space-6);
  font-size: 13px;
  color: var(--wd-ink-2);
  line-height: 1.7;

  strong {
    color: var(--wd-ink);
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
