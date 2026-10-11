<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchRepos } from '@/api/repos'
import type { Repository } from '@/api/types'
import RepoCard from '@/components/repository/RepoCard.vue'

const route = useRoute()
const router = useRouter()

const q = ref((route.query.q as string) ?? '')
const results = ref<Repository[]>([])
const searching = ref(false)
const searched = ref(false)
const error = ref<string | null>(null)

const kw = ref(q.value)

let timer: ReturnType<typeof setTimeout> | null = null

async function run() {
  const query = q.value.trim()
  if (!query) {
    results.value = []
    searched.value = false
    return
  }
  searching.value = true
  error.value = null
  try {
    results.value = await searchRepos(query, { limit: 30 })
    searched.value = true
  } catch (err) {
    error.value = err instanceof Error ? err.message : '搜索失败'
    results.value = []
  } finally {
    searching.value = false
  }
}

function submit() {
  if (timer) clearTimeout(timer)
  router.replace({ query: q.value.trim() ? { q: q.value.trim() } : {} })
  run()
}

onMounted(() => {
  if (q.value.trim()) run()
})

watch(kw, () => {
  q.value = kw.value
  if (timer) clearTimeout(timer)
  timer = setTimeout(run, 350)
})
</script>

<template>
  <div class="search">
    <form class="search__form" @submit.prevent="submit">
      <svg
        class="search__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="kw"
        class="search__input"
        type="search"
        placeholder="搜索仓库..."
        autofocus
        aria-label="搜索仓库"
      />
    </form>

    <div v-if="searching" class="search__loading">
      <span v-for="i in 4" :key="i" class="search__card-skel" />
    </div>

    <p v-else-if="error" class="search__empty">{{ error }}</p>

    <template v-else-if="searched">
      <p v-if="results.length" class="search__count">
        共 {{ results.length }} 个结果
      </p>
      <p v-else class="search__empty">未找到与「{{ q }}」相关的仓库</p>

      <div class="search__grid">
        <RepoCard v-for="repo in results" :key="repo.id" :repo="repo" />
      </div>
    </template>

    <p v-else class="search__hint">输入关键词搜索仓库</p>
  </div>
</template>

<style lang="scss" scoped>
.search {
  max-width: 860px;
  margin: 0 auto;
}

.search__form {
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-2 $space-4;
  margin-bottom: $space-6;
  background: $color-surface;
  border-radius: $radius-full;
  box-shadow: $shadow-sm;
}

.search__icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: $color-text-muted;
}

.search__input {
  flex: 1;
  border: none;
  background: transparent;
  color: $color-text;
  font-size: 15px;

  &::placeholder {
    color: $color-text-muted;
  }

  &:focus {
    outline: none;
  }
}

.search__count {
  margin-bottom: $space-4;
  font-size: 13px;
  color: $color-text-muted;
}

.search__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: $space-4;
}

.search__loading {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.search__card-skel {
  height: 100px;
  border-radius: $radius-lg;
  background: $color-surface-2;
  animation: search-shimmer 1.5s ease-in-out infinite;
}

.search__empty,
.search__hint {
  padding: $space-12 0;
  color: $color-text-muted;
  text-align: center;
}

@keyframes search-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
