<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getFileRaw } from '@/api/repos'
import CodeViewer from '@/components/code/CodeViewer.vue'

const props = defineProps<{
  owner: string
  name: string
  refName?: string
  path?: string | string[]
}>()

const filePath = computed(() =>
  Array.isArray(props.path) ? props.path.join('/') : (props.path ?? ''),
)
const filename = computed(() => filePath.value.split('/').pop() ?? '')

const code = ref('')
const loading = ref(true)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    code.value = await getFileRaw(
      props.owner,
      props.name,
      props.refName ?? 'main',
      filePath.value,
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
    code.value = ''
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.owner, props.name, props.refName, filePath.value] as const,
  load,
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="blob">
    <nav class="blob__crumbs" aria-label="路径">
      <router-link
        :to="`/repos/${owner}/${name}/tree/${refName ?? 'main'}`"
        class="blob__crumb"
      >
        {{ name }}
      </router-link>
      <span
        v-for="(seg, i) in filePath.split('/')"
        :key="i"
        class="blob__crumb"
      >
        {{ seg }}
      </span>
    </nav>

    <div v-if="loading" class="blob__skeleton">
      <span v-for="i in 12" :key="i" class="blob__line" />
    </div>

    <p v-else-if="error" class="blob__error">{{ error }}</p>

    <CodeViewer v-else :code="code" :filename="filename" />
  </div>
</template>

<style lang="scss" scoped>
.blob {
  max-width: 960px;
  margin: 0 auto;
}

.blob__crumbs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: var(--wd-space-3);
  font-size: 13px;
}

.blob__crumb {
  color: var(--wd-ink-2);
  text-decoration: none;

  & + .blob__crumb::before {
    content: '/';
    margin-right: 4px;
    opacity: 0.4;
  }

  &:last-child {
    color: var(--wd-ink);
    font-weight: 500;
  }

  &:hover {
    color: var(--wd-red);
  }
}

.blob__skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--wd-space-6);
  background: var(--wd-card);
  border-radius: var(--wd-radius-lg);
}

.blob__line {
  display: block;
  height: 12px;
  border-radius: var(--wd-radius-sm);
  background: var(--wd-field);
  animation: blob-shimmer 1.5s ease-in-out infinite;
}

.blob__line:nth-child(odd) {
  width: 70%;
}

.blob__error {
  padding: var(--wd-space-8);
  color: var(--wd-ink-2);
  text-align: center;
}

@keyframes blob-shimmer {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>
