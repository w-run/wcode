<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WdRadioGroup' })

type Option = string | { label: string; value: string | number }

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    options?: Option[]
    disabled?: boolean
  }>(),
  { modelValue: '', options: () => [], disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()

const items = computed(() =>
  props.options.map((o) => (typeof o === 'string' ? { label: o, value: o } : o)),
)

function pick(value: string | number) {
  if (!props.disabled) emit('update:modelValue', value)
}
</script>

<template>
  <div class="wd-radio-group" role="radiogroup">
    <button
      v-for="o in items"
      :key="o.value"
      type="button"
      role="radio"
      class="wd-radio"
      :class="{ 'wd-radio--checked': modelValue === o.value, 'wd-radio--disabled': disabled }"
      :aria-checked="modelValue === o.value"
      :disabled="disabled"
      @click="pick(o.value)"
    >
      <span class="wd-radio__dot"><span class="wd-radio__inner"></span></span>
      <span class="wd-radio__label">{{ o.label }}</span>
    </button>
  </div>
</template>
