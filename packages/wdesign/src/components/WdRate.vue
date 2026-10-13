<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'WdRate' })

const props = withDefaults(
  defineProps<{
    modelValue?: number
    count?: number
    disabled?: boolean
  }>(),
  { modelValue: 0, count: 5, disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: number): void }>()

const hover = ref(-1)

function pick(i: number) {
  if (props.disabled) return
  emit('update:modelValue', props.modelValue === i + 1 ? 0 : i + 1)
}
</script>

<template>
  <div class="wd-rate" :class="{ 'wd-rate--disabled': disabled }" @mouseleave="hover = -1">
    <button
      v-for="i in count"
      :key="i"
      type="button"
      class="wd-rate__item"
      :class="{ 'wd-rate__item--on': i <= (hover >= 0 ? hover + 1 : modelValue) }"
      :aria-label="`评分 ${i} 星`"
      @mouseenter="hover = i - 1"
      @click="pick(i - 1)"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.8l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 16.9l-5.6 2.9 1.2-6.2L3 9.3l6.3-.8z"></path></svg>
    </button>
  </div>
</template>
