<script setup lang="ts">
import { computed, watchEffect } from 'vue'

defineOptions({ name: 'WdModal' })

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    title?: string
    width?: number | string
    closeOnMask?: boolean
  }>(),
  { modelValue: false, title: '', width: 440, closeOnMask: true },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const maxWidth = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width,
)

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
    <Transition name="wd-modal-fade">
    <div v-if="modelValue" class="wd-modal" role="dialog" aria-modal="true">
      <div class="wd-modal__mask" @click="closeOnMask && close()"></div>
      <div class="wd-modal__panel" :style="{ maxWidth }">
        <div class="wd-modal__head">
          <div class="wd-modal__title">{{ title }}</div>
          <button type="button" class="wd-icon-btn" aria-label="关闭" @click="close">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"></path></svg>
          </button>
        </div>
        <div class="wd-modal__body"><slot /></div>
        <div v-if="$slots.footer" class="wd-modal__foot"><slot name="footer" /></div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
