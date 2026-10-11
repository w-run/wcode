<script setup lang="ts">
import { ref, watch } from 'vue'
import { highlight, langFromFilename } from '@/utils/highlight'

const props = defineProps<{
  code: string
  filename?: string
}>()

const html = ref('')
const copied = ref(false)

async function render() {
  if (!props.code) {
    html.value = ''
    return
  }
  html.value = await highlight(props.code, langFromFilename(props.filename))
}

watch(() => [props.code, props.filename] as const, render, { immediate: true })

async function copy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // 剪贴板不可用，忽略
  }
}
</script>

<template>
  <div class="code-viewer">
    <div class="code-viewer__bar">
      <span class="code-viewer__file">{{ filename }}</span>
      <button type="button" class="code-viewer__copy" @click="copy">
        {{ copied ? '已复制' : '复制' }}
      </button>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -- shiki 输出为受控转义 HTML -->
    <pre class="code-viewer__pre"><code v-html="html" /></pre>
  </div>
</template>

<style lang="scss" scoped>
.code-viewer {
  background: $color-surface;
  border-radius: $radius-lg;
  overflow: hidden;
  box-shadow: $shadow-md;
}

.code-viewer__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $space-3;
  padding: $space-2 $space-3 $space-2 $space-4;
  background: $color-surface-2;
}

.code-viewer__file {
  font-family: $font-mono;
  font-size: 12.5px;
  color: $color-text-muted;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.code-viewer__copy {
  flex-shrink: 0;
  padding: $space-1 $space-3;
  border: none;
  border-radius: $radius-full;
  background: $color-surface;
  color: $color-text-muted;
  font-size: 12px;
  cursor: pointer;
  transition:
    background $transition-fast,
    color $transition-fast;

  &:hover {
    background: $color-accent-light;
    color: $color-accent;
  }
}

.code-viewer__pre {
  margin: 0;
  padding: $space-4;
  overflow-x: auto;
  font-family: $font-mono;
  font-size: 13px;
  line-height: 1.7;
  tab-size: 2;

  :deep(code) {
    font-family: inherit;
    counter-reset: line;
  }

  :deep(.line) {
    display: inline-block;
    width: 100%;
  }

  // 行号：CSS 计数器，细体灰色
  :deep(.line)::before {
    counter-increment: line;
    content: counter(line);
    display: inline-block;
    width: 2.5em;
    margin-right: $space-3;
    color: rgba(255, 255, 255, 0.28);
    text-align: right;
    user-select: none;
  }
}
</style>
