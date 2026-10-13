<script setup>
// 全屏弹出层：包住代码浏览器（左资源管理器 + 右内容）
import { onMounted, onBeforeUnmount } from 'vue'
import Code from '../pages/Code.vue'

const props = defineProps({
  owner: { type: String, required: true },
  repo: { type: String, required: true },
  branch: { type: String, default: '' },
})
const emit = defineEmits(['close'])

function onKey(e) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.documentElement.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div class="cov">
    <div class="cov__backdrop" @click="emit('close')"></div>
    <div class="cov__panel" role="dialog" aria-modal="true" :aria-label="`${repo} 代码浏览器`">
      <Code :owner="owner" :repo="repo" :branch="branch" overlay @close="emit('close')" />
    </div>
  </div>
</template>