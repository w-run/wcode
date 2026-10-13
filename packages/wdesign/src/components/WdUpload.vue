<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'WdUpload' })

export interface WdUploadFile {
  name: string
  size: number
  percent: number
}

const props = withDefaults(
  defineProps<{
    accept?: string
    multiple?: boolean
    hint?: string
  }>(),
  { accept: '*', multiple: false, hint: '' },
)

const emit = defineEmits<{ (e: 'change', files: WdUploadFile[]): void }>()

const files = ref<WdUploadFile[]>([])
const dragging = ref(false)
const input = ref<HTMLInputElement>()

function fmtSize(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1048576).toFixed(1)} MB`
}

function addFiles(list: FileList | File[]) {
  for (const f of Array.from(list)) {
    if (!props.multiple && files.value.length >= 1) files.value = []
    const item: WdUploadFile = { name: f.name, size: f.size, percent: 0 }
    files.value.push(item)
    emit('change', files.value)
    // 演示进度：接入真实上传时替换为实际进度
    const timer = window.setInterval(() => {
      item.percent = Math.min(100, item.percent + Math.round(12 + Math.random() * 16))
      if (item.percent >= 100) window.clearInterval(timer)
    }, 120)
  }
}

function openPicker() {
  input.value?.click()
}
function onPick(e: Event) {
  const target = e.target as HTMLInputElement
  addFiles(target.files || [])
  target.value = ''
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragging.value = false
  if (e.dataTransfer) addFiles(e.dataTransfer.files)
}
function remove(i: number) {
  files.value.splice(i, 1)
  emit('change', files.value)
}
</script>

<template>
  <div class="wd-upload">
    <div
      class="wd-upload__zone"
      :class="{ 'wd-upload__zone--over': dragging }"
      @click="openPicker"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop="onDrop"
    >
      <span class="wd-upload__icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4m0 0-4 4m4-4 4 4"></path><path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"></path></svg>
      </span>
      <span class="wd-upload__hint"><strong>点击选择</strong> 或拖拽文件到这里</span>
      <span v-if="hint" class="wd-upload__hint">{{ hint }}</span>
      <span class="wd-upload__browse">浏览文件</span>
      <input ref="input" class="wd-upload__input" type="file" :accept="accept" :multiple="multiple" @change="onPick" />
    </div>

    <div v-if="files.length" class="wd-upload__list">
      <div v-for="(f, i) in files" :key="i" class="wd-upload__item">
        <span class="wd-upload__file-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4a2 2 0 0 1 2-2h6.6L20 7.4V20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"></path></svg>
        </span>
        <div class="wd-upload__info">
          <div class="wd-upload__name">{{ f.name }}</div>
          <div class="wd-upload__meta">{{ fmtSize(f.size) }} · {{ f.percent >= 100 ? '已完成' : '上传中 ' + f.percent + '%' }}</div>
          <div v-if="f.percent < 100" class="wd-upload__progress">
            <span class="wd-upload__progress-bar" :style="{ width: f.percent + '%' }"></span>
          </div>
        </div>
        <button type="button" class="wd-upload__remove" aria-label="移除" @click.stop="remove(i)">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>
