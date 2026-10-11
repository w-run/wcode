<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getContents, getFileRaw, getRepo, getReadme } from '@/api/repos'
import { decodeContent } from '@/utils/markdown'
import type { Repository } from '@/api/types'
import MinimalTemplate from '@/components/landing/MinimalTemplate.vue'
import TechTemplate from '@/components/landing/TechTemplate.vue'
import EnterpriseTemplate from '@/components/landing/EnterpriseTemplate.vue'
import CardTemplate from '@/components/landing/CardTemplate.vue'
import CustomTemplate from '@/components/landing/CustomTemplate.vue'

const props = defineProps<{
  owner: string
  name: string
}>()

const route = useRoute()
const router = useRouter()

const BUILTIN = [
  { id: 'minimal', label: '极简', component: MinimalTemplate },
  { id: 'tech', label: '科技', component: TechTemplate },
  { id: 'enterprise', label: '企业', component: EnterpriseTemplate },
  { id: 'card', label: '卡片', component: CardTemplate },
] as const

const templateId = ref(
  (route.query.t as string) ||
    localStorage.getItem('landing-template') ||
    'minimal',
)

const repo = ref<Repository | null>(null)
const markdown = ref('')
const hasReadme = ref(true)
const loading = ref(true)
const error = ref<string | null>(null)

// 仓库 .page/*.tpl 自定义模板
const customTpls = ref<string[]>([])
const customTplContent = ref('')

const isCustom = computed(() => templateId.value.startsWith('custom:'))
const customFile = computed(() => templateId.value.slice('custom:'.length))

const activeBuiltin = computed(
  () =>
    BUILTIN.find((t) => t.id === templateId.value)?.component ??
    MinimalTemplate,
)

async function loadCustomTpls() {
  try {
    const items = await getContents(
      props.owner,
      props.name,
      '.page',
      repo.value?.default_branch,
    )
    customTpls.value = items
      .filter((i) => i.type !== 'dir' && i.name?.endsWith('.tpl'))
      .map((i) => i.name as string)
  } catch {
    customTpls.value = []
  }
}

async function loadCustomTpl(file: string) {
  try {
    customTplContent.value = await getFileRaw(
      props.owner,
      props.name,
      repo.value?.default_branch ?? 'main',
      `.page/${file}`,
    )
  } catch {
    customTplContent.value = '<p>模板加载失败</p>'
  }
}

async function load() {
  loading.value = true
  error.value = null
  try {
    repo.value = await getRepo(props.owner, props.name)
    try {
      const readme = await getReadme(props.owner, props.name)
      markdown.value = decodeContent(readme.content, readme.encoding)
      hasReadme.value = true
    } catch {
      hasReadme.value = false
      markdown.value = ''
    }
    await loadCustomTpls()
    if (isCustom.value) await loadCustomTpl(customFile.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : '仓库加载失败'
  } finally {
    loading.value = false
  }
}

async function selectTemplate(id: string) {
  templateId.value = id
  localStorage.setItem('landing-template', id)
  router.replace({ query: { ...route.query, t: id } })
  if (id.startsWith('custom:')) {
    await loadCustomTpl(id.slice('custom:'.length))
  }
}

onMounted(load)
</script>

<template>
  <div class="landing">
    <div v-if="!isCustom" class="landing__bar">
      <div class="landing__switcher" role="tablist" aria-label="选择落地页模板">
        <button
          v-for="t in BUILTIN"
          :key="t.id"
          type="button"
          class="landing__tab"
          :class="{ 'landing__tab--active': t.id === templateId }"
          @click="selectTemplate(t.id)"
        >
          {{ t.label }}
        </button>
        <button
          v-for="f in customTpls"
          :key="f"
          type="button"
          class="landing__tab landing__tab--custom"
          :class="{ 'landing__tab--active': templateId === `custom:${f}` }"
          @click="selectTemplate(`custom:${f}`)"
        >
          {{ f.replace(/\.tpl$/, '') }}
        </button>
      </div>

      <div class="landing__links">
        <a
          v-if="repo?.html_url"
          :href="repo.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="landing__link"
        >
          查看仓库
        </a>
        <router-link :to="`/repos/${owner}/${name}`" class="landing__link">
          打开应用
        </router-link>
      </div>
    </div>

    <button
      v-else
      type="button"
      class="landing__back"
      @click="selectTemplate('minimal')"
    >
      ← 返回内置模板
    </button>

    <template v-if="loading">
      <div class="landing__loading">
        <span v-for="i in 6" :key="i" class="landing__shimmer" />
      </div>
    </template>

    <p v-else-if="error" class="landing__error">
      无法加载仓库 {{ owner }}/{{ name }}
    </p>

    <CustomTemplate
      v-else-if="repo && isCustom"
      :repo="repo"
      :markdown="markdown"
      :has-readme="hasReadme"
      :tpl="customTplContent"
    />

    <component
      :is="activeBuiltin"
      v-else-if="repo"
      :repo="repo"
      :markdown="markdown"
      :has-readme="hasReadme"
    />
  </div>
</template>

<style lang="scss" scoped>
.landing {
  min-height: 100vh;
  background: $color-bg;
}

.landing__bar {
  position: sticky;
  top: 0;
  z-index: $z-sticky;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-3 $space-6;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
}

.landing__switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 3px;
  background: $color-surface-2;
  border-radius: $radius-full;
}

.landing__tab {
  padding: 6px 16px;
  border: none;
  border-radius: $radius-full;
  background: transparent;
  color: $color-text-muted;
  font-size: 13px;
  cursor: pointer;
  transition:
    background $transition-fast,
    color $transition-fast;

  &:hover {
    color: $color-text;
  }

  &--active {
    background: $color-surface;
    color: $color-accent;
    font-weight: 500;
    box-shadow: $shadow-sm;
  }

  &--custom {
    font-style: italic;
  }
}

.landing__links {
  display: flex;
  gap: $space-4;
}

.landing__link {
  font-size: 13px;
  color: $color-text-muted;
  text-decoration: none;

  &:hover {
    color: $color-accent;
  }
}

.landing__back {
  position: fixed;
  top: $space-3;
  left: $space-6;
  z-index: $z-sticky;
  padding: 6px 16px;
  border: none;
  border-radius: $radius-full;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  color: $color-text-muted;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    color: $color-accent;
  }
}

.landing__loading {
  max-width: 720px;
  margin: $space-16 auto 0;
  display: flex;
  flex-direction: column;
  gap: $space-3;
  padding: 0 $space-6;
}

.landing__shimmer {
  height: 18px;
  border-radius: $radius-sm;
  background: $color-surface-2;
  animation: landing-shimmer 1.5s ease-in-out infinite;

  &:nth-child(odd) {
    width: 60%;
  }

  &:nth-child(even) {
    width: 90%;
  }
}

.landing__error {
  padding: $space-16 $space-6;
  color: $color-text-muted;
  text-align: center;
}

@keyframes landing-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
