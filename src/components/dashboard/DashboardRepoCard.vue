<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { Repository } from '@/api/types'
import { formatRelativeTime } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    repo: Repository
    /** 紧凑形态：单行、无描述，用于「其余展开行」，一屏能放更多 */
    compact?: boolean
  }>(),
  { compact: false },
)

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

const updatedText = computed(() => formatRelativeTime(props.repo.updated_at))
</script>

<template>
  <article
    class="dash-repo"
    :class="{ 'dash-repo--compact': compact }"
    role="link"
    tabindex="0"
    @click="navigate"
    @keydown.enter="navigate"
  >
    <span class="dash-repo__icon" aria-hidden="true">
      <WdIcon name="folder" :size="compact ? 15 : 18" />
    </span>

    <div class="dash-repo__body">
      <h3 class="dash-repo__name">{{ repo.full_name || repo.name }}</h3>
      <p v-if="!compact" class="dash-repo__desc">
        {{ repo.description }}
      </p>
      <div class="dash-repo__meta">
        <span class="dash-repo__lang">
          <span class="lang-dot" :class="langClass" aria-hidden="true" />
          {{ repo.language || 'Unknown' }}
        </span>
        <span class="dash-repo__updated">{{ updatedText }}</span>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
.dash-repo {
  position: relative;
  display: flex;
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
    transform: translateY(-2px);
    box-shadow: var(--wd-shadow-pop);
  }

  /* 左侧红色强调条：hover 时从中间生长 */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    bottom: 50%;
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--wd-red);
    opacity: 0;
    transition:
      top $wd-dur-slow $wd-ease-out,
      bottom $wd-dur-slow $wd-ease-out,
      opacity $wd-dur-slow $wd-ease-smooth;
  }
  &:hover::before {
    top: 14px;
    bottom: 14px;
    opacity: 1;
  }
}

.dash-repo__icon {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--wd-tint-2);
  color: var(--wd-red);
}

.dash-repo__body {
  min-width: 0;
  flex: 1;
}

.dash-repo__name {
  margin: 0 0 6px;
  font-size: 15.5px;
  font-weight: 800;
  letter-spacing: -0.015em;
  color: var(--wd-ink);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color $wd-dur-slow $wd-ease-smooth;

  .dash-repo:hover & {
    color: var(--wd-red);
  }
}

.dash-repo__desc {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0 0 10px;
  min-height: calc(1.6em * 2);
  font-size: 13px;
  line-height: 1.6;
  color: var(--wd-ink-2);
}

.dash-repo__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--wd-space-2);
  font-size: 12px;
  color: var(--wd-ink-3);
}

.dash-repo__lang {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.dash-repo__updated {
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.lang-dot {
  width: 8px;
  height: 8px;
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

/* ── 紧凑形态：单行，无描述 ── */
.dash-repo--compact {
  align-items: center;
  gap: var(--wd-space-3);
  padding: var(--wd-space-3) var(--wd-space-4);
  border-radius: var(--wd-radius-md);

  .dash-repo__icon {
    width: 28px;
    height: 28px;
    border-radius: 9px;
  }

  .dash-repo__name {
    margin: 0 0 3px;
    font-size: 13.5px;
  }

  .dash-repo__meta {
    font-size: 11.5px;
  }

  &:hover {
    transform: none;
    box-shadow: var(--wd-shadow-sm);
    background: var(--wd-field);
  }
  &:hover::before {
    top: 10px;
    bottom: 10px;
  }
}
</style>
