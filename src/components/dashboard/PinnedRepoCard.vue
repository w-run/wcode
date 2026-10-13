<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Repository } from '@/api/types'
import { formatCount } from '@/utils/format'

const props = defineProps<{
  repo: Repository
}>()

const router = useRouter()

/** 点击进入仓库详情（owner/name 取自 full_name） */
function navigate() {
  const [owner, repoName] = props.repo.full_name.split('/')
  router.push(`/repos/${owner}/${repoName}`)
}

/** 语言色点 class：_tokens.scss 中的 $lang-* 语义色（未知语言回退默认灰） */
const langClass = computed(() => {
  const lang = (props.repo.language ?? '').toLowerCase()
  const known = ['js', 'ts', 'python', 'rust', 'go', 'cpp']
  return known.includes(lang) ? `lang-dot--${lang}` : 'lang-dot--default'
})

/** 更新时间：ISO 字符串 → `YYYY-MM-DD` */
const updatedText = computed(() => {
  const date = new Date(props.repo.updated_at ?? '')
  if (Number.isNaN(date.getTime())) return '—'
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})
</script>

<template>
  <article
    class="pinned-repo"
    role="link"
    tabindex="0"
    @click="navigate"
    @keydown.enter="navigate"
  >
    <header class="pinned-repo__head">
      <h3 class="pinned-repo__name">{{ repo.full_name || repo.name }}</h3>
      <span class="pinned-repo__stars" title="star 数">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"
          />
        </svg>
        {{ formatCount(repo.stars_count ?? 0) }}
      </span>
    </header>

    <p v-if="repo.description" class="pinned-repo__desc">
      {{ repo.description }}
    </p>

    <footer class="pinned-repo__meta">
      <span class="pinned-repo__lang">
        <span class="lang-dot" :class="langClass" aria-hidden="true" />
        {{ repo.language || 'Unknown' }}
      </span>
      <span class="pinned-repo__updated">更新于 {{ updatedText }}</span>
    </footer>
  </article>
</template>

<style lang="scss" scoped>
.pinned-repo {
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-3);
  padding: var(--wd-space-6);
  background: var(--wd-card);
  box-shadow: var(--wd-shadow-sm);
  border-radius: var(--wd-radius-lg);
  transition: box-shadow var(--wd-dur-fast) var(--wd-ease);
  cursor: pointer;

  &:hover {
    box-shadow: var(--wd-shadow-pop);
  }

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--wd-space-3);
  }

  &__name {
    margin: 0;
    font-size: 1.0625rem;
    font-weight: 700;
    color: var(--wd-ink);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__stars {
    display: inline-flex;
    align-items: center;
    gap: var(--wd-space-1);
    flex-shrink: 0;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--wd-ink-2);
    font-variant-numeric: tabular-nums;
  }

  &__desc {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.6;
    color: var(--wd-ink-2);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--wd-space-3);
    margin-top: auto;
  }

  &__lang {
    display: inline-flex;
    align-items: center;
    gap: var(--wd-space-2);
    font-size: 0.8125rem;
    color: var(--wd-ink-2);
  }

  &__updated {
    font-size: 0.75rem;
    color: var(--wd-ink-2);
  }
}

.lang-dot {
  width: 10px;
  height: 10px;
  border-radius: var(--wd-radius-pill);
  flex-shrink: 0;

  &--default {
    background: var(--wd-ink-2);
  }

  &--js {
    background: $lang-js;
  }

  &--ts {
    background: $lang-ts;
  }

  &--python {
    background: $lang-python;
  }

  &--rust {
    background: $lang-rust;
  }

  &--go {
    background: $lang-go;
  }

  &--cpp {
    background: $lang-cpp;
  }
}
</style>
