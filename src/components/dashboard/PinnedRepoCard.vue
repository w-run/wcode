<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Repository } from '@/api/types'
import { formatCount, formatRelativeTime } from '@/utils/format'

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

/** 更新时间：相对时间（2 天前 / 3 小时前 …） */
const updatedText = computed(() => formatRelativeTime(props.repo.updated_at))
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
      <span class="pinned-repo__icon" aria-hidden="true">
        <WdIcon name="folder" :size="18" />
      </span>
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--wd-space-3);
  padding: var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
  box-shadow: var(--wd-shadow-sm);
  cursor: pointer;
  transition:
    transform $wd-dur-slow $wd-ease-spring-soft,
    box-shadow $wd-dur-slow $wd-ease-smooth;

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--wd-shadow-pop);
  }

  /* 左侧红色强调条：hover 时从顶部生长 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    bottom: 50%;
    width: 4px;
    border-radius: 0 4px 4px 0;
    background: var(--wd-red);
    opacity: 0;
    transition:
      top $wd-dur-slow $wd-ease-out,
      bottom $wd-dur-slow $wd-ease-out,
      opacity $wd-dur-slow $wd-ease-smooth;
  }
  &:hover::before {
    top: 16px;
    bottom: 16px;
    opacity: 1;
  }
}

.pinned-repo__head {
  display: flex;
  align-items: center;
  gap: var(--wd-space-2);
  min-width: 0;
}

.pinned-repo__icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--wd-tint-2);
  color: var(--wd-red);
}

.pinned-repo__name {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.015em;
  color: var(--wd-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color $wd-dur-slow $wd-ease-smooth;

  .pinned-repo:hover & {
    color: var(--wd-red);
  }
}

.pinned-repo__stars {
  margin-left: auto;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: var(--wd-ink-2);
  font-variant-numeric: tabular-nums;
}

.pinned-repo__desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--wd-ink-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

.pinned-repo__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-space-2);
  margin-top: auto;
}

.pinned-repo__lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--wd-ink-3);
}

.lang-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.lang-dot--default {
  background: var(--wd-ink-4);
}
.lang-dot--js {
  background: $lang-js;
}
.lang-dot--ts {
  background: $lang-ts;
}
.lang-dot--python {
  background: $lang-python;
}
.lang-dot--rust {
  background: $lang-rust;
}
.lang-dot--go {
  background: $lang-go;
}
.lang-dot--cpp {
  background: $lang-cpp;
}

.pinned-repo__updated {
  font-size: 12px;
  color: var(--wd-ink-3);
  font-variant-numeric: tabular-nums;
}
</style>
