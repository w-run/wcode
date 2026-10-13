<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'WdAlert' })

withDefaults(
  defineProps<{
    variant?: 'info' | 'success' | 'warning' | 'danger'
    title?: string
    description?: string
    closable?: boolean
  }>(),
  { variant: 'info', title: '', description: '', closable: false },
)

const emit = defineEmits<{ (e: 'close'): void }>()

const visible = ref(true)

function close() {
  visible.value = false
  emit('close')
}
</script>

<template>
  <div v-if="visible" class="wd-alert" :class="`wd-alert--${variant}`" role="alert">
    <span class="wd-alert__icon wd-dot wd-dot--lg" :class="`wd-dot--${variant}`"></span>
    <div class="wd-alert__body">
      <div v-if="title" class="wd-alert__title">{{ title }}</div>
      <div v-if="description || $slots.default" class="wd-alert__desc">
        <slot>{{ description }}</slot>
      </div>
    </div>
    <button v-if="closable" type="button" class="wd-alert__close" aria-label="关闭" @click="close">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
    </button>
  </div>
</template>
