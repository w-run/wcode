<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdSlider' })

const props = withDefaults(
  defineProps<{
    modelValue?: number
    min?: number
    max?: number
    step?: number
    showValue?: boolean
  }>(),
  { modelValue: 0, min: 0, max: 100, step: 1, showValue: true },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const percent = computed(() => {
  const span = props.max - props.min || 1
  return Math.max(0, Math.min(100, ((props.modelValue - props.min) / span) * 100))
})

const trackStyle = computed(() => ({
  background: `linear-gradient(to right, var(--wd-red) 0%, var(--wd-red) ${percent.value}%, var(--wd-tint-2) ${percent.value}%, var(--wd-tint-2) 100%)`,
}))

function onInput(e: Event) {
  emit('update:modelValue', Number((e.target as HTMLInputElement).value))
}
</script>

<template>
  <div class="wd-slider">
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :style="trackStyle"
      @input="onInput"
    />
    <span v-if="showValue" class="wd-slider__value">{{ modelValue }}</span>
  </div>
</template>
