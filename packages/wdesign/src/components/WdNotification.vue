<script setup lang="ts">
import { watchEffect } from 'vue'

defineOptions({ name: 'WdNotification' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    description?: string
    variant?: 'info' | 'success' | 'warning' | 'danger'
  }>(),
  { modelValue: false, title: '', description: '', variant: 'info' },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

function close() {
  emit('update:modelValue', false)
}

watchEffect((onCleanup) => {
  if (!props.modelValue) return
  const fn = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  document.addEventListener('keydown', fn)
  onCleanup(() => document.removeEventListener('keydown', fn))
})
</script>

<template>
  <Teleport to="body">
    <Transition name="wd-notification-fade">
      <div v-if="modelValue" class="wd-notification" :class="`wd-notification--${variant}`" role="alert">
        <span class="wd-notification__icon wd-dot wd-dot--lg" :class="`wd-dot--${variant}`"></span>
        <div class="wd-notification__body">
          <div v-if="title" class="wd-notification__title">{{ title }}</div>
          <div v-if="description || $slots.default" class="wd-notification__desc"><slot>{{ description }}</slot></div>
        </div>
        <button type="button" class="wd-icon-btn wd-icon-btn--ghost wd-icon-btn--sm" aria-label="关闭" @click="close">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
