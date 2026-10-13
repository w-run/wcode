<script setup lang="ts">
defineOptions({ name: 'WdSwitch' })

withDefaults(
  defineProps<{
    modelValue?: boolean
    disabled?: boolean
  }>(),
  { modelValue: false, disabled: false },
)

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <button
    type="button"
    role="switch"
    class="wd-switch"
    :class="{ 'wd-switch--off': !modelValue }"
    :aria-checked="modelValue"
    :disabled="disabled"
    @click="emit('update:modelValue', !modelValue)"
  >
    <span class="wd-switch__knob"></span>
  </button>
</template>
