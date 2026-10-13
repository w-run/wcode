<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'WdOtp' })

const props = withDefaults(
  defineProps<{
    modelValue?: string
    length?: number
    disabled?: boolean
  }>(),
  { modelValue: '', length: 6, disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

const boxes = ref<HTMLInputElement[]>([])

function charAt(i: number) {
  return props.modelValue[i] || ''
}

function onInput(i: number, e: Event) {
  const el = e.target as HTMLInputElement
  const next = el.value.replace(/\D/g, '').slice(-1)
  const arr = props.modelValue.split('')
  arr[i] = next
  emit('update:modelValue', arr.join('').slice(0, props.length))
  if (next && i < props.length - 1) boxes.value[i + 1]?.focus()
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !charAt(i) && i > 0) {
    const arr = props.modelValue.split('')
    arr[i - 1] = ''
    emit('update:modelValue', arr.join(''))
    boxes.value[i - 1]?.focus()
  }
  if (e.key === 'ArrowLeft' && i > 0) boxes.value[i - 1]?.focus()
  if (e.key === 'ArrowRight' && i < props.length - 1) boxes.value[i + 1]?.focus()
}

function onPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, props.length)
  if (!text) return
  emit('update:modelValue', text)
  boxes.value[Math.min(text.length, props.length - 1)]?.focus()
}
</script>

<template>
  <div class="wd-otp" @paste="onPaste">
    <input
      v-for="i in length"
      :key="i"
      ref="boxes"
      class="wd-otp__box"
      :value="charAt(i - 1)"
      :disabled="disabled"
      inputmode="numeric"
      maxlength="1"
      autocomplete="one-time-code"
      @input="onInput(i - 1, $event)"
      @keydown="onKeydown(i - 1, $event)"
    />
  </div>
</template>
